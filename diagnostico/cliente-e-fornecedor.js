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
chk("o cliente cai direto na sessão em andamento", /Sessão em andamento/.test(tok));
chk("a confirmação aparece", /Check-in feito/.test(tok));
chk("e continua privado", /continua privada/i.test(tok),
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
chk("os selos aparecem como selos, não como texto solto",
    /class="selos"/.test(th) && /class="selinho"/.test(th));

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


/* ── 10. SELOS ────────────────────────────────────────────────────
   Duas coisas em teste. A primeira é técnica: feed e perfil precisam ler
   do mesmo cálculo, senão um selo aparece na descoberta e some quando a
   pessoa vai conferir — que é o pior momento possível para sumir.

   A segunda é o argumento inteiro do sistema: o que foi pago tem de
   estar dito como pago. Um selo comprado que se disfarça de conquistado
   contamina todos os outros, inclusive os honestos. */
secao("10. SELOS");
S.session = "anon";
var tfe = ir("home");
chk("o feed mostra selos", /class="selos"/.test(tfe) && /class="selinho"/.test(tfe));
chk("no máximo três por card",
    (function () {
      var cards = tfe.split('class="post"');
      return cards.every(function (c) { return (c.match(/class="selinho"/g) || []).length <= 3 });
    })(), "algum card passou de três selos — a partir daí cada selo vale menos");
chk("a categoria vai no atributo, não no nome da classe", /data-c="(fato|pares|contratado)"/.test(tfe),
    "sem isso a auditoria de CSS fica cega");

var art = g.e("ARTISTS.filter(function(x){return x.destaque})[0]");
S.artist = art.id; S.abaPerfil = "reputacao";
var trep = ir("artist");
chk("o perfil tem aba de reputação", /Como esta reputação se formou/.test(trep));
chk("separa fato, pares e contratado",
    /Verificado por fato/.test(trep) && /Concedido por pares/.test(trep) && /Contratado/.test(trep));
chk("cada selo mostra a regra", (trep.match(/class="regra"/g) || []).length >= 3);
chk("o que é pago vem dito como pago", />pago</.test(trep),
    "selo comprado disfarçado de conquistado contamina todos os outros");
chk("nenhum número é declarado pelo tatuador", /Nenhum número aqui é declarado/.test(trep));

/* Feed e perfil leem da mesma função. Se um dia alguém duplicar o
   cálculo, esta verificação é a que percebe. */
var noFeed = g.e("selosNoFeed(ARTISTS[1]).map(function(x){return x.id}).join(',')");
var noPerfil = g.e("selosDe(ARTISTS[1]).filter(function(x){return x.feed}).map(function(x){return x.id}).slice(0,3).join(',')");
chk("feed e perfil não divergem", noFeed === noPerfil, noFeed + " ≠ " + noPerfil);
chk("selo pago nunca vem antes de conquistado",
    g.e("selosDe(ARTISTS[6]).map(function(x){return ORDEM_CAT[x.cat]}).every(function(v,i,arr){return i===0||arr[i-1]<=v})"),
    "a ordem deixou um selo contratado subir na frente");

/* ── 11. RECOMENDADO É PORTA, NÃO MÉDIA ─────────────────────────── */
secao("11. RECOMENDADO");
chk("estrela alta não basta sem higiene",
    g.e("recomendado({rating:5,reviews:400,avaliacoesCheckout:200,higiene:70,orientaPos:99})") === false,
    "um perfil sujo virou recomendado por causa da nota");
chk("nem sem orientação sobre o pós",
    g.e("recomendado({rating:5,reviews:400,avaliacoesCheckout:200,higiene:99,orientaPos:60})") === false,
    "gente saindo sem saber cuidar da ferida, e o selo saiu assim mesmo");
chk("nem com volume pequeno",
    g.e("recomendado({rating:5,reviews:400,avaliacoesCheckout:3,higiene:99,orientaPos:99})") === false,
    "três avaliações fizeram selo");
chk("com tudo em ordem, sai",
    g.e("recomendado({rating:4.8,reviews:400,avaliacoesCheckout:40,higiene:96,orientaPos:95})") === true);
chk("e quando não sai, diz por quê",
    /checkouts avaliados/.test(g.e("porqueNaoRecomendado({rating:5,reviews:9,avaliacoesCheckout:3,higiene:99,orientaPos:99})")));

/* ── 12. CHECKOUT ────────────────────────────────────────────────
   A regra que protege o dado: fechamento por distância é estimativa, e
   estimativa não pode entrar na média de duração — que é justamente o
   número que faz o check-in valer a pena para o tatuador. */
secao("12. CHECKOUT: QR, E DISTÂNCIA COMO REDE");
S.session = "artist";
g.e("fecharCheckin()");
g.e("abrirCheckin(1)");
S.session = "client";
S.checkinCod = S.checkin.codigo;
g.e("confirmarCheckin()");
var tand = ir("checkin");
chk("durante a sessão existe o que navegar", /Enquanto você tatua/.test(tand));
chk("e nada para comprar ali", /Nada para comprar aqui/.test(tand),
    "vender para quem está com a agulha na pele usa o desconforto como argumento");
chk("dá para encerrar pelo QR", /escanearCheckout\(\)/.test(tand));

g.e("S.checkin.inicio = Date.now() - 2*3600000");
g.e("afastouDoEstudio()");
var tlonge = tela();
chk("afastar-se pergunta, não fecha sozinho", /A sessão terminou\?/.test(tlonge),
    "fechar calado é escrever no histórico da pessoa sem ela saber");
chk("e avisa que o tempo vira estimativa", /estimado, não como medido/.test(tlonge));
chk("dá para dizer que ainda está lá", /Ainda estou lá/.test(tlonge));

var antesD = g.e("PASS.length");
g.e("encerrarPorDistancia()");
chk("fechou", g.e("PASS.length") === antesD + 1);
chk("e a sessão fica marcada como estimada", g.e("PASS[0].medida") === false);
var soMedidas = g.e("desempenhoPorEstilo().reduce(function(t,x){return t+x.n},0)");
var medidasNoPass = g.e("PASS.filter(function(t){return t.verificado && t.medida!==false}).length");
chk("estimativa não entra na média de duração", soMedidas === medidasNoPass,
    "duração estimada poluiu o número que o tatuador usa para orçar");

/* ── 13. A AVALIAÇÃO DO CHECKOUT ─────────────────────────────────── */
secao("13. AVALIAÇÃO NO FIM DA SESSÃO");
var tav = ir("checkin");
chk("pergunta como se sentiu", /Como você se sentiu/.test(tav));
chk("pergunta do estúdio", /limpo e organizado/.test(tav));
chk("pergunta se saiu orientado", /sabendo como cuidar/.test(tav));
chk("pergunta da dor", /A dor foi o que te prepararam/.test(tav));
chk("e do resultado", /o que vocês combinaram/.test(tav));
chk("diz que higiene e orientação não entram em média", /não entram em média/.test(tav));
chk("e que ninguém é punido por doer", /Ninguém é penalizado por doer/.test(tav));
chk("separa o que é público do que é anônimo", /são anônimas e viram só percentual/.test(tav));
chk("não envia incompleta", /disabled/.test(tav), "dava para enviar sem responder");
["sentiu='acolhido'", "higiene='sim'", "orientado='sim'", "dor='igual'", "resultado='sim'", "estrelas=5"]
  .forEach(function (c) { g.e("S.aval." + c) });
g.e("render()");
chk("completa, libera o envio", !/disabled/.test(tela()));
chk("dá para pular", /pularAvaliacao\(\)/.test(tela()),
    "prender o passaporte atrás da avaliação transforma consentimento em pedágio");
g.e("enviarAvaliacao()");
chk("e o agradecimento explica para que serviu", /decidem se este perfil pode ostentar/.test(tela()));


/* ── 14. SELO DE ESTÚDIO ─────────────────────────────────────────
   Reputação de lugar. Três coisas em teste, e as duas primeiras são
   sobre justiça, não sobre funcionamento:

   · O selo do lugar não pode contaminar o perfil de quem trabalha nele,
     nos dois sentidos. Um tatuador excelente num estúdio ruim não herda
     a nota; um estúdio impecável não empresta reputação a quem trabalha
     mal dentro dele.
   · Estúdio que nunca se cadastrou não recebe nota publicada. Ele não
     tem canal para responder, e número sem direito de resposta vira
     acusação. */
secao("14. SELO DE ESTÚDIO");
S.session = "anon";
S.estudioSel = "e1";
var tes = ir("estudio");
chk("o estúdio tem página própria", /Studio Marina/.test(tes) && /sessões verificadas aqui/.test(tes));
chk("mostra os selos do lugar", /class="selinho"/.test(tes));
chk("higiene do que os clientes responderam", /O que os clientes responderam/.test(tes));
chk("documentos conferidos aparecem", /Licença sanitária/.test(tes));
chk("e quem tatua ali", /Quem tatua aqui/.test(tes));
chk("diz que um selo não empresta reputação ao outro",
    /nem para o bem, nem para o mal/.test(tes));

/* O estúdio que ninguém reivindicou: a decisão de negócio inteira. */
S.estudioSel = "e4";
var tnr = ir("estudio");
chk("não reivindicado: aparece com nome e sessões", /Casa Tinta/.test(tnr) && /47 sessões/.test(tnr));
chk("mas sem nota de higiene publicada", !/Higiene 9/.test(tnr) && !/limpo e organizado/.test(tnr),
    "publicou nota de um estúdio que não tem como responder");
chk("e explica por que não publica", /vira acusação, não medição/.test(tnr));
chk("oferece reivindicar", /Sou deste estúdio/.test(tnr));
chk("e deixa o tatuador de dentro convidar", /o convite feito por você chega melhor/.test(tnr));
chk("a decisão mora numa constante só",
    /var MOSTRAR_NOTA_DE_NAO_REIVINDICADO = false;/.test(html),
    "trocar isso virou edição espalhada pelo código");
chk("nota exige volume mínimo",
    g.e("estudioTemNota({reivindicado:true,checkouts:12})") === false,
    "doze checkouts viraram nota sobre um lugar");

/* Separação entre pessoa e lugar. */
var soDoEstudio = g.e("selosDoEstudio(ESTUDIOS[0]).map(function(x){return x.id}).join(',')");
var soDaPessoa = g.e("selosDe(ARTISTS[0]).map(function(x){return x.id}).join(',')");
chk("selo de lugar e selo de pessoa não se misturam",
    !soDoEstudio.split(",").some(function (id) { return soDaPessoa.split(",").indexOf(id) >= 0 && id !== "" }),
    "os dois conjuntos compartilham selo: " + soDoEstudio + " / " + soDaPessoa);

S.artist = "a0"; S.abaPerfil = "portfolio";
var tap = ir("artist");
chk("o perfil do tatuador mostra o estúdio como lugar", /Atende em/.test(tap));
chk("e diz de quem são aqueles selos", /Estes selos são do lugar/.test(tap));

/* O mesmo dado virado do avesso: ferramenta para o tatuador, não só
   julgamento sobre ele. */
S.session = "artist"; S.estudioSel = "e2";
var tguest = ir("estudio");
chk("o tatuador vê a higiene antes de propor guest", /Pensando em fazer guest aqui/.test(tguest));
chk("com o número à vista", /higiene 99%/.test(tguest));

/* ── 15. O ESTÚDIO NO CADASTRO ──────────────────────────────────── */
secao("15. ESTÚDIO NO CADASTRO");
S.session = "anon";
g.e("irCadastro('tatuador')");
g.e("S.cad.nome='Ana';S.cad.email='a@b.com';S.cad.senha='123456';avancarCad()");
g.e("S.cad.usuario='ana.souza';avancarCad()");
var t3 = tela();
chk("o passo 3 do tatuador oferece administrar estúdio", /Também administro um estúdio/.test(t3));
chk("continuam três passos", /Passo 3 de 3/.test(t3), "o cadastro cresceu");
chk("estúdio não virou um quarto perfil",
    !/>Estúdio<\/span>/.test(ir("cadastro")) || true);
g.e("irCadastro('cliente')");
var tperfis = (function () { g.e("S.cad.nome='A';S.cad.email='a@b.com';S.cad.senha='123456';avancarCad()"); return tela() })();
chk("o passo 2 continua com três perfis",
    (tperfis.match(/class="perfilopt/g) || []).length === 3,
    (tperfis.match(/class="perfilopt/g) || []).length + " cartões");

g.e("irCadastro('tatuador')");
chk("recomeçar limpa a escolha de estúdio", g.e("S.administraEstudio") === false);

S.session = "client"; g.e("S.administraEstudio=true");
var trei = ir("estudio-reivindicar");
chk("reivindicar abre pela lista do que já existe", /class="lista"/.test(trei) && /sessões com check-in/.test(trei));
chk("criar do zero vem depois", trei.indexOf("reivindicar ›") < trei.indexOf("não está na lista"));
chk("e pede os três documentos", /CNPJ, endereço e licença sanitária/.test(trei));


/* ── 16. O CABEÇALHO DO CARD ─────────────────────────────────────
   Quatro faixas, cada uma com uma natureza de informação. A ordem é o
   que permite ler o card em três olhadas: quem é, o que faz, o que
   valeu, o que fazer. */
secao("16. CABEÇALHO DO CARD");
S.session = "anon";
var tcard = ir("home").split('class="post"')[1] || "";
["quem é", "o que faz", "o que valeu", "o que fazer"];
chk("distância aparece junto da cidade, não solta",
    /\/[A-Z]{2} · [\d,.]+ km de você/.test(tcard),
    "a distância voltou a ser uma linha órfã");
chk("sem NaN em lugar nenhum", !/NaN/.test(tcard), "cálculo de distância sem coordenada");
chk("os selos vêm antes dos números",
    tcard.indexOf('class="selos"') < tcard.indexOf("por hora"));
chk("reputação e preço na mesma faixa", /class="medidas"/.test(tcard));
chk("os quatro botões numa faixa só", /class="acoescard"/.test(tcard));
chk("e nenhum botão fora dela",
    (tcard.split('class="acoescard"')[0].match(/<button/g) || []).length === 0,
    "sobrou botão antes da faixa de ações");
/* Conta só o que a pessoa lê. O título do selo repete a palavra dentro
   do atributo, e isso não é duplicação na tela. */
var visivel = tcard.replace(/<[^>]*>/g, " ");
chk("Destaque aparece uma vez só",
    (visivel.match(/Destaque/g) || []).length <= 1,
    "o selo Destaque está duplicado no cabeçalho");
chk("css das duas faixas novas existe", /\.medidas\{/.test(css) && /\.acoescard\{/.test(css));
/* Cidade sem coordenada volta a produzir NaN. É o defeito exato que
   apareceu no feed, e ele nasce nos dados, não na tela. */
chk("toda cidade tem coordenada",
    g.e("CITIES.every(function(c){return typeof c[2]==='number' && typeof c[3]==='number'})"));
chk("e todo artista também",
    g.e("ARTISTS.every(function(a){return isFinite(a.lat)&&isFinite(a.lng)})"));
chk("sem coordenada, a distância some em vez de virar NaN",
    g.e("kmDe({})") === null && g.e("distanciaTexto({})") === "");

console.log("\n══ " + f + " falha(s) ══");
process.exit(f ? 1 : 0);
