// Análise de orçamento por IA — ATIVO PRESERVADO do código original.
//
// O valor aqui é o prompt e o schema de saída: eles codificam conhecimento
// de domínio (como um curador de tatuagem lê uma referência e estima preço
// e tempo) que levaria tempo para reconstruir. O acoplamento com o gateway
// do Lovable foi removido — ver ia-provedor.ts.

import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { TATTOO_STYLES } from "./tattoo-styles";

const StyleSlug = z.enum(TATTOO_STYLES.map((s) => s.slug) as [string, ...string[]]);

const ImageInput = z.object({
  dataUrl: z.string().startsWith("data:image/"),
  kind: z.enum(["reference", "body"]),
});

const QuoteInput = z.object({
  images: z.array(ImageInput).min(1).max(8),
  bodyPart: z.string().max(60).optional(),
  city: z.string().max(80).optional(),
  maxHourlyCents: z.number().int().positive().max(1_000_000).optional(),
  notes: z.string().max(500).optional(),
});

const QuoteOutput = z.object({
  suggestedStyles: z.array(StyleSlug).min(1).max(4),
  complexity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  minHourlyCents: z.number().int().positive(),
  maxHourlyCents: z.number().int().positive(),
  estimatedHours: z.object({ min: z.number().positive(), max: z.number().positive() }),
  rationale: z.string().min(10).max(800),
});

export type QuoteResult = z.infer<typeof QuoteOutput>;

export const analyzeQuoteRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuoteInput.parse(input))
  .handler(async ({ data }) => {
    const { modeloVisao } = await import("./ia-provedor");
    const model = modeloVisao();

    const catalog = TATTOO_STYLES.map(
      (s) =>
        `- ${s.slug} (${s.name}, complexidade ${s.complexity}, R$${s.hourly_min_cents / 100}–${s.hourly_max_cents / 100}/h): ${s.description}`,
    ).join("\n");

    const system = `Você é um curador especialista em tatuagem brasileiro. Recebe imagens de referência e às vezes uma foto do local do corpo. Analisa estilo, complexidade e tamanho e devolve uma sugestão de orçamento usando exclusivamente os estilos do catálogo abaixo.\n\nCATÁLOGO:\n${catalog}\n\nRegras:\n- suggestedStyles: 1 a 3 slugs exatos do catálogo.\n- complexity: 1=Simples, 2=Médio, 3=Complexo, 4=Master.\n- min/maxHourlyCents: faixa em centavos coerente com o catálogo e com a complexidade.\n- estimatedHours: estimativa total de sessão considerando tamanho aparente e local do corpo.\n- rationale: 2 a 4 frases em português explicando a escolha.`;

    const userContent: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    > = [];

    const preferences: string[] = [];
    if (data.bodyPart) preferences.push(`Local do corpo: ${data.bodyPart}`);
    if (data.city) preferences.push(`Cidade: ${data.city}`);
    if (data.maxHourlyCents)
      preferences.push(`Orçamento máximo por hora: R$${(data.maxHourlyCents / 100).toFixed(0)}`);
    if (data.notes) preferences.push(`Notas: ${data.notes}`);

    userContent.push({
      type: "text",
      text:
        `Analise as imagens a seguir e sugira o orçamento.\n` +
        (preferences.length ? preferences.join("\n") : "Sem preferências adicionais."),
    });
    for (const img of data.images) {
      userContent.push({ type: "image", image: img.dataUrl });
    }

    const { output } = await generateText({
      model,
      system,
      messages: [{ role: "user", content: userContent }],
      output: Output.object({ schema: QuoteOutput }),
    });

    return output;
  });
