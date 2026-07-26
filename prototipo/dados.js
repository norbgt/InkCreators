/* ═══════════════════════════════════════════════════════════════════
   CAMADA DE DADOS — liga o protótipo ao Supabase

   O protótipo nasceu com dados fictícios para poder navegar por todas as
   telas, inclusive as que não têm backend nenhum. Este arquivo acrescenta
   um segundo modo: dados reais, vindos do banco.

   A alternância entre os dois é deliberada. Ela torna visível, ao vivo, a
   distância entre o que a interface promete e o que o sistema entrega —
   que é o principal risco do projeto hoje.

   SOBRE A CHAVE ABAIXO
   É a chave publicável, projetada para ficar visível no navegador. Ela não
   dá acesso a nada: quem protege os dados são as políticas de RLS no
   banco. É por isso que testá-las importa tanto.
   A chave secreta (service_role) NUNCA entra aqui — ela ignora todas as
   políticas e só pode existir em servidor.
   ═══════════════════════════════════════════════════════════════════ */

const SUPABASE_URL = "https://hdfigxygektppvlogaoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Hs85aivJIJCba-l4UER1Gw_PI57PJxa";

let sb = null;
let sbErro = null;

async function iniciarSupabase() {
  if (sb) return sb;
  try {
    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );
    sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return sb;
  } catch (e) {
    sbErro = e;
    throw e;
  }
}

/* ── Diagnóstico de conexão ────────────────────────────────────────
   Roda ao entrar em modo real. Reporta com precisão o que falhou, em
   vez de deixar a tela vazia sem explicação. */
async function testarConexao() {
  const r = { ok: false, etapa: "", detalhe: "", tabelas: null, sessao: null };
  try {
    r.etapa = "carregar biblioteca";
    await iniciarSupabase();

    r.etapa = "ler catálogo público";
    const { data: estilos, error: e1 } = await sb
      .from("tattoo_styles")
      .select("slug")
      .limit(50);
    if (e1) throw e1;
    r.tabelas = estilos.length;

    r.etapa = "verificar sessão";
    const { data } = await sb.auth.getSession();
    r.sessao = data.session;

    r.ok = true;
    return r;
  } catch (e) {
    r.detalhe = e?.message || String(e);
    return r;
  }
}

/* ── Autenticação ─────────────────────────────────────────────────── */

async function criarConta(email, senha, nome, querSerTatuador) {
  await iniciarSupabase();
  // wants_artist vai em user_metadata e é lido pelo gatilho handle_new_user
  // no banco, que semeia os papéis. É a decisão 001 em funcionamento.
  const { data, error } = await sb.auth.signUp({
    email,
    password: senha,
    options: {
      data: { display_name: nome, wants_artist: !!querSerTatuador },
    },
  });
  if (error) throw error;
  return data;
}

async function entrar(email, senha) {
  await iniciarSupabase();
  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw error;
  return data;
}

async function sair() {
  await iniciarSupabase();
  await sb.auth.signOut();
}

async function sessaoAtual() {
  await iniciarSupabase();
  const { data } = await sb.auth.getSession();
  return data.session;
}

/* ── Papéis ────────────────────────────────────────────────────────
   Fonte de verdade da autorização. Substitui a inferência por
   convenção que existia no código original. */
async function meusPapeis() {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) return [];
  const { data, error } = await sb
    .from("user_roles")
    .select("role, source")
    .eq("user_id", s.user.id);
  if (error) throw error;
  return data;
}

async function tornarSeTatuador() {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) throw new Error("Precisa estar logado.");
  const { error } = await sb
    .from("user_roles")
    .upsert(
      { user_id: s.user.id, role: "artist", source: "upgrade" },
      { onConflict: "user_id,role" }
    );
  if (error) throw error;
}

/* ── Catálogo público ─────────────────────────────────────────────── */

async function listarEstilos() {
  await iniciarSupabase();
  const { data, error } = await sb
    .from("tattoo_styles")
    .select("*")
    .order("complexity");
  if (error) throw error;
  return data;
}

async function listarTatuadores() {
  await iniciarSupabase();
  // Só artistas publicados são visíveis para quem não é o dono —
  // garantido pela política, não pelo filtro daqui.
  const { data, error } = await sb
    .from("artists")
    .select(
      `id, profile_id, studio_name, years_experience, min_hourly_cents,
       max_hourly_cents, rating_avg, rating_count, is_published,
       instagram_handle, created_at,
       profiles ( display_name, avatar_url, city, state, bio ),
       artist_styles ( style_slug ),
       portfolio_items ( id, image_url, style_slug, position )`
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  return data;
}

/* ── Perfil do tatuador ───────────────────────────────────────────── */

async function meuPerfilDeArtista() {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) return null;
  const { data, error } = await sb
    .from("artists")
    .select(`*, artist_styles ( style_slug ), portfolio_items ( * )`)
    .eq("profile_id", s.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function salvarPerfilDeArtista(dados) {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) throw new Error("Precisa estar logado.");

  const papeis = (await meusPapeis()).map((p) => p.role);
  if (!papeis.includes("artist")) {
    throw new Error(
      "Esta conta não tem papel de tatuador. Use 'Tornar-se tatuador' primeiro."
    );
  }

  await sb.from("profiles").upsert(
    {
      id: s.user.id,
      display_name: dados.nome,
      city: dados.cidade || null,
      state: dados.uf || null,
      bio: dados.bio || null,
    },
    { onConflict: "id" }
  );

  const { data: existente } = await sb
    .from("artists")
    .select("id")
    .eq("profile_id", s.user.id)
    .maybeSingle();

  const carga = {
    profile_id: s.user.id,
    studio_name: dados.estudio || null,
    years_experience: dados.anos || null,
    instagram_handle: dados.instagram || null,
    is_published: !!dados.publicado,
  };

  let artistaId;
  if (existente) {
    const { error } = await sb
      .from("artists")
      .update(carga)
      .eq("id", existente.id);
    if (error) throw error;
    artistaId = existente.id;
  } else {
    const { data, error } = await sb
      .from("artists")
      .insert(carga)
      .select("id")
      .single();
    if (error) throw error;
    artistaId = data.id;
  }

  if (Array.isArray(dados.estilos)) {
    await sb.from("artist_styles").delete().eq("artist_id", artistaId);
    if (dados.estilos.length) {
      const { error } = await sb
        .from("artist_styles")
        .insert(dados.estilos.map((s) => ({ artist_id: artistaId, style_slug: s })));
      if (error) throw error;
    }
  }

  return artistaId;
}

/* ── Orçamentos ───────────────────────────────────────────────────── */

async function criarPedidoDeOrcamento(p) {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) throw new Error("Precisa estar logado.");

  const { data: pedido, error } = await sb
    .from("quote_requests")
    .insert({
      requester_id: s.user.id,
      body_area_label: p.parteDoCorpo || null,
      city: p.cidade || null,
      state: p.uf || null,
      budget_max_hourly_cents: p.tetoPorHora || null,
      ai_suggested_styles: p.estilos || [],
      ai_complexity: p.complexidade || null,
      ai_min_cents: p.minCents || null,
      ai_max_cents: p.maxCents || null,
      ai_rationale: p.justificativa || null,
      est_hours_min: p.horasMin || null,
      est_hours_max: p.horasMax || null,
      notes: p.observacoes || null,
      status: "open",
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      reference_image_urls: [],
    })
    .select("id")
    .single();
  if (error) throw error;

  // Matching: mesma lógica do código original — pontua por estilo e cidade.
  const compativeis = await buscarArtistasCompativeis(p.estilos || [], p.cidade);
  if (compativeis.length) {
    await sb.from("quote_matches").insert(
      compativeis.slice(0, 8).map((a) => ({
        quote_id: pedido.id,
        artist_id: a.id,
        score: Math.min(9.99, a.score),
        status: "pending",
      }))
    );
  }
  return { id: pedido.id, convidados: Math.min(compativeis.length, 8) };
}

async function buscarArtistasCompativeis(estilos, cidade) {
  await iniciarSupabase();
  if (!estilos.length) return [];
  const { data, error } = await sb
    .from("artist_styles")
    .select(`artist_id, style_slug, artists!inner ( id, is_published, profiles ( city ) )`)
    .in("style_slug", estilos)
    .eq("artists.is_published", true);
  if (error) throw error;

  const pontos = new Map();
  const cidadeAlvo = (cidade || "").trim().toLowerCase();
  for (const linha of data || []) {
    const a = linha.artists;
    if (!a) continue;
    let inc = 1;
    const cidadeArtista = (a.profiles?.city || "").toLowerCase();
    if (cidadeAlvo && cidadeArtista.includes(cidadeAlvo)) inc += 1;
    pontos.set(a.id, (pontos.get(a.id) || 0) + inc);
  }
  return [...pontos.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((x, y) => y.score - x.score);
}

async function meusOrcamentos() {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) return [];
  const { data, error } = await sb
    .from("quote_requests")
    .select(
      `id, status, created_at, city, body_area_label, ai_suggested_styles,
       ai_complexity, ai_min_cents, ai_max_cents, notes, expires_at,
       quote_matches ( artist_id, status, offer_cents, message, responded_at, score )`
    )
    .eq("requester_id", s.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function orcamentosDoMeuEstudio() {
  await iniciarSupabase();
  const artista = await meuPerfilDeArtista();
  if (!artista) return [];
  const { data, error } = await sb
    .from("quote_matches")
    .select(
      `artist_id, status, offer_cents, message, responded_at, score,
       quote_requests!inner ( id, status, created_at, city, body_area_label,
         ai_suggested_styles, ai_complexity, ai_min_cents, ai_max_cents, notes )`
    )
    .eq("artist_id", artista.id);
  if (error) throw error;
  return data;
}

async function responderOrcamento(quoteId, valorCents, mensagem) {
  await iniciarSupabase();
  const artista = await meuPerfilDeArtista();
  if (!artista) throw new Error("Perfil de tatuador necessário.");
  const { error } = await sb.from("quote_matches").upsert(
    {
      quote_id: quoteId,
      artist_id: artista.id,
      status: "responded",
      offer_cents: valorCents,
      message: mensagem,
      responded_at: new Date().toISOString(),
    },
    { onConflict: "quote_id,artist_id" }
  );
  if (error) throw error;
  await sb
    .from("quote_requests")
    .update({ status: "matched" })
    .eq("id", quoteId)
    .eq("status", "open");
}

window.Dados = {
  testarConexao, criarConta, entrar, sair, sessaoAtual,
  meusPapeis, tornarSeTatuador,
  listarEstilos, listarTatuadores,
  meuPerfilDeArtista, salvarPerfilDeArtista,
  criarPedidoDeOrcamento, meusOrcamentos, orcamentosDoMeuEstudio,
  responderOrcamento,
};
