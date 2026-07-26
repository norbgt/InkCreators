import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TATTOO_STYLES } from "./tattoo-styles";

const StyleSlug = z.enum(TATTOO_STYLES.map((s) => s.slug) as [string, ...string[]]);

const CreateInput = z.object({
  bodyPart: z.string().max(60).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(60).optional(),
  budgetMaxHourlyCents: z.number().int().positive().max(1_000_000).optional(),
  notes: z.string().max(500).optional(),
  targetArtistId: z.string().uuid().optional(),
  intent: z.enum(["quote", "schedule"]).default("quote"),
  ai: z.object({
    suggestedStyles: z.array(StyleSlug).min(1).max(4),
    complexity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    minHourlyCents: z.number().int().positive(),
    maxHourlyCents: z.number().int().positive(),
    estimatedHours: z.object({ min: z.number().positive(), max: z.number().positive() }),
    rationale: z.string().min(1).max(2000),
  }),
});


export const createQuoteRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Ensure profile row exists (upsert minimal profile)
    await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id" });

    const expiresAt = new Date(Date.now() + 14 * 86_400_000).toISOString();
    const intentPrefix = data.intent === "schedule" ? "[AGENDAMENTO] " : "";
    const composedNotes = `${intentPrefix}${data.notes ?? ""}`.trim() || null;

    const { data: quote, error } = await supabase
      .from("quote_requests")
      .insert({
        requester_id: userId,
        reference_image_urls: [],
        body_area_label: data.bodyPart ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        budget_max_hourly_cents: data.budgetMaxHourlyCents ?? null,
        ai_suggested_styles: data.ai.suggestedStyles,
        ai_complexity: data.ai.complexity,
        ai_min_cents: data.ai.minHourlyCents,
        ai_max_cents: data.ai.maxHourlyCents,
        ai_rationale: data.ai.rationale,
        est_hours_min: data.ai.estimatedHours.min,
        est_hours_max: data.ai.estimatedHours.max,
        notes: composedNotes,
        status: "open",
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (error || !quote) throw new Error(error?.message ?? "Falha ao criar pedido.");

    // Match candidates: artistas publicados que tocam pelo menos um estilo sugerido
    const { data: candidates } = await supabase
      .from("artist_styles")
      .select("artist_id, style_slug, artists!inner(id, city, is_published)")
      .in("style_slug", data.ai.suggestedStyles)
      .eq("artists.is_published", true);

    const scored = new Map<string, number>();
    const cityLower = (data.city ?? "").trim().toLowerCase();
    for (const row of candidates ?? []) {
      const artist = row.artists as unknown as { id: string; city: string | null };
      const prev = scored.get(artist.id) ?? 0;
      let inc = 1;
      if (cityLower && artist.city && artist.city.toLowerCase().includes(cityLower)) inc += 1;
      scored.set(artist.id, prev + inc);
    }

    // Ensure target artist is always invited with top priority
    if (data.targetArtistId) {
      const { data: targetOk } = await supabase
        .from("artists")
        .select("id")
        .eq("id", data.targetArtistId)
        .eq("is_published", true)
        .maybeSingle();
      if (targetOk) scored.set(data.targetArtistId, 9.99);
    }

    const top = [...scored.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    if (top.length > 0) {
      await supabase.from("quote_matches").insert(
        top.map(([artist_id, score]) => ({
          quote_id: quote.id,
          artist_id,
          score: Math.min(9.99, score),
          status: "pending",
        })),
      );
    }

    return { id: quote.id, matches: top.length };
  });


export const listMyQuotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("quote_requests")
      .select(
        `id, status, created_at, city, body_area_label, ai_suggested_styles, ai_complexity,
         ai_min_cents, ai_max_cents, budget_max_hourly_cents, notes, expires_at,
         quote_matches ( artist_id, status, offer_cents, message, responded_at, score,
           artists ( id, studio_name, profiles ( id, display_name, avatar_url ) ) )`,
      )
      .eq("requester_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });


const IdInput = z.object({ id: z.string().uuid() });

export const cancelQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("quote_requests")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("requester_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const MatchInput = z.object({ quote_id: z.string().uuid(), artist_id: z.string().uuid() });

export const acceptMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Guard: user owns the quote
    const { data: q } = await supabase
      .from("quote_requests")
      .select("id")
      .eq("id", data.quote_id)
      .eq("requester_id", userId)
      .maybeSingle();
    if (!q) throw new Error("Pedido não encontrado.");

    await supabase
      .from("quote_matches")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("quote_id", data.quote_id)
      .eq("artist_id", data.artist_id);

    await supabase
      .from("quote_matches")
      .update({ status: "declined" })
      .eq("quote_id", data.quote_id)
      .neq("artist_id", data.artist_id);

    await supabase.from("quote_requests").update({ status: "accepted" }).eq("id", data.quote_id);
    return { ok: true };
  });

export const declineMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("quote_matches")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("quote_id", data.quote_id)
      .eq("artist_id", data.artist_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listStudioQuotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!artist) return [];

    const { data, error } = await supabase
      .from("quote_matches")
      .select(
        `artist_id, status, offer_cents, message, responded_at, score,
         quote_requests!inner ( id, status, created_at, city, body_area_label,
           ai_suggested_styles, ai_complexity, ai_min_cents, ai_max_cents,
           budget_max_hourly_cents, notes, requester_id,
           profiles ( id, display_name, avatar_url ) )`,
      )
      .eq("artist_id", artist.id)
      .order("created_at", { ascending: false, referencedTable: "quote_requests" });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({ ...row, artist_id_self: artist.id }));
  });

const RespondInput = z.object({
  quote_id: z.string().uuid(),
  offer_cents: z.number().int().positive().max(10_000_000),
  message: z.string().min(1).max(1000),
});

export const respondToQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RespondInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!artist) throw new Error("Perfil de tatuador necessário.");

    // Upsert the match row (in case artist wasn't pre-matched)
    const { error } = await supabase.from("quote_matches").upsert(
      {
        quote_id: data.quote_id,
        artist_id: artist.id,
        status: "responded",
        offer_cents: data.offer_cents,
        message: data.message,
        responded_at: new Date().toISOString(),
      },
      { onConflict: "quote_id,artist_id" },
    );
    if (error) throw new Error(error.message);

    // Bump quote status to matched if still open
    await supabase
      .from("quote_requests")
      .update({ status: "matched" })
      .eq("id", data.quote_id)
      .eq("status", "open");

    return { ok: true };
  });
