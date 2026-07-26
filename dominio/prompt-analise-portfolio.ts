// Catalogação de portfólio por IA — ATIVO PRESERVADO do código original.
//
// O prompt classifica uma imagem de tatuagem em estilo, parte do corpo,
// cores, técnica e tamanho, usando vocabulário controlado (ver
// vocabulario-portfolio.ts). É o que permite busca e matching por estilo.
// Acoplamento com o gateway do Lovable removido — ver ia-provedor.ts.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { modeloVisao } from "./ia-provedor";
import { TATTOO_STYLES } from "./tattoo-styles";
import { BODY_PARTS, COLOR_PALETTE, TECHNIQUES, SIZE_BUCKETS } from "./portfolio-vocab";

const STYLE_SLUGS = TATTOO_STYLES.map((s) => s.slug);
const SIZE_VALUES = SIZE_BUCKETS.map((s) => s.value) as [string, ...string[]];

const AnalysisSchema = z.object({
  styles: z.array(z.string()),
  body_parts: z.array(z.string()),
  colors: z.array(z.string()),
  technique: z.array(z.string()),
  tags: z.array(z.string()),
  size_bucket: z.string().nullable(),
  dominant_color: z.string().nullable(),
  confidence: z.number(),
});

function clampToVocab(values: string[], vocab: readonly string[], max = 5): string[] {
  const lower = new Set(vocab.map((v) => v.toLowerCase()));
  const out: string[] = [];
  for (const raw of values) {
    const v = String(raw).toLowerCase().trim();
    if (lower.has(v) && !out.includes(v)) out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

async function callAnalysisModel(imageUrl: string) {
  const model = modeloVisao();

  const prompt = `Você é um catalogador especialista em tatuagens. Analise a imagem e responda em JSON com estes campos:

- styles: até 3 slugs deste vocabulário: ${STYLE_SLUGS.join(", ")}
- body_parts: até 2 termos deste vocabulário (parte do corpo tatuada): ${BODY_PARTS.join(", ")}
- colors: até 3 termos deste vocabulário: ${COLOR_PALETTE.join(", ")}
- technique: até 3 termos deste vocabulário: ${TECHNIQUES.join(", ")}
- tags: até 8 palavras-chave descritivas livres em português (ex: floral, oriental, retrato, animal, geométrico)
- size_bucket: um de [${SIZE_VALUES.join(", ")}] ou null
- dominant_color: cor dominante em hex (#RRGGBB) ou null
- confidence: número 0..1 da sua confiança geral

Regras: use APENAS termos exatos dos vocabulários listados (não invente sinônimos). Se não conseguir avaliar um campo, devolva array vazio ou null.
Responda SOMENTE com o objeto JSON, sem texto extra e sem cercas de código.`;

  const { text } = await generateText({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image", image: new URL(imageUrl) },
        ],
      },
    ],
  });

  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Resposta da IA sem JSON");
  const output = AnalysisSchema.partial().parse(JSON.parse(cleaned.slice(start, end + 1)));


  return {
    styles: clampToVocab(output.styles ?? [], STYLE_SLUGS, 3),
    body_parts: clampToVocab(output.body_parts ?? [], BODY_PARTS, 2),
    colors: clampToVocab(output.colors ?? [], COLOR_PALETTE, 3),
    technique: clampToVocab(output.technique ?? [], TECHNIQUES, 3),
    tags: (output.tags ?? []).slice(0, 8).map((t) => String(t).toLowerCase().trim()).filter(Boolean),
    size_bucket: output.size_bucket && SIZE_VALUES.includes(output.size_bucket) ? output.size_bucket : null,
    dominant_color:
      output.dominant_color && /^#[0-9a-fA-F]{6}$/.test(output.dominant_color)
        ? output.dominant_color
        : null,
    confidence: Math.max(0, Math.min(1, Number(output.confidence) || 0)),
    raw: output,
  };
}

// ---- analisar 1 item ----

export const analyzePortfolioItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ item_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: item, error } = await supabase
      .from("portfolio_items")
      .select("id, image_url, artist_id, artists!inner(profile_id)")
      .eq("id", data.item_id)
      .maybeSingle();
    if (error || !item) throw new Error("Item não encontrado.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((item as any).artists?.profile_id !== userId) throw new Error("Sem permissão.");

    try {
      const a = await callAnalysisModel(item.image_url);
      const { data: updated, error: upErr } = await supabase
        .from("portfolio_items")
        .update({
          styles: a.styles,
          body_parts: a.body_parts,
          colors: a.colors,
          technique: a.technique,
          tags: a.tags,
          size_bucket: a.size_bucket,
          dominant_color: a.dominant_color,
          ai_confidence: a.confidence,
          ai_analysis: a.raw as never,
          analyzed_at: new Date().toISOString(),
          // se style_slug estava vazio, popular com o top style
          ...(a.styles[0] ? { style_slug: a.styles[0] } : {}),
        } as never)
        .eq("id", item.id)
        .select("*")
        .single();
      if (upErr) throw upErr;
      return { ok: true as const, item: updated };
    } catch (e) {
      // não quebra o upload: item segue sem análise, mas o erro fica auditável
      console.error("[portfolio.analyze] falhou", e);
      return { ok: false as const, error: e instanceof Error ? e.message : "Falha na análise" };
    }

  });

// ---- edição manual dos atributos ----

const UpdateAttrsInput = z.object({
  id: z.string().uuid(),
  styles: z.array(z.string()).max(5).optional(),
  body_parts: z.array(z.string()).max(4).optional(),
  colors: z.array(z.string()).max(5).optional(),
  technique: z.array(z.string()).max(5).optional(),
  tags: z.array(z.string()).max(12).optional(),
  size_bucket: z.enum(SIZE_VALUES).nullable().optional(),
  caption: z.string().max(200).nullable().optional(),
  is_featured: z.boolean().optional(),
});

export const updatePortfolioAttributes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateAttrsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    // se o usuário editou, marcamos confiança máxima e style_slug canônico
    const payload: Record<string, unknown> = { ...patch };
    if (patch.styles && patch.styles.length) {
      payload.style_slug = patch.styles[0];
      payload.ai_confidence = 1;
    }
    const { data: updated, error } = await context.supabase
      .from("portfolio_items")
      .update(payload as never)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

// ---- ler perfil derivado atual ----

export const getDerivedProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase
      .from("artists")
      .select(
        "id, derived_styles, derived_body_parts, derived_color_profile, signature_tags, derived_updated_at",
      )
      .eq("profile_id", userId)
      .maybeSingle();
    return artist;
  });

// ---- reordenar portfólio (drag-and-drop) ----

const ReorderInput = z.object({
  order: z.array(z.string().uuid()).min(1).max(200),
});

export const reorderPortfolio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ReorderInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!artist) throw new Error("Sem perfil de tatuador.");

    // Atualiza position em batch. RLS garante que só itens do próprio artista mudam.
    await Promise.all(
      data.order.map((id, i) =>
        supabase
          .from("portfolio_items")
          .update({ position: i })
          .eq("id", id)
          .eq("artist_id", artist.id),
      ),
    );
    return { ok: true, count: data.order.length };
  });
