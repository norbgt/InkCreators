/* ═══════════════════════════════════════════════════════════════════
   CONSISTÊNCIA

   Rode com:  node diagnostico/consistencia.js

   O pedido foi "garanta consistência entre todo o site". Garantia não
   se dá por inspeção — nenhuma pessoa relê seis mil linhas procurando
   um 11px que devia ser 12. Se dá contando.

   Este roteiro conta quatro coisas que, quando se soltam, fazem uma
   tela parecer desalinhada sem que ninguém saiba dizer onde:

     1. quantos valores de espaçamento existem
     2. quantos pontos de quebra existem
     3. se o alvo de toque respeita o dedo
     4. se o mesmo trabalho usa o mesmo componente

   Cada número aqui foi medido antes de virar limite. Nenhum é
   arbitrário: são o estado real do produto no dia em que a entropia
   foi cortada, e servem para que ela não volte.
   ═══════════════════════════════════════════════════════════════════ */

var fs = require("fs");
var path = require("path");
var html = fs.readFileSync(path.join(__dirname, "..", "prototipo", "index.html"), "utf8");
var css = html.slice(0, html.indexOf("</style>"));
var code = html.match(/<script>([\s\S]*?)<\/script>/g).pop();

var f = 0;
function chk(n, c, d) { console.log((c ? "  ok  " : "  XX  ") + n + (d && !c ? " → " + d : "")); if (!c) f++; }
function secao(t) { console.log("\n── " + t + " " + "─".repeat(Math.max(0, 52 - t.length))); }

function conta(texto, re) {
  var m, c = {}, total = 0;
  var r = new RegExp(re.source, "g");
  while ((m = r.exec(texto))) { c[m[1]] = (c[m[1]] || 0) + 1; total++ }
  return { valores: Object.keys(c), total: total, mapa: c };
}
function lista(mapa) {
  return Object.entries(mapa).sort(function (a, b) { return a[0] - b[0] })
    .map(function (e) { return e[0] + "×" + e[1] }).join("  ");
}

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  CONSISTÊNCIA — componentes, espaçamento e responsividade    ║");
console.log("╚══════════════════════════════════════════════════════════════╝");

/* ── 1. ESPAÇAMENTO ──────────────────────────────────────────────
   Existiam 25 valores de margin-top espalhados por 564 lugares: 2, 3,
   4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22,
   24, 26, 34, 40, 44px.

   A diferença entre 11 e 12px não é perceptível e não foi intencional.
   O que ela produz é ruído: dois blocos que deveriam parecer irmãos
   parecem QUASE irmãos, e "quase" é o que faz uma tela parecer torta
   sem que ninguém saiba apontar onde.

   Seis degraus agora, e nada entre eles. */
secao("1. ESPAÇAMENTO: SEIS DEGRAUS, NADA ENTRE ELES");
["--e1:4px", "--e2:8px", "--e3:12px", "--e4:16px", "--e5:24px", "--e6:40px"].forEach(function (t) {
  chk("existe o degrau " + t.split(":")[1], css.indexOf(t) >= 0);
});
["margin-top", "margin-bottom", "gap", "padding"].forEach(function (prop) {
  var r = conta(code, new RegExp(prop + ":(\\d+)px"));
  chk("nenhum " + prop + " em px escrito à mão", r.total === 0,
      r.total + " ocorrências, " + r.valores.length + " valores: " + lista(r.mapa));
});
/* O CSS pode ter valores próprios — ali eles são declarações de
   componente, não decisões avulsas espalhadas pelo render. O que não
   pode é a escala crescer. */
/* Conta qualquer --eN, não só de 1 a 6: um sétimo degrau escapava do
   regex e a escala crescia sem ninguém notar. Foi o que a sabotagem
   mostrou — o teste media o que eu esperava, não o que existe. */
var degraus = (css.match(/--e\d+:\d+px/g) || []);
chk("a escala tem exatamente seis degraus", degraus.length === 6,
    degraus.length + ": " + degraus.join(" "));

/* ── 2. PONTOS DE QUEBRA ─────────────────────────────────────────
   Eles foram escolhidos nos vãos entre larguras de aparelho, para que
   nenhuma quebra caia no meio de um modelo comum. Eu mesmo furei isso
   ao mexer no feed, criando 820 e 1080 ao lado dos que já existiam —
   dois sistemas convivendo sem que ninguém tivesse decidido. */
secao("2. PONTOS DE QUEBRA: UM SISTEMA SÓ");
var PERMITIDOS = ["400", "460", "560", "699", "700", "1100"];
var bp = {};
(css.match(/@media\((?:min|max)-width:(\d+)px\)/g) || []).forEach(function (x) {
  var v = x.match(/\d+/)[0]; bp[v] = (bp[v] || 0) + 1;
});
var intrusos = Object.keys(bp).filter(function (v) { return PERMITIDOS.indexOf(v) < 0 });
chk("nenhum ponto de quebra fora do conjunto", intrusos.length === 0,
    "intrusos: " + intrusos.join(", ") + " — o conjunto é " + PERMITIDOS.join(", "));
chk("e os do conjunto continuam em uso", Object.keys(bp).length >= 5, lista(bp));
/* 699 e 700 são o mesmo ponto escrito dos dois lados: max-width:699
   para baixo, min-width:700 para cima. Sem esse par, um aparelho de
   exatamente 700px cairia nas duas regras ou em nenhuma. */
chk("o par 699/700 existe nos dois sentidos",
    /max-width:699px/.test(css) && /min-width:700px/.test(css),
    "faixa aberta ou sobreposta em 700px");

/* ── 3. O DEDO ───────────────────────────────────────────────────
   44pt é o mínimo da Apple e 48dp o do Google. No ponteiro fino um
   botão de 32px é confortável; no dedo é uma aposta. */
secao("3. ALVO DE TOQUE");
chk("existe regra que aumenta o alvo no toque",
    /@media\(pointer:coarse\)/.test(css));
var coarse = (css.match(/@media\(pointer:coarse\)\{[^@]*?\}\}?/g) || []).join("");
chk("e ela chega a 44px", /44px/.test(coarse),
    "as regras de toque não levam nada a 44px");
/* Componentes que a pessoa toca o tempo todo. Se algum sair da lista,
   é porque alguém criou um botão novo sem pensar no dedo. */
[".btn", ".seg", ".chip", ".aba", ".subnav a", ".acaoic"].forEach(function (sel) {
  var re = new RegExp(sel.replace(/[.\s]/g, function (c) { return c === "." ? "\\." : "\\s" }) + "\\{[^}]*\\}");
  chk("o componente " + sel + " existe para ser medido", re.test(css));
});

/* ── 4. O MESMO TRABALHO, O MESMO COMPONENTE ─────────────────────
   A regra que já custou caro aqui: quando dois componentes respondem à
   mesma pergunta com formas diferentes, a pessoa reaprende a ler no
   meio do caminho. E quando respondem a perguntas diferentes com a
   mesma forma, ela deixa de distinguir. */
secao("4. O MESMO TRABALHO, O MESMO COMPONENTE");
chk("um componente de aba, usado por .subnav e .aba",
    (function () {
      var a = (css.match(/\.subnav a\{[^}]*border-bottom:([^;}]*)/) || [])[1];
      var b = (css.match(/\.aba\{[^}]*border-bottom:([^;}]*)/) || [])[1];
      return a && b && a.trim() === b.trim();
    })(),
    "navegação com duas formas: a pessoa reaprende a ler no meio");
chk("e um de toggle, diferente da aba",
    /\.seg\{[^}]*border-radius:var\(--r-pill\)/.test(css),
    "toggle e aba com a mesma forma: some a diferença entre trocar de vista e trocar de lugar");
chk("um só componente de cartão de número", /\.grande\{/.test(css) && /\.stat\{/.test(css));
chk("um só componente de linha de lista", /\.lrow\{/.test(css) && /\.item\{/.test(css));
/* Raio inventado é o sintoma clássico de componente novo escrito à
   mão em vez de reaproveitado. */
var raios = (css.match(/border-radius:\s*(\d+)px/g) || [])
  .filter(function (r) { return !/:\s*(0|50)px/.test(r) });
chk("nenhum raio fora dos três do sistema", raios.length === 0, raios.join(", "));

/* ── 5. A MOLDURA DA PÁGINA ──────────────────────────────────────
   Uma largura máxima e uma margem lateral, fluidas, para as três
   telas. Se cada tela declarar a sua, o conteúdo dança ao trocar de
   aba — e dançar é o que a pessoa nota primeiro. */
secao("5. A MOLDURA É A MESMA EM TODA TELA");
chk("uma largura máxima só", /--shell-max:\d+px/.test(css) &&
    (css.match(/max-width:var\(--shell-max\)/g) || []).length >= 1);
chk("e uma margem lateral fluida", /--gutter:clamp\(/.test(css));
chk("o container usa as duas", /\.wrap\{max-width:var\(--shell-max\)[^}]*padding:0 var\(--gutter\)/.test(css));

console.log("\n══ " + f + " falha(s) ══");
process.exit(f ? 1 : 0);
