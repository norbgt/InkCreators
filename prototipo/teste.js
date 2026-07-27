/* ═══════════════════════════════════════════════════════════════════
   TELEMETRIA DO TESTE COM USUÁRIOS

   Ligado só quando o link tem ?teste=1. Fora disso este arquivo não
   faz absolutamente nada — o protótipo continua sendo o protótipo, e
   navegar nele no seu computador não gera dado nenhum.

   O QUE É COLETADO
   Nome, e-mail e perfil declarado, informados pela pessoa na entrada,
   sob consentimento explícito. Depois disso: rota visitada, alvo do
   clique, tempo em cada tela, e o momento da saída.

   O QUE NÃO É COLETADO
   Nada que a pessoa digite nos campos do protótipo. Nenhum IP. Nenhuma
   informação de outra pessoa. O alvo do clique é o rótulo do botão,
   não o conteúdo da tela.

   POR QUE OS EVENTOS VÃO EM LOTE
   Uma requisição por clique deixaria a navegação lenta justamente no
   teste que quer medir se a navegação é boa. O lote sai a cada 6
   segundos, e sempre que a aba é escondida ou fechada.
   ═══════════════════════════════════════════════════════════════════ */

const TESTE_VERSAO = "p1-2026-07-26";
const CHAVE_SESSAO_TESTE = "ink.teste.sessao.v1";
const INTERVALO_ENVIO_MS = 6000;

var T = {
  ligado: false,
  sessao: null,     // { id, nome, email, perfil }
  fila: [],
  ordem: 0,
  rotaAtual: null,
  entrouEm: 0,
  enviando: false,
  falhas: 0
};

/* ── O link do teste ────────────────────────────────────────────────
   ?teste=1 liga a coleta. Qualquer outra forma de abrir o protótipo
   passa longe daqui. */
function testeLigado() {
  try { return new URLSearchParams(location.search).get("teste") === "1"; }
  catch (e) { return false; }
}

function sessaoSalva() {
  try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO_TESTE) || "null"); }
  catch (e) { return null; }
}
function guardarSessao(s) {
  try { localStorage.setItem(CHAVE_SESSAO_TESTE, JSON.stringify(s)); } catch (e) {}
}
function esquecerSessaoLocal() {
  try { localStorage.removeItem(CHAVE_SESSAO_TESTE); } catch (e) {}
}

function novoId() {
  try { if (crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
  // Alternativa para navegador sem randomUUID. Mesmo formato, versão 4.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/* ── Abertura da sessão ─────────────────────────────────────────────
   O id é gerado aqui, no navegador, de propósito: assim o insert não
   precisa devolver nada, e a chave pública não ganha permissão de
   leitura na tabela. */
async function abrirSessaoDeTeste(nome, email, perfil) {
  var s = {
    id: novoId(),
    nome: String(nome).trim(),
    email: String(email).trim().toLowerCase(),
    perfil: perfil
  };
  var linha = {
    id: s.id,
    nome: s.nome,
    email: s.email,
    perfil_declarado: perfil,
    consentimento_em: new Date().toISOString(),
    versao_prototipo: TESTE_VERSAO,
    largura: window.innerWidth,
    altura: window.innerHeight,
    ponteiro: window.matchMedia && window.matchMedia("(pointer:coarse)").matches ? "toque" : "mouse",
    idioma: (navigator.language || "").slice(0, 20),
    user_agent: (navigator.userAgent || "").slice(0, 400)
  };

  var cli = await iniciarSupabase();
  if (!cli) return { ok: false, erro: "Sem conexão com o banco. Tente de novo em instantes." };

  var r = await cli.from("teste_sessoes").insert(linha);
  if (r.error) return { ok: false, erro: traduzErroDeSessao(r.error) };

  T.sessao = s;
  T.ligado = true;
  T.ordem = 0;
  guardarSessao(s);
  registrar("entrada", { rota: (typeof S !== "undefined" ? S.route : null) });
  return { ok: true };
}

function traduzErroDeSessao(e) {
  var m = (e && e.message ? e.message : "").toLowerCase();
  if (m.indexOf("teste_sessoes_email_check") >= 0) return "Esse e-mail não parece válido.";
  if (m.indexOf("teste_sessoes_nome_check") >= 0) return "Escreva seu nome completo.";
  if (m.indexOf("row-level security") >= 0) return "O consentimento não foi registrado. Marque a caixa e tente de novo.";
  return "Não consegui registrar sua entrada: " + (e && e.message ? e.message : "erro desconhecido");
}

/* ── Registro de eventos ────────────────────────────────────────────
   Só entra na fila. Quem conversa com o banco é enviarLote. */
function registrar(tipo, dados) {
  if (!T.ligado || !T.sessao) return;
  dados = dados || {};
  T.fila.push({
    sessao_id: T.sessao.id,
    ordem: T.ordem++,
    tipo: tipo,
    rota: dados.rota != null ? String(dados.rota).slice(0, 60) : null,
    alvo: dados.alvo != null ? String(dados.alvo).slice(0, 120) : null,
    ms_na_tela: dados.ms != null ? Math.min(Math.max(0, Math.round(dados.ms)), 86400000) : null,
    detalhe: dados.detalhe || null
  });
  if (T.fila.length >= 40) enviarLote();
}

/* Troca de tela: fecha o tempo da anterior antes de abrir a nova. */
function registrarRota(rota) {
  if (!T.ligado) return;
  var agora = Date.now();
  if (T.rotaAtual !== null && T.rotaAtual !== rota) {
    registrar("rota", { rota: T.rotaAtual, ms: agora - T.entrouEm, detalhe: { saiu_para: rota } });
    T.rotaAtual = rota; T.entrouEm = agora;
  } else if (T.rotaAtual === null) {
    T.rotaAtual = rota; T.entrouEm = agora;
  }
}

function registrarAcao(alvo, rota) { registrar("acao", { alvo: alvo, rota: rota }); }
function registrarGaveta(nome, rota) { registrar("gaveta", { alvo: nome, rota: rota }); }

async function enviarLote(sincrono) {
  if (!T.ligado || T.enviando || !T.fila.length) return;
  var lote = T.fila.splice(0, T.fila.length);
  T.enviando = true;
  try {
    var cli = await iniciarSupabase();
    if (!cli) throw new Error("sem cliente");
    var r = await cli.from("teste_eventos").insert(lote);
    if (r.error) throw r.error;
    T.falhas = 0;
  } catch (e) {
    // Devolve para a fila e tenta no próximo ciclo. Depois de cinco
    // falhas seguidas, desiste desse lote: insistir para sempre com a
    // aba aberta acumularia memória sem limite.
    T.falhas++;
    if (T.falhas <= 5) T.fila = lote.concat(T.fila);
  } finally {
    T.enviando = false;
  }
}

/* ── Fecho da sessão ────────────────────────────────────────────────
   'pagehide' pega fechar aba, voltar e trocar de app no celular, que
   é onde 'beforeunload' falha. */
function ligarEnvioAutomatico() {
  setInterval(enviarLote, INTERVALO_ENVIO_MS);
  window.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      if (T.rotaAtual !== null) registrar("saida", { rota: T.rotaAtual, ms: Date.now() - T.entrouEm });
      enviarLote();
    } else {
      T.entrouEm = Date.now();
    }
  });
  window.addEventListener("pagehide", function () {
    if (T.rotaAtual !== null) registrar("saida", { rota: T.rotaAtual, ms: Date.now() - T.entrouEm });
    enviarLote();
  });
}

/* ── Captura de cliques ─────────────────────────────────────────────
   Um ouvinte só, na fase de captura, no documento inteiro. Não precisa
   tocar em nenhum botão do protótipo: nada de instrumentar 300 onclick
   à mão, e nada quebra quando um botão novo aparece.

   O rótulo vem de aria-label, title ou do texto — nessa ordem, porque
   os dois primeiros descrevem a intenção e o terceiro às vezes é só um
   ícone. */
function ligarCapturaDeCliques() {
  document.addEventListener("click", function (ev) {
    if (!T.ligado) return;
    var el = ev.target;
    for (var i = 0; i < 6 && el && el !== document.body; i++) {
      if (el.tagName === "BUTTON" || el.tagName === "A" || el.hasAttribute && el.hasAttribute("onclick")) break;
      el = el.parentElement;
    }
    if (!el || el === document.body) return;
    var rot = (el.getAttribute && (el.getAttribute("aria-label") || el.getAttribute("title"))) ||
              (el.textContent || "").trim().replace(/\s+/g, " ");
    if (!rot) rot = el.tagName.toLowerCase();
    registrarAcao(rot.slice(0, 120), typeof S !== "undefined" ? S.route : null);
  }, true);
}

/* ── Tela de entrada ────────────────────────────────────────────────
   Bloqueia o protótipo até haver consentimento. Não é atrito à toa: é
   o que torna a coleta legítima. Cada linha do aviso corresponde a uma
   escolha real do banco — vale conferir contra
   banco/correcoes/19_telemetria_do_teste.md. */
function telaDeEntradaDoTeste() {
  var e = (typeof S !== "undefined" && S.te) ? S.te : {};
  var podeEntrar = !!e.perfil && String(e.nome || "").trim().length > 1 &&
                   /.+@.+\..+/.test(String(e.email || "")) && !!e.aceite;

  var h = '<main><div class="wrap" style="max-width:560px">';
  h += '<div class="row" style="margin-top:14px"><span class="kicker">Teste de usabilidade</span>';
  h += '<button class="iconbtn sp" onclick="fecharConvite()" aria-label="Fechar">✕</button></div>';
  h += '<h1 class="page" style="margin-top:4px">Obrigada por topar</h1>';
  h += '<p class="sub">Você continua navegando do mesmo jeito. A diferença é que passamos a registrar por onde você anda, para descobrir onde a plataforma trava.</p>';

  h += '<div class="card pad" style="margin-top:20px">';
  h += '<div class="b small">Quem é você</div>';
  h += '<div style="margin-top:11px"><label class="lb">Nome</label>';
  h += '<input class="fld" id="teNome" value="' + escapar(e.nome || "") + '" oninput="S.te.nome=this.value;renderEntrada()" placeholder="Como podemos te chamar" /></div>';
  h += '<div style="margin-top:9px"><label class="lb">E-mail</label>';
  h += '<input class="fld" id="teEmail" type="email" value="' + escapar(e.email || "") + '" oninput="S.te.email=this.value;renderEntrada()" placeholder="para voltarmos com perguntas" /></div>';

  h += '<div style="margin-top:13px"><label class="lb">Você chega aqui como</label>';
  h += '<div class="row wrapf" style="gap:7px;margin-top:5px">';
  [["cliente", "Quero me tatuar"], ["tatuador", "Sou tatuador"], ["fornecedor", "Vendo material"]].forEach(function (x) {
    h += '<button class="chip ' + (e.perfil === x[0] ? "on" : "") + '" onclick="S.te.perfil=\'' + x[0] + '\';renderEntrada()">' + x[1] + '</button>';
  });
  h += '</div></div></div>';

  h += '<div class="card pad" style="margin-top:13px">';
  h += '<div class="b small">O que registramos enquanto você navega</div>';
  h += '<div style="margin-top:9px">';
  [["✓", "As telas que você visita, o que você clica e quanto tempo fica em cada uma, a partir de agora"],
   ["✓", "Seu nome, e-mail e o perfil que você escolheu acima"],
   ["✕", "Nada do que você digitar nos campos do protótipo"],
   ["✕", "Seu IP, sua localização, ou qualquer dado de outra pessoa"]
  ].forEach(function (x) {
    var neg = x[0] === "✕";
    h += '<div class="row small" style="align-items:flex-start;margin-bottom:6px">';
    h += '<span style="color:var(--' + (neg ? "muted-foreground" : "x-success") + ')">' + x[0] + '</span>';
    h += '<span' + (neg ? ' class="muted"' : '') + '>' + x[1] + '</span></div>';
  });
  h += '</div>';
  h += '<div class="tiny muted" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">';
  h += 'Isso serve só para melhorar o produto. Nada é vendido nem compartilhado. ';
  h += 'Você pode pedir a exclusão dos seus dados a qualquer momento, respondendo o e-mail de convite — apagamos tudo, sem perguntar por quê.</div>';

  h += '<label class="row" style="align-items:flex-start;gap:9px;margin-top:14px;cursor:pointer">';
  h += '<input type="checkbox" ' + (e.aceite ? "checked" : "") + ' onchange="S.te.aceite=this.checked;renderEntrada()" style="margin-top:2px;width:17px;height:17px" />';
  h += '<span class="small">Li o que está acima e concordo em participar.</span></label>';
  h += '</div>';

  if (e.erro) {
    h += '<div class="banner" style="margin-top:12px;background:var(--x-danger-bg);border-color:var(--x-danger)">';
    h += '<div class="small" style="color:var(--x-danger)">' + escapar(e.erro) + '</div></div>';
  }

  h += '<button class="btn primary blk" style="margin-top:15px" ' + (podeEntrar && !e.enviando ? "" : "disabled") +
       ' onclick="entrarNoTeste()">' + (e.enviando ? "Registrando…" : "Participar do teste") + '</button>';
  h += '<button class="btn blk" style="margin-top:8px" onclick="fecharConvite()">Voltar a navegar</button>';
  h += '<div class="tiny muted" style="margin-top:9px;text-align:center">O registro começa agora — o que você fez até aqui não foi guardado. Pode fechar e voltar depois: a gente lembra de onde você parou.</div>';

  return h + '</div></main>';
}

/* escapar() vive no index.html: o cadastro depende dela e este arquivo
   é opcional. Deixar as duas cópias convidava a divergirem. */
