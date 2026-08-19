/* ═══════════════════════════════════════════════════════════════════
   NADA SE PERDEU

   Rode com:  node diagnostico/nada-se-perdeu.js

   O facelift tinha uma condição: simplificar a visualização sem perder
   nada. Promessa dessas não se cumpre com boa intenção — se cumpre
   comparando o antes com o depois, e é isso que este roteiro faz.

   COMO ELE FUNCIONA
   Monta duas vezes o protótipo inteiro: a interface #1, congelada em
   backups/interface-1/index-interface-1.html, e a #2, que está no ar.
   Renderiza cada rota em cada papel nas duas, extrai o texto visível, e
   pergunta: existe alguma frase que a #1 mostrava e a #2 não mostra
   mais?

   POR QUE TEXTO, E NÃO ESTRUTURA
   Porque é o que a pessoa perde. Uma classe de CSS que muda de nome não
   é perda; um botão que sumiu, uma explicação que evaporou, um número
   que deixou de aparecer — isso é. Texto visível é a medida mais
   próxima do que existe para quem usa.

   O QUE FAZER QUANDO ELE ACUSA
   Ou a frase volta, ou ela entra em SAIRAM_DE_PROPOSITO com o motivo
   escrito. Não há terceira opção — e é a lista de motivos que impede
   este roteiro de virar carimbo.
   ═══════════════════════════════════════════════════════════════════ */

var fs = require("fs");
var path = require("path");
var RAIZ = path.join(__dirname, "..");

var ANTES = path.join(RAIZ, "backups", "interface-1", "index-interface-1.html");
var AGORA = path.join(RAIZ, "prototipo", "index.html");

var f = 0;
function chk(n, c, d) { console.log((c ? "  ok  " : "  XX  ") + n + (d && !c ? " → " + d : "")); if (!c) f++; }
function secao(t) { console.log("\n── " + t + " " + "─".repeat(Math.max(0, 52 - t.length))); }

/* ── O que saiu, e por quê ─────────────────────────────────────────
   Vazia, e é assim que tem de ser: o facelift não tirou nenhuma frase
   de nenhuma tela. Se um dia entrar linha aqui, ela vem com o motivo
   escrito ao lado e com a decisão numerada — senão a lista deixa de
   ser registro e vira lugar de esconder perda. */
var SAIRAM_DE_PROPOSITO = [];

/* ── Um protótipo de mentira, mas completo ─────────────────────── */
function montar(arquivo) {
  var html = fs.readFileSync(arquivo, "utf8");
  var tjs = fs.readFileSync(path.join(RAIZ, "prototipo", "teste.js"), "utf8");
  var code = html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g, "");
  var nos = {};
  function no(id) {
    if (!nos[id]) nos[id] = { id: id, tagName: "INPUT", innerHTML: "", value: "", style: {},
      addEventListener: function () {}, hasAttribute: function () { return false },
      getAttribute: function () { return null }, setAttribute: function () {},
      removeAttribute: function () {}, focus: function () {}, setSelectionRange: function () {} };
    return nos[id];
  }
  var IO = function () { this.observe = function () {}; this.disconnect = function () {} };
  var g = new Function("document", "window", "alert", "console", "location", "IntersectionObserver",
    "navigator", "localStorage", "setInterval", "setTimeout", "crypto", "URLSearchParams",
    "var iniciarSupabase=function(){return Promise.resolve(null)};" + tjs + "\n" + code +
    ";return {e:function(js){return eval(js)},S:S}")
    ({ getElementById: no, documentElement: no("h"), body: {}, addEventListener: function () {} },
     { scrollTo: function () {}, Dados: {}, addEventListener: function () {}, innerWidth: 393,
       matchMedia: function () { return { matches: true } } },
     function () {}, { log: function () {}, warn: function () {}, error: function () {} },
     { protocol: "https:", search: "", hash: "", origin: "https://x", pathname: "/" },
     IO, { geolocation: {}, language: "pt" },
     { getItem: function () { return null }, setItem: function () {}, removeItem: function () {} },
     function () {}, function (fn) { fn() }, {}, URLSearchParams);
  g.nos = nos;
  g.html = html;
  g.codigo = code;
  return g;
}

/* Toda combinação de rota, papel e sub-aba que existe no produto. Se
   uma tela não estiver aqui, este roteiro não a protege. */
var TELAS = [
  ["anon", "home"], ["anon", "plataforma"], ["anon", "artist"], ["anon", "cadastro"],
  ["anon", "modelo"], ["anon", "conexao"], ["anon", "estudio"],
  ["client", "me"], ["client", "me-passaporte"], ["client", "me-formacao"],
  ["client", "me-quotes"], ["client", "me-payments"], ["client", "checkin"],
  ["client", "home"], ["client", "artist"],
  ["artist", "studio"], ["artist", "studio-quotes"], ["artist", "studio-checkin"],
  ["artist", "studio-schedule"], ["artist", "studio-caixa"], ["artist", "studio-historico"],
  ["artist", "studio-events"], ["artist", "studio-reviews"], ["artist", "studio-profile"],
  ["artist", "estudio"], ["artist", "estudio-reivindicar"],
  ["forn", "forn"], ["forn", "forn-recomendacoes"], ["forn", "forn-embaixadores"],
  ["forn", "forn-loja"], ["forn", "forn-perfil"]
];
var SUBABAS = [
  ["orc", ["recebidos", "enviados"]], ["ck", ["agora", "desempenho"]],
  ["ag", ["mes", "conexoes"]], ["cx", ["resumo", "lancamentos"]],
  ["hist", ["pessoas", "estudios"]], ["ev", ["meus", "participo"]],
  ["av", ["todas", "responder"]], ["fr", ["recebidas", "pedir"]],
  ["fe", ["convites", "ativos"]], ["fl", ["produtos", "pedidos"]]
];

function varrer(g) {
  var telas = {};
  g.S.modo = "demo";
  TELAS.forEach(function (t) {
    g.S.session = t[0];
    SUBABAS.forEach(function (par) {
      par[1].forEach(function (v) {
        g.S.sub = g.S.sub || {}; g.S.sub[par[0]] = v;
        g.S.route = t[1];
        var ch = t[0] + "/" + t[1];
        try { g.e("render()"); telas[ch] = (telas[ch] || "") + g.nos["app"].innerHTML } catch (e) {}
      });
    });
  });
  /* As gavetas também são tela, e render() não desenha gaveta —
     renderDrawer() desenha. Chamar render() aqui devolveria oito
     caracteres de casca e o roteiro diria que está tudo bem. */
  ["hub", "assist", "chat", "notif", "cart", "agenda", "trava"].forEach(function (d) {
    g.S.session = "client"; g.S.drawer = d;
    try {
      g.e("renderDrawer()");
      var conteudo = g.nos["drawerHost"] ? g.nos["drawerHost"].innerHTML : "";
      if (conteudo.length > 200) telas["gaveta/" + d] = conteudo;
    } catch (e) {}
  });
  g.S.drawer = null;
  return telas;
}

/* Texto visível: fora as tags, fora o que só existe para máquina. */
function frases(bruto) {
  return bruto
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]*>/g, "\n")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .split("\n")
    .map(function (x) { return x.replace(/\s+/g, " ").trim() })
    .filter(function (x) {
      if (x.length < 12) return false;              // ruído
      if (/^[\d\s.,:/%$·—–-]+$/.test(x)) return false; // só número
      return true;
    });
}

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  NADA SE PERDEU — interface #1 comparada com a #2             ║");
console.log("╚══════════════════════════════════════════════════════════════╝");

if (!fs.existsSync(ANTES)) {
  console.log("\n  XX  não achei a interface #1 congelada em:");
  console.log("      " + ANTES);
  console.log("\n      Sem o antes não há como provar o depois.");
  process.exit(1);
}

/* Se uma delas nem monta, isso é a maior perda possível — e tem de
   aparecer como falha, não como rastro de pilha. Rastro de pilha faz
   parecer que a ferramenta quebrou, e aí ninguém olha o protótipo. */
function montarComRede(arquivo, nome) {
  try { return montar(arquivo) }
  catch (e) {
    console.log("\n  XX  " + nome + " não monta → " + e.message);
    console.log("       É a perda maior que existe: a tela não chega a nascer.");
    console.log("\n══ 1 falha(s) ══");
    process.exit(1);
  }
}
secao("AS DUAS MONTAM");
var g1 = montarComRede(ANTES, "interface #1");
var g2 = montarComRede(AGORA, "interface #2");
chk("interface #1 carrega", !!g1.S);
chk("interface #2 carrega", !!g2.S);

/* ── Toda função de tela sobreviveu ───────────────────────────────
   Se uma função de render sumiu, alguma tela deixou de existir — e
   isso é perda mesmo que nenhum texto desapareça, porque a rota fica
   apontando para o vazio. */
secao("TODA FUNÇÃO DE TELA SOBREVIVEU");
function funcoes(codigo) {
  var m = codigo.match(/^function ([a-zA-Z_$][\w$]*)/gm) || [];
  return m.map(function (x) { return x.replace("function ", "") });
}
var f1 = funcoes(g1.codigo), f2 = funcoes(g2.codigo);
var sumidas = f1.filter(function (n) { return f2.indexOf(n) < 0 });
chk(f1.length + " funções na #1, " + f2.length + " na #2", true);
chk("nenhuma função sumiu", sumidas.length === 0, "sumiram: " + sumidas.join(", "));

/* ── Toda tela ainda abre ─────────────────────────────────────── */
secao("TODA TELA AINDA ABRE");
var vazias = [];
TELAS.forEach(function (t) {
  g2.S.session = t[0]; g2.S.route = t[1]; g2.S.modo = "demo";
  var saiu = "";
  try { g2.e("render()"); saiu = g2.nos["app"].innerHTML } catch (e) { saiu = "" }
  if (saiu.length < 300) vazias.push(t[0] + "/" + t[1]);
});
chk(TELAS.length + " telas, nenhuma vazia", vazias.length === 0, "vazias: " + vazias.join(", "));

/* ── O texto ──────────────────────────────────────────────────── */
secao("O QUE A #1 DIZIA, A #2 CONTINUA DIZENDO");
var telas1 = varrer(g1), telas2 = varrer(g2);
var perdidas = [], totalFrases = 0;

Object.keys(telas1).forEach(function (ch) {
  var aqui = telas2[ch] || "";
  var unicas = Array.from(new Set(frases(telas1[ch])));
  totalFrases += unicas.length;
  unicas.forEach(function (frase) {
    if (aqui.indexOf(frase) >= 0) return;
    /* A frase pode ter sido quebrada em nós diferentes sem sair da
       tela. Só vale como remontagem se TODAS as palavras longas
       continuarem NESTA MESMA tela — procurar no protótipo inteiro
       deixaria passar frase que mudou de lugar, e mudar de lugar é
       perda para quem estava naquela tela. */
    var palavras = frase.split(" ").filter(function (w) { return w.length > 5 });
    if (palavras.length >= 2 && palavras.every(function (w) { return aqui.indexOf(w) >= 0 })) return;
    if (SAIRAM_DE_PROPOSITO.some(function (par) { return frase.indexOf(par[0]) >= 0 })) return;
    perdidas.push(ch + "  ·  " + frase);
  });
});

console.log("  " + totalFrases + " frases em " + Object.keys(telas1).length + " telas da interface #1");
chk("todas continuam na mesma tela na #2", perdidas.length === 0,
    perdidas.length + " frase(s) perdidas");
if (perdidas.length) {
  console.log();
  perdidas.slice(0, 25).forEach(function (p) { console.log("       " + p.slice(0, 100)) });
  if (perdidas.length > 25) console.log("       … e mais " + (perdidas.length - 25));
  console.log();
  console.log("       Ou a frase volta, ou entra em SAIRAM_DE_PROPOSITO");
  console.log("       com o motivo escrito ao lado.");
}

secao("O QUE SAIU DE PROPÓSITO");
SAIRAM_DE_PROPOSITO.forEach(function (par) {
  console.log("  ·  \"" + par[0] + "\"");
  console.log("     " + par[1]);
});
if (!SAIRAM_DE_PROPOSITO.length) console.log("  ·  nada. Nenhuma frase saiu de nenhuma tela.");
chk("toda saída tem motivo escrito",
    SAIRAM_DE_PROPOSITO.every(function (p) { return p[1] && p[1].length > 40 }),
    "alguma linha ficou sem justificativa — a lista vira carimbo");

console.log("\n══ " + f + " falha(s) ══");
process.exit(f ? 1 : 0);
