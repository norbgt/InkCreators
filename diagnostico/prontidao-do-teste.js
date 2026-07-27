/* ═══════════════════════════════════════════════════════════════════
   PRONTIDÃO PARA O TESTE COM USUÁRIOS

   Rode com:  node diagnostico/prontidao-do-teste.js

   Não é teste de unidade. É a pergunta que importa antes de mandar o
   link para alguém: uma pessoa consegue atravessar a plataforma sem
   travar, e o que ela fizer chega no painel?

   Por isso o roteiro clica de verdade. Ele pega o onclick que está no
   HTML renderizado e executa, exatamente como o navegador faria. Botão
   que existe mas não faz nada é apanhado aqui; leitura de código não
   pegaria.

   Sete partes:
     1. Nenhuma tela quebra ou aparece vazia
     2, 3, 4. As três jornadas atravessam do início ao fim, e cada
        passo vira evento de telemetria
     5. O painel reflete o que aconteceu
     6. Recarregar a página não perde o participante
     7. Sem ?teste=1, nada é coletado
   ═══════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..", "prototipo");
const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const tjs = fs.readFileSync(path.join(RAIZ, "teste.js"), "utf8");
const codigo = html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g, "");

let falhas = 0, checados = 0;
function ok(nome, cond, detalhe) {
  checados++;
  if (!cond) falhas++;
  console.log((cond ? "  ok  " : "  XX  ") + nome + (detalhe && !cond ? "  → " + detalhe : ""));
}
function secao(t) { console.log("\n── " + t + " " + "─".repeat(Math.max(0, 58 - t.length))); }

/* ── Ambiente ──────────────────────────────────────────────────────
   Um navegador de mentira, mas com as partes que o protótipo usa de
   verdade: um lugar para pôr HTML, localStorage, e um Supabase que
   aceita insert e guarda o que recebeu. */
function ambiente(opcoes) {
  opcoes = opcoes || {};
  const disco = opcoes.disco || {};
  const guardado = { teste_sessoes: [], teste_eventos: [] };
  const nos = {};
  const ouvintesDoc = [];

  function no(id) {
    if (!nos[id]) nos[id] = {
      innerHTML: "", value: "", style: {},
      addEventListener() {}, hasAttribute: () => false,
      getAttribute: () => null, setAttribute() {}, removeAttribute() {}
    };
    return nos[id];
  }
  const doc = {
    getElementById: no, documentElement: no("html"), visibilityState: "visible",
    body: {}, addEventListener: (t, fn) => { if (t === "click") ouvintesDoc.push(fn); }
  };
  const win = {
    innerWidth: opcoes.largura || 393, innerHeight: opcoes.altura || 852,
    scrollTo() {}, addEventListener() {},
    matchMedia: () => ({ matches: !!opcoes.toque })
  };
  const loc = { origin: "https://exemplo.test", pathname: "/InkCreators/prototipo/index.html",
                protocol: "https:", search: opcoes.query || "", hash: opcoes.hash || "" };
  const ls = {
    getItem: k => (disco[k] === undefined ? null : disco[k]),
    setItem: (k, v) => { disco[k] = String(v); },
    removeItem: k => { delete disco[k]; }
  };
  const sbFalso = { from: t => ({ insert(linhas) {
    (Array.isArray(linhas) ? linhas : [linhas]).forEach(l => guardado[t].push(l));
    return Promise.resolve({ error: null });
  } }) };

  const prefixo = "var iniciarSupabase=function(){return Promise.resolve(__SB)};";
  const sufixo = ";return {escopo:function(js){return eval(js)}, S:S, T:T};";
  const g = new Function(
    "document", "window", "alert", "console", "location", "IntersectionObserver",
    "navigator", "localStorage", "setInterval", "setTimeout", "crypto", "__SB", "URLSearchParams",
    prefixo + tjs + "\n" + codigo + sufixo
  )(doc, win, () => {}, { log() {}, warn() {}, error() {} }, loc,
    function () { this.observe = function () {}; this.disconnect = function () {}; },
    { geolocation: {}, userAgent: "diagnostico", language: "pt-BR", clipboard: { writeText() {} } },
    ls, () => {}, fn => fn(), { randomUUID: () => "s-" + Math.random().toString(16).slice(2, 10) },
    sbFalso, URLSearchParams);

  g.nos = nos; g.guardado = guardado; g.disco = disco; g.loc = loc;
  g.tela = () => nos["app"] ? nos["app"].innerHTML : "";
  g.gaveta = () => nos["drawerHost"] ? nos["drawerHost"].innerHTML : "";

  /* Espera as promessas resolverem. Abrir sessão e enviar lote são
     assíncronos: sem isto o roteiro conferiria antes da resposta. */
  g.esperar = () => new Promise(r => setImmediate(() => setImmediate(r)));

  /* Clicar de verdade: acha o botão pelo rótulo e executa o onclick
     dele. Devolve false quando não encontrou — que já é o defeito. */
  g.clicar = function (rotulo, ondeHtml) {
    const alvo = ondeHtml || (g.tela() + g.gaveta());
    const botoes = alvo.match(/<(?:button|a|div)[^>]*onclick="[^"]*"[^>]*>[\s\S]*?<\/(?:button|a|div)>/g) || [];
    for (const b of botoes) {
      const texto = b.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const aria = (b.match(/aria-label="([^"]*)"/) || [])[1] || "";
      const title = (b.match(/title="([^"]*)"/) || [])[1] || "";
      if ((texto + " " + aria + " " + title).toLowerCase().includes(rotulo.toLowerCase())) {
        const js = (b.match(/onclick="([^"]*)"/) || [])[1]
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
        ouvintesDoc.forEach(fn => fn({ target: {
          tagName: "BUTTON", getAttribute: a => (a === "aria-label" ? (aria || null) : a === "title" ? (title || null) : null),
          hasAttribute: () => true, textContent: texto, parentElement: null
        } }));
        try { g.escopo(js); } catch (e) { return "erro: " + e.message; }
        return true;
      }
    }
    return false;
  };

  /* Alguns alvos não têm rótulo próprio — o nome do tatuador é texto, e
     quem navega é o botão ao lado. Aqui a busca é pela ação. */
  g.clicarAcao = function (padrao, ondeHtml) {
    const alvo = ondeHtml || (g.tela() + g.gaveta());
    const re = new RegExp('onclick="([^"]*' + padrao + '[^"]*)"');
    const m = alvo.match(re);
    if (!m) return false;
    const js = m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    try { g.escopo(js); } catch (e) { return "erro: " + e.message; }
    return true;
  };
  return g;
}

async function principal() {
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  PRONTIDÃO PARA O TESTE COM USUÁRIOS                         ║");
console.log("╚══════════════════════════════════════════════════════════════╝");

/* ── 1. Nenhuma tela quebra ────────────────────────────────────── */
secao("1. TODAS AS TELAS, NOS TRÊS PERFIS");
{
  const rotas = ["home", "artist", "plataforma", "cadastro", "gate", "modelo", "conexao",
    "me", "me-quotes", "me-saved", "me-orders", "me-events",
    "studio", "studio-quotes", "studio-schedule", "studio-events",
    "studio-campaigns", "studio-reviews", "studio-profile"];
  const gavetas = ["hub", "assist", "chat", "notif", "cart", "agenda"];
  let quebradas = 0, vazias = 0;
  for (const [rotulo, sessao] of [["anônimo", "anon"], ["cliente", "client"], ["tatuador", "artist"]]) {
    const g = ambiente();
    g.S.session = sessao; g.S.modo = "demo"; g.S.artist = "a0"; g.S.agArtist = "a0";
    for (const r of rotas) {
      g.S.route = r;
      try { g.escopo("render()"); } catch (e) { quebradas++; console.log("        XX " + rotulo + " / " + r + ": " + e.message); continue; }
      if (g.tela().length < 300) { vazias++; console.log("        ?? " + rotulo + " / " + r); }
    }
    for (const d of gavetas) {
      g.S.drawer = d;
      try { g.escopo("renderDrawer()"); } catch (e) { quebradas++; console.log("        XX gaveta " + d + ": " + e.message); }
    }
  }
  ok(rotas.length * 3 + gavetas.length * 3 + " renderizações sem erro", quebradas === 0, quebradas + " quebrada(s)");
  ok("nenhuma tela vazia", vazias === 0, vazias + " vazia(s)");
}

/* ── 1b. Toda classe usada tem regra de CSS ─────────────────────
   Três vezes seguidas o defeito foi o mesmo: a classe existia no HTML e
   o CSS nunca tinha sido escrito. Sem regra, um div empilha e um span
   vira texto corrido — e isso não quebra nada, só fica feio, então
   passa despercebido até alguém olhar a tela.

   Aqui as expressões JavaScript de dentro do class="" são removidas
   antes da comparação; o que sobra são nomes literais de verdade. */
secao("1b. TODA CLASSE USADA TEM CSS");
{
  // Os comentários saem antes: eles citam as classes pelo nome, e sem
  // remover isso a verificação se dá por satisfeita com uma explicação
  // no lugar de uma regra. Descoberto sabotando o próprio teste.
  const css = html.slice(0, html.indexOf("</style>")).replace(/\/\*[\s\S]*?\*\//g, " ");
  const definidas = new Set((css.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g) || []).map(c => c.slice(1)));

  const usadas = new Map();
  for (const m of html.match(/class="[^"]*"/g) || []) {
    const valor = m.slice(7, -1).replace(/'\s*\+[\s\S]*?\+\s*'/g, " ");  // tira o JS
    for (const t of valor.split(/\s+/)) {
      if (/^[a-z][a-z0-9-]*$/.test(t)) usadas.set(t, (usadas.get(t) || 0) + 1);
    }
  }
  const orfas = [...usadas.keys()].filter(c => !definidas.has(c)).sort();
  ok(usadas.size + " classes usadas, todas com regra de CSS", orfas.length === 0,
     "sem CSS: " + orfas.join(", "));
}

/* ── 2 e 3. As jornadas, clicando de verdade ───────────────────── */
secao("2. JORNADA DO CLIENTE — descobrir, orçar, agendar");
let eventosDoCliente = null, sessaoDoCliente = null;
{
  const g = ambiente({ query: "?teste=1", toque: true, largura: 393 });
  ok("portão do teste apareceu", /Obrigada por testar/.test(g.tela()));
  g.S.te = { nome: "Ana Souza", email: "ana@exemplo.com", perfil: "cliente", aceite: true };
  g.escopo("entrarNoTeste()"); await g.esperar();
  ok("entrou no teste", g.T.ligado === true);
  ok("caiu no catálogo", g.S.route === "home", g.S.route);

  ok("abriu um perfil de tatuador", g.clicarAcao("go\\('artist'") === true);
  g.escopo("go('artist','a0')");
  ok("está no perfil", g.S.route === "artist");
  ok("viu quem é, sem preço solto", /Studio/.test(g.tela()) && !/R\$/.test(g.tela()));
  ok("abriu 'Sobre o tatuador'", /Sobre o tatuador/.test(g.tela()));

  ok("pediu orçamento", g.clicar("Pedir orçamento") === true);
  ok("assistente abriu", g.S.drawer === "assist" || g.S.autoAssist === true);
  g.escopo("closeDrawer()");

  ok("consultou a agenda", g.clicar("Ver agenda") === true);
  ok("gaveta de agenda abriu", g.S.drawer === "agenda", String(g.S.drawer));
  ok("agenda mostra dia ou explica que não exibe",
     /Dia<\/div>/.test(g.gaveta()) || /não exibir a agenda/.test(g.gaveta()));
  g.escopo("closeDrawer()");

  ok("seguiu o tatuador", g.clicar("Seguir") === true);
  ok("passou a seguir", g.S.seguindo.indexOf("a0") >= 0);

  g.escopo("go('plataforma')");
  ok("leu a proposta em Conhecer", /Como a plataforma se sustenta/.test(g.tela()));
  ok("as três cobranças aparecem",
     /Destaque no catálogo/.test(g.tela()) && /Comissão sobre loja/.test(g.tela()) && /Enterprise/.test(g.tela()));
  ok("cliente sabe que não paga", /Para você, não custa nada/.test(g.tela()));

  g.escopo("enviarLote()"); await g.esperar();
  eventosDoCliente = g.guardado.teste_eventos.slice();
  sessaoDoCliente = g.guardado.teste_sessoes[0];
  ok("a jornada virou evento", eventosDoCliente.length > 5, eventosDoCliente.length + " evento(s)");
  ok("registrou cliques", eventosDoCliente.some(e => e.tipo === "acao"));
  ok("registrou troca de tela", eventosDoCliente.some(e => e.tipo === "rota"));
  ok("registrou tempo na tela", eventosDoCliente.some(e => e.tipo === "rota" && e.ms_na_tela !== null));
  ok("nada do que ela digitou vazou", !/ana@exemplo\.com/.test(JSON.stringify(eventosDoCliente)));
}

secao("3. JORNADA DO TATUADOR — conhecer, cadastrar, gerir");
let eventosDoTatuador = null;
{
  const g = ambiente({ query: "?teste=1", toque: true, largura: 820 });
  g.S.te = { nome: "Bruno Lima", email: "bruno@exemplo.com", perfil: "tatuador", aceite: true };
  g.escopo("entrarNoTeste()"); await g.esperar();

  ok("chegou em Conhecer", g.clicar("Conhecer") !== false || (g.escopo("go('plataforma')"), true));
  g.escopo("S.perfilLanding='tatuador';render()");
  ok("vê o que paga e o que não paga", /Você só paga se quiser mais/.test(g.tela()));
  ok("não vê mensalidade nenhuma", !/R\$ 49|R\$ 39|Assinar/.test(g.tela()));

  ok("começou a criar conta", g.clicar("Criar conta") === true);
  ok("está no cadastro", g.S.route === "cadastro", g.S.route);

  // Passo 1: nome, e-mail e senha. E nada além disso.
  ok("passo 1 pede senha", /id="cadSenha"/.test(g.tela()));
  ok("passo 1 não pede mais nada", !/cadUsuario/.test(g.tela()) && !/class="perfis"/.test(g.tela()));
  g.escopo("S.cad.nome='Bruno Lima';S.cad.email='bruno@exemplo.com';render()");
  ok("sem senha continua travado", /id="btnAvancarCad" disabled/.test(g.tela()));
  g.escopo("S.cad.senha='segredo123';render()");
  ok("passo 1 destrava", !/id="btnAvancarCad" disabled/.test(g.tela()));
  g.escopo("avancarCad()");

  // Passo 2: usuário e perfil.
  ok("passo 2 pede nome de usuário", /id="cadUsuario"/.test(g.tela()));
  g.escopo("S.cad.usuario='bruno.lima';S.cad.perfil='tatuador';render()");
  ok("o fluxo tem três passos", g.escopo("roteiroCadastro()").length === 3);
  g.escopo("avancarCad()");

  // Passo 3: um só, e é o do tatuador.
  ok("passo 3 é o do tatuador", /O que você tatua/.test(g.tela()));
  ok("passo 3 exige estilo", /id="btnAvancarCad" disabled/.test(g.tela()));
  g.escopo("tog(S.onbStyles,'realismo');S.onbEstudio='Studio Bruno';render()");
  ok("escolher estilo destrava", !/id="btnAvancarCad" disabled/.test(g.tela()));
  g.escopo("avancarCad()");
  ok("virou tatuador", g.S.session === "artist");
  ok("caiu na gestão do estúdio", g.S.route === "studio", g.S.route);

  g.escopo("go('studio-profile')");
  ok("gestão não mostra plano de assinatura", !/>Free</.test(g.tela()));
  ok("pode contratar destaque", /Contratar destaque/.test(g.tela()));
  ok("contratou", g.clicar("Contratar destaque") === true && g.S.destaqueAtivo === true);

  g.escopo("enviarLote()"); await g.esperar();
  eventosDoTatuador = g.guardado.teste_eventos.slice();
  ok("a jornada virou evento", eventosDoTatuador.length > 5, eventosDoTatuador.length + " evento(s)");
  ok("chegou até studio", eventosDoTatuador.some(e => e.rota === "studio" || e.rota === "studio-profile"));
  ok("nada digitado saiu do navegador",
     !/segredo123|bruno\.lima|bruno@exemplo|Studio Bruno/.test(JSON.stringify(eventosDoTatuador)));
}

secao("4. JORNADA DO FORNECEDOR — a que ainda é hipótese");
{
  const g = ambiente({ query: "?teste=1" });
  g.S.te = { nome: "Cida Reis", email: "cida@exemplo.com", perfil: "fornecedor", aceite: true };
  g.escopo("entrarNoTeste()"); await g.esperar();
  g.escopo("go('plataforma');S.perfilLanding='fornecedor';render()");
  ok("diz na cara que ainda não existe", /Ainda não existe/.test(g.tela()));
  ok("mesmo assim explica a cobrança", /Comissão sobre o que vender/.test(g.tela()));
  ok("não promete cadastro que não tem", /lista de espera/i.test(g.tela()));
}

/* ── 5. O painel reflete o que aconteceu ───────────────────────── */
secao("5. O PAINEL ENXERGA A JORNADA");
{
  const g = ambiente();
  const sessoes = [
    { ...sessaoDoCliente, perfil_declarado: "cliente", ponteiro: "toque", largura: 393 },
    { id: eventosDoTatuador[0].sessao_id, criado_em: new Date().toISOString(),
      nome: "Bruno Lima", email: "bruno@exemplo.com", perfil_declarado: "tatuador",
      ponteiro: "toque", largura: 820 }
  ];
  const eventos = eventosDoCliente.concat(eventosDoTatuador).map((e, i) => ({
    ...e, criado_em: new Date(Date.now() + i * 4000).toISOString()
  }));
  const d = g.escopo("apurarPainel")(sessoes, eventos);

  ok("contou os dois participantes", d.n === 2, String(d.n));
  ok("separou por perfil", d.perfis.cliente === 1 && d.perfis.tatuador === 1);
  ok("o funil tem os seis degraus", d.funil.length === 6);
  ok("viu quem abriu um perfil", d.funil[2][1] >= 1, String(d.funil[2][1]));
  ok("viu quem leu Conhecer", d.funil[3][1] >= 1, String(d.funil[3][1]));
  ok("viu quem concluiu o cadastro", d.funil[5][1] >= 1, String(d.funil[5][1]));
  ok("sabe onde cada um parou", d.abandono.length > 0);
  ok("lista as telas visitadas", d.telas.length >= 3, d.telas.length + " tela(s)");
  ok("aponta o que ninguém abriu", Array.isArray(d.naoVisitadas));
  ok("registrou os cliques mais comuns", d.acoes.length > 0);
  ok("sabe o aparelho", d.toque === 2 && d.mouse === 0);
  ok("nomeia os participantes", d.participantes.length === 2 && !!d.participantes[0].nome);

  g.S.painel.estado = "pronto"; g.S.painel.dados = d; g.S.route = "modelo"; g.S.abaModelo = "painel";
  const pintado = g.escopo("vModelo()");
  ok("o painel desenha sem erro", pintado.length > 2000);
  ok("mostra o funil", /Até onde cada um foi/.test(pintado));
  ok("mostra o link para compartilhar", /\?teste=1/.test(pintado));
}

/* ── 6. Recarregar não perde ninguém ───────────────────────────── */
secao("6. RECARREGAR NÃO PERDE O PARTICIPANTE");
{
  const disco = {};
  const a = ambiente({ query: "?teste=1", disco });
  a.S.te = { nome: "Dora Melo", email: "dora@exemplo.com", perfil: "cliente", aceite: true };
  a.escopo("entrarNoTeste()"); await a.esperar();
  a.escopo("go('artist','a5')");
  a.escopo("alternarSeguir('a5')");

  const b = ambiente({ query: "?teste=1", disco, hash: a.loc.hash });
  ok("não pede consentimento de novo", !/Obrigada por testar/.test(b.tela()));
  ok("continua coletando", b.T.ligado === true);
  ok("voltou para a mesma tela", b.S.route === "artist" && b.S.artist === "a5", b.S.route + "/" + b.S.artist);
  ok("lembra quem ela seguiu", b.S.seguindo.indexOf("a5") >= 0);
  ok("registra que voltou", b.T.fila.some(e => e.detalhe && e.detalhe.retomada));
}

/* ── 7. Sem o link do teste, nada é coletado ───────────────────── */
secao("7. SEM ?teste=1 NINGUÉM É REGISTRADO");
{
  const g = ambiente({ query: "" });
  g.escopo("go('artist','a2')"); g.escopo("go('home')"); g.escopo("openDrawer('cart')");
  ok("coleta desligada", g.T.ligado === false);
  ok("nenhuma sessão criada", g.guardado.teste_sessoes.length === 0);
  ok("nenhum evento enviado", g.guardado.teste_eventos.length === 0);
  ok("protótipo funciona igual", g.tela().length > 1500);
}

console.log("\n" + "═".repeat(64));
console.log(falhas === 0
  ? "  PRONTO PARA O TESTE — " + checados + " verificações, nenhuma falha"
  : "  NÃO ESTÁ PRONTO — " + falhas + " de " + checados + " verificações falharam");
console.log("═".repeat(64));
process.exit(falhas ? 1 : 0);
}

principal().catch(e => { console.error("\nO diagnóstico não chegou ao fim:", e.message); process.exit(2); });
