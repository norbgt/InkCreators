/* ═══════════════════════════════════════════════════════════════════
   CLIENTE E FORNECEDOR

   Rode com:  node diagnostico/cliente-e-fornecedor.js

   Três coisas em teste, e a primeira é a que mais importa:

   1. O passaporte não cobra a próxima tatuagem. É a única verificação
      aqui que não é técnica — é ética. Tatuagem é permanente, e uma
      interface que mostra "faltam duas para" transforma decisão
      irreversível em tarefa a completar. Este roteiro procura, no HTML
      renderizado, qualquer linguagem de meta. Se ela aparecer, falha.

   2. O check-in exige as duas partes. Nada é registrado enquanto o
      cliente não confirmar, e nenhum código que não seja o da sessão
      aberta vale.

   3. A privacidade é fechada por padrão, e continua fechada depois do
      check-in — que é justamente o momento em que a pessoa está menos
      disponível para decidir sobre exposição.
   ═══════════════════════════════════════════════════════════════════ */

var fs = require("fs");
var path = require("path");
var html = fs.readFileSync(path.join(__dirname, "..", "prototipo", "index.html"), "utf8");
var tjs = fs.readFileSync(path.join(__dirname, "..", "prototipo", "teste.js"), "utf8");
var code = html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g, "");
var css = html.slice(0, html.indexOf("</style>"));

var f = 0;
function chk(n, c, d) { console.log((c ? "  ok  " : "  XX  ") + n + (d && !c ? " → " + d : "")); if (!c) f++; }
function secao(t) { console.log("\n── " + t + " " + "─".repeat(Math.max(0, 52 - t.length))); }

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
   function () {}, { log: function () {} },
   { protocol: "https:", search: "", hash: "", origin: "https://x", pathname: "/" },
   IO, { geolocation: {}, language: "pt" },
   { getItem: function () { return null }, setItem: function () {}, removeItem: function () {} },
   function () {}, function (fn) { fn() }, {}, URLSearchParams);

var S = g.S;
var tela = function () { return nos["app"].innerHTML };
function ir(rota, chave, valor) {
  S.route = rota;
  if (chave) { S.sub = S.sub || {}; S.sub[chave] = valor }
  g.e("render()");
  return tela();
}

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  CLIENTE E FORNECEDOR                                        ║");
console.log("╚══════════════════════════════════════════════════════════════╝");

/* ── 1. NENHUMA TELA NOVA QUEBRA ─────────────────────────────────── */
secao("1. AS TELAS NOVAS ABREM");
[["client", ["me", "me-passaporte", "me-formacao", "me-quotes", "me-payments", "checkin"]],
 ["artist", ["studio-checkin"]],
 ["forn",   ["forn", "forn-recomendacoes", "forn-embaixadores", "forn-loja", "forn-perfil"]]
].forEach(function (par) {
  S.session = par[0]; S.modo = "demo";
  par[1].forEach(function (r) {
    var t = "";
    try { t = ir(r) } catch (e) { chk(par[0] + " / " + r, false, e.message); return }
    chk(par[0] + " / " + r, t.length > 300, "tela com " + t.length + " caracteres");
  });
});

/* ── 2. O PASSAPORTE NÃO COBRA NADA ──────────────────────────────
   A verificação central desta rodada. Cada padrão abaixo é uma forma
   de dizer "você ainda não terminou" — e nenhuma delas pode existir
   numa tela sobre marcas permanentes no corpo de alguém. */
secao("2. O PASSAPORTE REGISTRA, NÃO COBRA");
S.session = "client";
var tp = ir("me-passaporte");
var semTexto = tp.replace(/<[^>]*>/g, " ");
[["não diz o que falta", /\bfalta[m]?\b/i],
 ["não promete próximo nível", /próximo n[íi]vel|pr[óo]ximo n[íi]vel/i],
 ["não usa pontos", /\bpontos?\b/i],
 ["não usa ranking", /ranking|posi[çc][ãa]o no|\bplacar\b/i],
 ["não desbloqueia nada", /desbloque/i],
 ["não tem meta", /\bmeta[s]?\b/i],
 ["não tem conquista a completar", /complete |completar o |para completar/i],
 ["não compara com outros clientes", /voc[êe] est[áa] (à frente|atr[áa]s)|mais que \d+% dos/i]
].forEach(function (c) { chk(c[0], !c[1].test(semTexto), "encontrei: " + (semTexto.match(c[1]) || [""])[0]) });

chk("mostra marcos que já aconteceram", /class="marcos"/.test(tp) && /class="marco"/.test(tp));
chk("e diz por que não cobra o próximo", /Nenhum marco cobra o próximo/.test(tp));
chk("css dos marcos existe", /\.marcos\{/.test(css) && /\.marco\{/.test(css));
chk("sem barra de progresso no passaporte", !/class="bar"/.test(tp),
    "barra de progresso é a forma visual de dizer que falta algo");

/* ── 3. PRIVACIDADE ──────────────────────────────────────────────── */
secao("3. PRIVADO POR PADRÃO");
chk("nasce fechado", /Seu passaporte está privado/.test(tp));
chk("diz por que é sensível", /Parte do corpo, estúdio e cidade/.test(tp));
chk("cada sessão tem seu próprio botão", (tp.match(/alternarPassPublico\(/g) || []).length === S.e ? true : (tp.match(/alternarPassPublico\(/g) || []).length >= 5,
    (tp.match(/alternarPassPublico\(/g) || []).length + " botões");
chk("nenhuma sessão começa visível", !/>Visível</.test(tp), "alguma sessão já nasceu pública");
g.e("alternarPassPublico('pa2')");
var tp2 = tela();
chk("liberar uma muda o aviso", /parcialmente aberto/i.test(tp2) && /1 de/.test(tp2));
g.e("alternarPassPublico('pa2')");

/* ── 4. CHECK-IN: EXIGE OS DOIS ──────────────────────────────────── */
secao("4. CHECK-IN EXIGE AS DUAS PARTES");
S.session = "artist";
var tc = ir("studio-checkin", "ck", "agora");
chk("o tatuador vê as sessões para abrir", /abrirCheckin\(/.test(tc));
chk("nada de valor aparece antes de abrir", !/class="codigo"/.test(tc));

g.e("abrirCheckin(0)");
var tcx = tela();
chk("abrir gera um código de seis caracteres", (S.checkin.codigo || "").length === 6, S.checkin.codigo);
chk("o código não usa letras que se confundem ao ditar",
    !/[IO01]/.test(S.checkin.codigo || ""), S.checkin.codigo);
chk("mostra o QR", /class="qrcx"/.test(tcx) && /<svg/.test(tcx));
chk("e o código por extenso, para ditar", /class="codigo"/.test(tcx));
chk("o QR é estável entre repinturas",
    (function () { var a = tela(); g.e("render()"); return a === tela() })(),
    "o padrão mudou sozinho — pareceria defeito");
chk("diz que nada é registrado sem o cliente", /nada é registrado/i.test(tcx));

var antes = g.e("PASS.length");
S.session = "client";
S.checkinCod = "XXXXXX";
g.e("confirmarCheckin()");
chk("código errado não confirma", !S.checkin.confirmado, "confirmou com código errado");
chk("e explica o que houve", !!S.checkin.erro, "erro silencioso");
chk("e não escreve no passaporte", g.e("PASS.length") === antes);

S.checkinCod = S.checkin.codigo;
g.e("confirmarCheckin()");
chk("código certo confirma", S.checkin.confirmado === true);
var tok = ir("checkin");
chk("o cliente vê a confirmação", /Check-in feito/.test(tok));
chk("e continua privado", /Continua privada/.test(tok),
    "o check-in acabou de expor a sessão sem perguntar");

S.session = "artist";
g.e("iniciarSessaoCheckin()");
chk("o relógio começa", !!S.checkin.inicio);
g.e("S.checkin.inicio = Date.now() - 3*3600000");
g.e("encerrarSessaoCheckin()");
chk("encerrar registra no passaporte", g.e("PASS.length") === antes + 1);
chk("e nasce verificada", g.e("PASS[0].verificado") === true);
chk("e nasce privada", g.e("S.passPub.indexOf(PASS[0].id)") < 0,
    "a sessão nova apareceu pública");
chk("a duração é medida, não estimada", Math.round(g.e("duracaoCheckin()")) === 3,
    g.e("duracaoCheckin()") + "h");

/* ── 5. O QUE O CHECK-IN PRODUZ ──────────────────────────────────── */
secao("5. DESEMPENHO SAI DO CHECK-IN");
var td = ir("studio-checkin", "ck", "desempenho");
chk("mostra duração por estilo", /Quanto tempo leva, por estilo/.test(td));
chk("diz de onde vem o número", /relógio do check-in/.test(td));
chk("e onde ele tatuou", /Onde você tatuou/.test(td));
var so = g.e("desempenhoPorEstilo()");
chk("só entram sessões verificadas",
    so.reduce(function (t, x) { return t + x.n }, 0) === g.e("PASS.filter(function(t){return t.verificado}).length"),
    "sessão declarada entrou na média");

secao("6. REPUTAÇÃO ANTES DO ORÇAMENTO");
S.session = "anon";
var th = ir("home");
chk("o card mostra sessões verificadas", /sessões verificadas/.test(th));
chk("e a distância", /km de você/.test(th));
/* A ordem é o argumento: a reputação tem de estar legível antes do
   botão de orçar, não depois. Se o botão vier primeiro, a tela convida
   a pedir preço a quem a pessoa ainda não avaliou. */
chk("a reputação vem antes do botão de orçar",
    th.indexOf("sessões verificadas") < th.indexOf("quoteFor("),
    "o botão de orçamento aparece antes da reputação");
chk("no mesmo bloco da avaliação",
    Math.abs(th.indexOf("sessões verificadas") - th.indexOf("Pedir orçamento")) < 700,
    "reputação e ação ficaram longe uma da outra");

/* ── 7. FORNECEDOR: A CADEIA NA ORDEM CERTA ──────────────────────── */
secao("7. FORNECEDOR");
S.session = "forn";
var tf = ir("forn");
chk("visão geral em números", /class="grandes"/.test(tf));
chk("separa o que precisa de ação", /Precisa de você/.test(tf));
chk("e o que sustenta a marca", /Confiança que você tem/.test(tf));
/* Recomendação antes de embaixador na navegação. A ordem é o argumento:
   quem começa comprando embaixador compra alcance, não confiança. */
chk("recomendações vêm antes de embaixadores no menu",
    tf.indexOf("forn-recomendacoes") < tf.indexOf("forn-embaixadores"),
    "a ordem do menu inverteu a cadeia");

var tr = ir("forn-recomendacoes", "fr", "recebidas");
chk("recebidas: o que o tatuador disse", /o que tatuadores dizem/i.test(tr));
chk("e onde isso aparece para o cliente", /para o cliente, na hora da compra/.test(tr));
var trp = ir("forn-recomendacoes", "fr", "pedir");
chk("pedir: só quem já comprou", /já compraram da sua marca/.test(trp));

var te = ir("forn-embaixadores", "fe", "convites");
chk("convites: registra a recusa", /recusou/.test(te));
chk("e diz para não insistir", /não insistir/.test(te));
chk("convidar leva às recomendações", /S\.sub\.fr='pedir'/.test(te.replace(/&#39;/g, "'")));
var tea = ir("forn-embaixadores", "fe", "ativos");
chk("ativos: venda atribuída", /vendas/.test(tea));

var tl = ir("forn-loja", "fl", "produtos");
chk("vitrine mostra recomendação no produto", /Recomendado por tatuador/.test(tl));
chk("e o que está sem estoque sai da vitrine", /fora da vitrine/.test(tl));
var tlp = ir("forn-loja", "fl", "pedidos");
chk("pedidos separam a venda que a plataforma criou", /pós-sessão/.test(tlp));
chk("e explicam por que isso importa", /faz sentido cobrar comissão/.test(tlp));

chk("nenhuma tela do fornecedor promete backend", /Perfil em estudo/.test(tf));

secao("8. TRILHA DE CAPACITAÇÃO");
S.session = "client";
var tform = ir("me-formacao");
chk("mostra a trilha", /Sua trilha/.test(tform));
chk("e que o histórico vai junto", /é a mesma conta, e o histórico é seu/.test(tform));
chk("oferece virar tatuador sem cadastro novo", /becomeArtist\(\)/.test(tform));
chk("liga aos cursos", /Ver cursos disponíveis/.test(tform));

secao("9. CADA PAPEL FICA NA SUA ÁREA");
S.session = "client"; S.route = "forn"; g.e("render()");
chk("cliente não entra na área da marca", !/Nordeste Ink Care/.test(tela()) || /🔒/.test(tela()));
S.session = "forn"; S.route = "studio"; g.e("render()");
chk("fornecedor não entra na gestão do estúdio", /🔒/.test(tela()) || !/Seu estúdio/.test(tela()));

console.log("\n══ " + f + " falha(s) ══");
process.exit(f ? 1 : 0);
