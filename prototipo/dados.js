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

// Limite de teste durante o desenvolvimento. Não é regra de produto.
const LIMITE_UPLOAD_POR_CONTA = 1;

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

async function criarConta(email, senha, nome, querSerTatuador, extras) {
  await iniciarSupabase();
  extras = extras || {};
  // wants_artist vai em user_metadata e é lido pelo gatilho handle_new_user
  // no banco, que semeia os papéis. É a decisão 001 em funcionamento.
  const { data, error } = await sb.auth.signUp({
    email,
    password: senha,
    options: {
      data: { display_name: nome, wants_artist: !!querSerTatuador },
      // Para onde o link do e-mail devolve a pessoa. Sem isto o Supabase
      // usa a Site URL do painel, que por padrão é localhost:3000 — e o
      // link chega quebrado para quem confirma do celular.
      emailRedirectTo: enderecoDeRetorno(),
    },
  });
  if (error) throw error;

  // O cadastro de três passos coleta nome de usuário e, para o cliente,
  // cidade e UF. Isso não cabe no signUp: vai para o perfil logo depois,
  // com a sessão que o próprio signUp devolveu.
  const campos = {};
  if (extras.usuario) campos.handle = String(extras.usuario).toLowerCase();
  if (extras.cidade) campos.city = extras.cidade;
  if (extras.uf) campos.state = String(extras.uf).toUpperCase().slice(0, 2);
  if (Object.keys(campos).length && data && data.user) {
    const r = await sb.from("profiles").update(campos).eq("id", data.user.id);
    if (r.error) throw new Error(traduzErroDePerfil(r.error));
  }
  if (extras.tambemFornecedor) await acrescentarPapel("supplier");
  return data;
}

function traduzErroDePerfil(e) {
  const m = (e && e.message ? e.message : "").toLowerCase();
  if (m.includes("profiles_handle_key") || m.includes("duplicate key"))
    return "Esse nome de usuário já está em uso.";
  if (m.includes("profiles_handle_formato"))
    return "Nome de usuário inválido: 3 a 20 caracteres, minúsculas, números, ponto e traço baixo.";
  if (m.includes("reservado"))
    return "Esse nome de usuário é reservado.";
  return e && e.message ? e.message : "Não consegui salvar o perfil.";
}

/* ── Nome de usuário ───────────────────────────────────────────────
   Consulta antes de tentar gravar, para a pessoa saber enquanto digita.
   A palavra final continua sendo do banco: o índice único e o gatilho
   de reservados decidem, e duas pessoas digitando o mesmo nome ao mesmo
   tempo só descobrem lá. */
async function usuarioDisponivel(handle) {
  await iniciarSupabase();
  const h = String(handle || "").toLowerCase();
  if (!/^[a-z0-9._]{3,20}$/.test(h)) return { livre: false, motivo: "formato" };

  const res = await sb.from("handles_reservados").select("handle").eq("handle", h).maybeSingle();
  if (res.data) return { livre: false, motivo: "reservado" };

  const p = await sb.from("profiles").select("id").eq("handle", h).maybeSingle();
  if (p.error && p.error.code !== "PGRST116") throw p.error;
  return { livre: !p.data, motivo: p.data ? "ocupado" : null };
}

/* ── Papéis ────────────────────────────────────────────────────────
   Acrescentar papel, nunca criar conta. Quem vende material e também
   tatua é uma pessoa só; duas contas deixariam as duas pela metade. */
async function acrescentarPapel(papel) {
  await iniciarSupabase();
  const { data, error } = await sb.rpc("acrescentar_meu_papel", { _papel: papel });
  if (error) throw error;
  return data;
}
async function removerPapel(papel) {
  await iniciarSupabase();
  const { data, error } = await sb.rpc("remover_meu_papel", { _papel: papel });
  if (error) throw error;
  return data;
}

/* ── Confirmação de e-mail ─────────────────────────────────────────
   O Supabase envia o e-mail sozinho quando "Confirm email" está ligado
   no painel. O que cabe a nós é três coisas: dizer para onde o link
   volta, saber se a pessoa confirmou, e dar um jeito de reenviar. */
function enderecoDeRetorno() {
  try {
    // Volta para a mesma página de onde a pessoa se cadastrou, na área
    // de gestão, que é onde o aviso de pendência vive.
    return location.origin + location.pathname + "#/studio-profile";
  } catch (e) {
    return undefined;
  }
}

async function emailConfirmado() {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s || !s.user) return null;            // ninguém logado: não se aplica
  return !!s.user.email_confirmed_at;
}

async function reenviarConfirmacao(email) {
  await iniciarSupabase();
  const s = await sessaoAtual();
  const alvo = email || (s && s.user ? s.user.email : null);
  if (!alvo) throw new Error("Não sei para qual e-mail reenviar.");

  const { error } = await sb.auth.resend({
    type: "signup",
    email: alvo,
    options: { emailRedirectTo: enderecoDeRetorno() },
  });
  if (error) throw new Error(traduzErroDeEnvio(error));
  return alvo;
}

/* O erro mais provável aqui não é bug: é limite de envio. O provedor
   embutido do Supabase manda 2 e-mails por hora no projeto inteiro, e
   uma segunda tentativa em menos de 60 segundos também é recusada.
   Dizer isso com clareza evita que a pessoa fique clicando. */
function traduzErroDeEnvio(e) {
  const m = (e && e.message ? e.message : "").toLowerCase();
  if (m.includes("rate limit") || m.includes("too many") || m.includes("60 seconds"))
    return "Limite de envio atingido. Espere um minuto e tente de novo — " +
           "e se persistir, é o limite de 2 e-mails por hora do provedor padrão.";
  if (m.includes("already confirmed"))
    return "Este e-mail já foi confirmado. Recarregue a página.";
  return e && e.message ? e.message : "Não consegui reenviar agora.";
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

/* ── Portfólio ─────────────────────────────────────────────────────
   O caminho do arquivo começa com o id do usuário porque a política de
   storage compara a primeira pasta do caminho com quem está enviando.
   Sem isso, o upload é recusado. */

async function enviarImagemDoPortfolio(arquivo, estiloSlug) {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) throw new Error("Precisa estar logado.");

  const artista = await meuPerfilDeArtista();
  if (!artista) throw new Error("Salve o perfil antes de subir imagens.");

  if (!arquivo.type.startsWith("image/")) {
    throw new Error("Só imagens são aceitas.");
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    throw new Error(
      "Imagem acima de 5 MB. O limite é do bucket, definido na migração."
    );
  }

  // Limite de teste, não regra de produto. Existe para exercitar o fluxo
  // completo de upload sem acumular arquivos durante o desenvolvimento.
  // Quando o produto for para valer, este bloco sai.
  const { count } = await sb
    .from("portfolio_items")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", artista.id);
  if ((count || 0) >= LIMITE_UPLOAD_POR_CONTA) {
    throw new Error(
      `Limite de teste atingido: ${LIMITE_UPLOAD_POR_CONTA} arquivo por conta. ` +
        `Remova o existente para enviar outro.`
    );
  }

  const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase();
  const caminho = `${s.user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: erroUp } = await sb.storage
    .from("portfolio")
    .upload(caminho, arquivo, { cacheControl: "3600", upsert: false });
  if (erroUp) throw erroUp;

  const { data: pub } = sb.storage.from("portfolio").getPublicUrl(caminho);

  const { data: itens } = await sb
    .from("portfolio_items")
    .select("position")
    .eq("artist_id", artista.id)
    .order("position", { ascending: false })
    .limit(1);
  const proxima = itens?.length ? (itens[0].position || 0) + 1 : 0;

  const { data, error } = await sb
    .from("portfolio_items")
    .insert({
      artist_id: artista.id,
      image_url: pub.publicUrl,
      style_slug: estiloSlug || null,
      position: proxima,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function listarMeuPortfolio() {
  await iniciarSupabase();
  const artista = await meuPerfilDeArtista();
  if (!artista) return [];
  const { data, error } = await sb
    .from("portfolio_items")
    .select("*")
    .eq("artist_id", artista.id)
    .order("position");
  if (error) throw error;
  return data;
}

async function removerDoPortfolio(itemId, imageUrl) {
  await iniciarSupabase();
  const { error } = await sb.from("portfolio_items").delete().eq("id", itemId);
  if (error) throw error;
  // Remove também o arquivo, senão fica lixo ocupando espaço no bucket
  try {
    const m = imageUrl.match(/\/portfolio\/(.+)$/);
    if (m) await sb.storage.from("portfolio").remove([m[1]]);
  } catch (e) {
    /* o registro já saiu; arquivo órfão não quebra nada */
  }
}

/* ── Tabela de preços ──────────────────────────────────────────────
   artist_pricing existe desde a migração 05 e nunca foi usada por
   interface nenhuma. É ela que sustenta a estimativa mostrada ao
   cliente no perfil público. */

async function listarMeusPrecos() {
  await iniciarSupabase();
  const artista = await meuPerfilDeArtista();
  if (!artista) return [];
  const { data, error } = await sb
    .from("artist_pricing")
    .select("*")
    .eq("artist_id", artista.id)
    .order("style_slug");
  if (error) throw error;
  return data;
}

async function salvarPreco(p) {
  await iniciarSupabase();
  const artista = await meuPerfilDeArtista();
  if (!artista) throw new Error("Perfil de tatuador necessário.");
  if (p.maxCents < p.minCents) {
    throw new Error("O valor máximo não pode ser menor que o mínimo.");
  }
  const { error } = await sb.from("artist_pricing").upsert(
    {
      artist_id: artista.id,
      style_slug: p.estilo,
      size_bucket: p.tamanho,
      min_cents: p.minCents,
      max_cents: p.maxCents,
      hours_estimate: p.horas || null,
      notes: p.observacao || null,
    },
    { onConflict: "artist_id,style_slug,size_bucket" }
  );
  if (error) throw error;
}

async function removerPreco(id) {
  await iniciarSupabase();
  const { error } = await sb.from("artist_pricing").delete().eq("id", id);
  if (error) throw error;
}

/* ── Painel do teste ───────────────────────────────────────────────
   Só admin lê. A RLS já garante isso no banco — a checagem aqui é para
   dar mensagem decente em vez de devolver lista vazia sem explicação. */
async function souAdmin() {
  const papeis = await meusPapeis();
  return papeis.some((p) => p.role === "admin");
}

async function carregarPainelDoTeste() {
  await iniciarSupabase();
  const s = await sessaoAtual();
  if (!s) return { erro: "entre" };
  if (!(await souAdmin())) return { erro: "sem-permissao" };

  const [ses, ev] = await Promise.all([
    sb.from("teste_sessoes")
      .select("id,criado_em,nome,email,perfil_declarado,largura,altura,ponteiro,versao_prototipo")
      .order("criado_em", { ascending: false })
      .limit(2000),
    sb.from("teste_eventos")
      .select("sessao_id,criado_em,ordem,tipo,rota,alvo,ms_na_tela,detalhe")
      .order("sessao_id")
      .order("ordem")
      .limit(50000),
  ]);
  if (ses.error) throw ses.error;
  if (ev.error) throw ev.error;
  return { sessoes: ses.data, eventos: ev.data };
}

/* Exclusão a pedido do titular. A função no banco recusa quem não for
   admin, então isto aqui é só o atalho. */
async function esquecerParticipante(email) {
  await iniciarSupabase();
  const { data, error } = await sb.rpc("esquecer_participante", { _email: email });
  if (error) throw error;
  return data;
}

window.Dados = {
  testarConexao, criarConta, entrar, sair, sessaoAtual,
  souAdmin, carregarPainelDoTeste, esquecerParticipante,
  usuarioDisponivel, acrescentarPapel, removerPapel,
  emailConfirmado, reenviarConfirmacao,
  meusPapeis, tornarSeTatuador,
  listarEstilos, listarTatuadores,
  meuPerfilDeArtista, salvarPerfilDeArtista,
  enviarImagemDoPortfolio, listarMeuPortfolio, removerDoPortfolio,
  listarMeusPrecos, salvarPreco, removerPreco,
  criarPedidoDeOrcamento, meusOrcamentos, orcamentosDoMeuEstudio,
  responderOrcamento,
};
