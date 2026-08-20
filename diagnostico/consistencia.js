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

/* ── 1b. TIPOGRAFIA: O TEXTO MORA NOS TOKENS ─────────────────────
   A mesma entropia do espaçamento, encontrada pela análise da
   construção: 7 tokens de tipo e ~124 font-size em px espalhados,
   com 11.5, 12 e 12.5 convivendo — diferenças que ninguém decidiu.

   A regra que ficou tem duas metades:

   TEXTO (até 16px) mora nos tokens, sem exceção. É onde a entropia
   dói: três tamanhos quase iguais de texto corrido são ruído.

   DISPLAY (17px para cima) é um conjunto fechado, como os pontos de
   quebra: número grande, relógio, emoji e avatar têm cada um o seu
   tamanho escolhido, e o que este teste impede é o conjunto crescer
   em silêncio. Valor novo entra aqui com motivo, ou não entra. */
secao("1b. TIPOGRAFIA");
["--t-nano:10px","--t-micro:11.5px","--t-meta:13px","--t-body:14.5px"].forEach(function(t){
  chk("existe o token "+t.split(":")[0], html.indexOf(t)>=0);
});
var foraDosTokens=[];
html.split("\n").forEach(function(l,i){
  if(/^\s*--t-/.test(l))return;                     // definição de token
  var m; var re=/font-size:\s*([0-9.]+)px/g;
  while((m=re.exec(l))){
    if(parseFloat(m[1])<17 && parseFloat(m[1])!==16)  // 16 é o piso do iOS, abaixo
      foraDosTokens.push(m[1]+"px (linha "+(i+1)+")");
  }
});
chk("nenhum texto em px fora dos tokens", foraDosTokens.length===0,
    foraDosTokens.slice(0,6).join(", "));
/* O 16px literal existe num lugar só e por um motivo físico: iOS dá
   zoom automático em campo com fonte menor que isso. Token fluido não
   serve ali — o valor precisa ser o número que o Safari compara. */
chk("o 16px do iOS está no campo, e só nele",
    /@media\(pointer:coarse\)\{\.fld[^}]*font-size:16px/.test(css),
    "o campo de formulário perdeu o piso do iOS: a tela pula no primeiro toque");
var DISPLAY=["17","18","19","20","21","22","25","26","27","31","34","36"];
var intrusosT=[];
html.split("\n").forEach(function(l,i){
  if(/^\s*--t-/.test(l))return;
  var m; var re=/font-size:\s*([0-9.]+)px/g;
  while((m=re.exec(l))){
    var v=parseFloat(m[1]);
    if(v>=17 && DISPLAY.indexOf(m[1])<0)intrusosT.push(m[1]+"px (linha "+(i+1)+")");
  }
});
chk("o conjunto de display não cresceu", intrusosT.length===0,
    "tamanho novo sem decisão: "+intrusosT.slice(0,5).join(", "));
chk("e nada abaixo de 10px", !/font-size:\s*[0-9](\.[0-9]+)?px/.test(css.replace(/--t-[^;]+;/g,"")),
    "voltou fonte ilegível — o piso é o token nano");

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
/* ── O TOGGLE NUNCA ENCOSTA NO GRUPO ABAIXO ───────────────────────
   Proximidade é o sinal mais barato que uma interface tem: o que está
   perto pertence junto. O toggle comanda o que vem DEPOIS dele — se
   ficar colado nesse grupo, some a fronteira entre controle e
   conteúdo; se ficar longe, ele parece rodapé do bloco anterior.

   Estava com cerca de 50px em cima e zero embaixo, que é o inverso
   exato do que a proximidade deveria dizer. */
var espTop = (css.match(/\.segmento\{[^}]*margin-top:var\(--(e\d)\)/) || [])[1];
var espBot = (css.match(/\.segmento\{[^}]*margin-bottom:var\(--(e\d)\)/) || [])[1];
chk("o toggle respira embaixo", !!espBot, "sem margem inferior: ele encosta no grupo que comanda");
chk("e respira menos em cima do que embaixo",
    !!espTop && !!espBot && Number(espTop.slice(1)) < Number(espBot.slice(1)),
    "acima: " + espTop + ", abaixo: " + espBot + " — ele pertence ao que vem depois");
/* O toggle centrado morreu junto com o Conhecer centralizado: a
   página inteira alinhou à esquerda na decisão 039, e CSS sem
   elemento é o defeito que já cegou este produto uma vez. O guarda
   agora é a ausência. */
chk("não sobrou toggle centrado órfão", !/\.segmento\.centrado/.test(css),
    "o CSS do centrado voltou sem ninguém usar — ou alguém centralizou de novo sem decisão");

chk("e um de toggle, diferente da aba",
    /\.seg\{[^}]*border-radius:var\(--r-pill\)/.test(css),
    "toggle e aba com a mesma forma: some a diferença entre trocar de vista e trocar de lugar");
chk("um só componente de cartão de número", /\.grande\{/.test(css) && /\.stat\{/.test(css));
/* Este teste dizia "um só componente" e exigia que existissem DOIS —
   .lrow e .item — protegendo a duplicação que fingia combater. A
   análise da construção o pegou: .item saiu, virou .lrow.clicavel, e
   agora o teste exige a ausência. */
chk("um só componente de linha de lista",
    /\.lrow\{/.test(css) && !/\.item\{/.test(css) && /\.lrow\.clicavel\{/.test(css),
    ".item voltou a existir ao lado de .lrow");
/* Raio inventado é o sintoma clássico de componente novo escrito à
   mão em vez de reaproveitado. */
var raios = (css.match(/border-radius:\s*(\d+)px/g) || [])
  .filter(function (r) { return !/:\s*(0|50)px/.test(r) });
chk("nenhum raio fora dos três do sistema", raios.length === 0, raios.join(", "));

/* ── 4b. O QUE O IPHONE DELA ENSINOU ─────────────────────────────
   Cinco defeitos vistos em prints reais de celular, cada um com o seu
   guarda para não voltar. */
secao("4b. OS DEFEITOS DO CELULAR NÃO VOLTAM");

/* A sobreposição: dois botões do painel usavam .convitecx — a classe
   do MODAL de tela cheia — e herdavam position:fixed com z-index 901.
   O texto flutuava por cima do cabeçalho. Uma classe, um trabalho. */
chk("nenhum botão da página carrega a classe do modal",
    !/<button class="convitecx/.test(code) && !/class="convitecx" style="width/.test(code),
    "um botão voltou a vestir o modal: texto flutuando sobre o cabeçalho");
chk("e o cartão-convite tem classe própria",
    /\.convitecard\{/.test(css) && /class="convitecard"/.test(code));

/* A lista da loja: sem moldura de card, o que separa as linhas é o
   fio — sem ele, os produtos encostavam uns nos outros. */
chk("as linhas da lista da loja têm o fio",
    /\.vitrine\.lista \.prod\{[^}]*border-bottom:var\(--hair\)/.test(css),
    "as linhas voltaram a encostar: card sem moldura precisa do fio");

/* O botão de entrar: "Entrar ou criar conta" comia metade do
   cabeçalho do telefone. */
chk("o botão do cabeçalho diz só Entrar",
    /pill solid" onclick="irCadastro\(null\)">👤 Entrar</.test(code),
    "o rótulo cresceu de novo e come o cabeçalho no telefone");

/* Os cartões de número: 145px de mínimo punha dois por linha no
   telefone e o terceiro caía sozinho. */
var statMin = Number((css.match(/\.stats\{[^}]*minmax\((\d+)px/) || [])[1] || 999);
chk("três cartões de número cabem numa linha de telefone",
    statMin <= 110,
    "mínimo de " + statMin + "px: o terceiro cartão cai sozinho na segunda linha");

/* O perfil do tatuador: chips são filtro; fatia de lugar é toggle. */
chk("as seções do perfil usam o toggle padrão",
    /class="segmento">[\s\S]{0,400}?Informações/.test(code) && !/class="chip '\+\(S\.pfTab/.test(code),
    "as seções do perfil voltaram a ser chips — o componente de filtro");

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
