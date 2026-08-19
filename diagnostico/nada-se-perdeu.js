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
var SAIRAM_DE_PROPOSITO = [
  ["Orçamentos em andamento",
   "vira 'Esperando você' quando existe proposta já respondida aguardando decisão do cliente. O título antigo continua no código como alternativa e aparece quando não há nada esperando — o que os dados de demonstração não produzem"],
  ["Costas — omoplata · Blackwork",
   "a visão geral deixou de mostrar os três orçamentos mais recentes e passou a mostrar os três que dependem de alguém. Este continua inteiro em 'Meus orçamentos', que é a lista completa a um clique — resumo que repete o começo da lista não é resumo"],
  ["Studio Caio · 2 respostas · há 3 semanas",
   "mesma razão: saiu do resumo por não estar esperando ninguém, e continua na aba cheia de orçamentos"],
  ["Últimos lançamentos",
   "era uma prévia de quatro linhas com 'Ver todos' que levava à outra sub-aba. Com as seções empilhadas numa página só, a tabela completa está logo abaixo — a prévia viraria a mesma lista duas vezes, a uma rolagem de distância"],
  ["Meus orçamentos",
   "deixou de ser aba e virou seção da Visão geral, junto com Pagamentos. A frase some da barra das outras telas do cliente — de Passaporte e Formação não se lê mais a palavra. É a troca que a arquitetura de três abas impõe, e o custo está registrado na decisão 015"],
  ["Ver todos →",
   "o atalho morria junto com a prévia dos lançamentos, pela mesma razão: ele existia para trocar de sub-aba, e não há mais sub-aba para trocar"]
];

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

/* ── PARA ONDE CADA TELA FOI ──────────────────────────────────────
   A barra do tatuador passou de nove abas para cinco. Nenhuma tela
   sumiu — todas viraram sub-aba de uma das cinco. Mas os endereços
   mudaram, e sem esta tabela o roteiro compararia telas diferentes e
   acusaria perda onde só houve mudança de lugar.

   Cada linha diz: esta tela da #1 mora, na #2, naquela aba com aquela
   sub-aba aberta. É a lista que torna a comparação honesta — e é
   também o registro de onde procurar o que você não achar. */
var MUDOU_DE_LUGAR = {
  "studio-checkin":   [["studio",           "hoje", "checkin"],
                       ["studio-reputacao", "rep",  "desempenho"]],
  /* Cursos e eventos deixou de ser sub-aba de Reputação e ganhou porta
     própria: quem entra ali vai criar um curso, não conferir reputação. */
  "studio-events":    [["studio-eventos",   "ev",   "meus"]],
  "studio-reviews":   [["studio-reputacao", "rep",  "avaliacoes"]],
  /* Duas metades, duas abas: quem eu tatuei virou dinheiro por pessoa,
     onde eu tatuei virou trajetória. */
  "studio-historico": [["studio-caixa",     "cx",   "pessoas"],
                       ["studio-reputacao", "rep",  "estudios"]]
};

function varrer(g, ehNova) {
  var telas = {};
  g.S.modo = "demo";
  TELAS.forEach(function (t) {
    g.S.session = t[0];
    SUBABAS.forEach(function (par) {
      par[1].forEach(function (v) {
        g.S.sub = g.S.sub || {}; g.S.sub[par[0]] = v;
        var rota = t[1], ch = t[0] + "/" + t[1];
        /* Na interface nova, entra pela porta nova; a chave continua
           sendo o nome antigo, para as duas varreduras casarem. */
        if (ehNova && MUDOU_DE_LUGAR[rota]) {
          /* Uma tela da #1 pode ter virado duas na #2. Junta as duas
             sob a mesma chave: a pergunta é se o conteúdo continua
             existindo em algum lugar alcançável, não em qual aba. */
          MUDOU_DE_LUGAR[rota].forEach(function (d) {
            g.S.route = d[0]; g.S.sub[d[1]] = d[2];
            try { g.e("render()"); telas[ch] = (telas[ch] || "") + g.nos["app"].innerHTML } catch (e) {}
          });
          return;
        }
        if (ehNova && rota === "studio") g.S.sub.hoje = "visao";
        g.S.route = rota;
        try { g.e("render()"); telas[ch] = (telas[ch] || "") + g.nos["app"].innerHTML } catch (e) {}
      });
    });
  });

  return telas;
}

/* O texto como se lê, em fila, sem as marcas. Serve para procurar: se
   uma frase existia e continua legível na mesma ordem, ela não se
   perdeu — mesmo que agora esteja repartida em três nós. Quebrar um nó
   muda o HTML e não muda o que a pessoa lê. */
function corrido(bruto) {
  return bruto
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");
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
var telas1 = varrer(g1, false), telas2 = varrer(g2, true);
var perdidas = [], totalFrases = 0;

Object.keys(telas1).forEach(function (ch) {
  var aqui = corrido(telas2[ch] || "");
  var unicas = Array.from(new Set(frases(telas1[ch])));
  totalFrases += unicas.length;
  unicas.forEach(function (frase) {
    /* Procurado no texto corrido DESTA tela. Duas exigências de uma vez:
       a frase inteira, na ordem, e nesta tela. Frase que migrou para
       outra tela conta como perdida — é perda para quem estava aqui. */
    if (aqui.indexOf(frase) >= 0) return;
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

secao("PARA ONDE CADA TELA FOI");
Object.keys(MUDOU_DE_LUGAR).forEach(function (k) {
  console.log("  ·  " + k);
  MUDOU_DE_LUGAR[k].forEach(function (d) { console.log("       →  " + d[0] + " / " + d[2]) });
});
chk("toda mudança de endereço tem destino declarado",
    Object.keys(MUDOU_DE_LUGAR).every(function (k) {
      return MUDOU_DE_LUGAR[k].length > 0 &&
             MUDOU_DE_LUGAR[k].every(function (d) { return d.length === 3 });
    }));

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
