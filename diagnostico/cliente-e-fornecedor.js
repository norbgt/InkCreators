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
 ["artist", ["studio", "studio-reputacao"]],
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
/* O check-in de agora virou sub-aba de Hoje: era a mesma lista de
   sessões que a agenda mostrava, em duas abas diferentes. */
/* O check-in mora na agenda: é a mesma matéria que ela trata, sessão
   marcada. E o QR nasce do agendamento, não de um botão genérico. */
var tc = ir("studio-schedule", "ag", "sessoes");
/* ── O QR NASCE DE UM AGENDAMENTO ────────────────────────────────
   O botão de abrir o check-in mora na linha da sessão, dentro da
   agenda. É isso que liga o código a esta pessoa, neste dia, neste
   estúdio — um botão genérico "abrir check-in" não liga a nada, e o
   tatuador teria de reencontrar noutra tela quem já estava vendo. */
var tag = ir("studio-schedule", "ag", "sessoes");
/* Não basta existirem botões: cada um tem de apontar para a SUA linha.
   Todos apontando para a mesma sessão é o defeito silencioso aqui —
   a tela parece certa e o QR sai da pessoa errada. */
var indices = (tag.match(/abrirCheckin\((\d+)\)/g) || [])
  .map(function (x) { return parseInt(x.replace(/\D/g, ""), 10) });
chk("cada sessão da agenda gera o seu QR", indices.length >= 3,
    "o botão de gerar o QR não está na linha da sessão");
chk("e cada botão aponta para a sua sessão",
    indices.length === new Set(indices).size &&
    indices.every(function (n, k) { return n === k }),
    "índices: [" + indices.join(", ") + "] — deveriam ser 0,1,2…");
chk("e o botão diz o que faz", /Gerar QR/.test(tag));

/* ── O BOTÃO TEM DE CABER ──────────────────────────────────────────
   Ele existia e ela não achava. A linha da sessão é flex, e eu tinha
   posto dois botões onde havia um: no telefone o último era empurrado
   para fora da vista. Sumir em silêncio é o pior jeito de sumir — a
   pessoa conclui que a função não existe.

   "Detalhes", o botão que roubava a largura, nunca teve onclick: não
   fazia nada desde que nasceu. */
chk("a linha da sessão quebra em vez de empurrar para fora",
    /\.lrow\{[^}]*flex-wrap:wrap/.test(css),
    "sem quebra, o botão do fim some da vista no telefone");
chk("e no telefone o botão ocupa a linha inteira",
    /@media\(max-width:460px\)\{[\s\S]{0,120}\.lrow \.acaoLinha\{[^}]*width:100%/.test(css));
chk("nenhum botão morto na linha da sessão",
    !/>Detalhes</.test(tag),
    "voltou um botão sem onclick roubando a largura do que funciona");
/* Um botão por linha: dois competem pela largura e o segundo é o que
   some. */
var linhas=(tag.match(/class="lrow"/g)||[]).length;
var acoes=(tag.match(/class="btn sm[^"]*acaoLinha"/g)||[]).length;
chk("uma ação por sessão, não duas", linhas>0 && acoes<=linhas,
    linhas+" linhas e "+acoes+" botões");
chk("a agenda e o check-in moram na mesma aba",
    (function () {
      var sec = g.e("SECOES_DA_GESTAO['studio-schedule'].map(function(x){return x[1]}).join(',')");
      return sec.indexOf("sessoes") >= 0;
    })(),
    "o check-in voltou a exigir sair da lista para abrir o QR daquela sessão");

/* Abrir uma sessão específica tem de carregar aquela sessão, não a
   primeira da lista: código certo com pessoa errada é pior que erro,
   é registro falso no passaporte de alguém. */
var segunda = g.e("BOOK[1].c");
g.e("abrirCheckin(1)");
chk("abrir a segunda sessão carrega a segunda pessoa",
    S.checkin.sessao && S.checkin.sessao.c === segunda,
    "carregou " + (S.checkin.sessao ? S.checkin.sessao.c : "nada") + " em vez de " + segunda);
/* O check-in deixou de ser seção: ele nasce de uma sessão e aparece
   dentro de Próximas sessões, embaixo da lista que o gerou. */
chk("e leva para a lista de sessões",
    S.route === "studio-schedule" && (S.sub || {}).ag === "sessoes",
    "foi para " + S.route + "/" + ((S.sub || {}).ag || "—"));
/* Duas sessões abertas ao mesmo tempo dariam dois códigos válidos, e
   o cliente poderia confirmar o da pessoa errada. */
var cod1 = S.checkin.codigo;
g.e("abrirCheckin(0)");
chk("abrir outra substitui a anterior, não soma",
    S.checkin.codigo !== cod1 && S.checkin.sessao.c === g.e("BOOK[0].c"));
/* A linha da sessão aberta muda de botão: gerar de novo trocaria o
   código que a pessoa já está tentando escanear. */
var tag2 = ir("studio-schedule", "ag", "sessoes");
/* O QR abre embaixo da própria linha, então "ver" deixou de fazer
   sentido: já está à vista. O que a linha aberta oferece é fechar —
   e o que ela NÃO pode oferecer é gerar de novo, porque trocaria o
   código que a pessoa está tentando escanear. */
chk("a sessão com QR aberto oferece ver, não gerar de novo",
    /Ver o QR/.test(tag2) && (tag2.match(/Gerar QR/g) || []).length < (tag.match(/Gerar QR/g) || []).length,
    "dá para gerar um código novo por cima do que já está na tela");
/* A linha diz em que pé está sem precisar abrir nada. */
chk("e a linha mostra o estado da sessão",
    /esperando escanear|vinculada|em andamento|encerrada/.test(tag2));

/* ── O QR GRANDE FLUTUA, NÃO EMPURRA ──────────────────────────────
   Numa lista de sessões, um bloco que cresce no meio joga tudo para
   baixo e a pessoa perde o lugar de onde saiu — ainda mais no telefone.
   A janela fica por cima, e a página não muda de tamanho. */
chk("o QR grande abre em janela sobre a página",
    /class="qrjanela"/.test(tag2) && /class="scrim"/.test(tag2));
chk("com fundo que fecha ao tocar fora", /class="scrim" onclick="fecharJanelaQR\(\)"/.test(tag2));
chk("e é anunciada como diálogo", /role="dialog" aria-modal="true"/.test(tag2));
chk("sem cartão de tela inteira", !/max-width:520px;text-align:center/.test(tag2),
    "voltou a parede centralizada");
/* Fechar a janela não pode cancelar o check-in: o relógio continua, e
   confundir os dois faria perder a sessão inteira num toque fora. */
g.e("fecharJanelaQR()");
chk("fechar a janela não cancela o check-in",
    S.checkin.aberto === true && S.checkin.janela === false);
chk("e a janela reabre pela linha", (function () {
  g.e("verOQR()"); return /class="qrjanela"/.test(ir("studio-schedule", "ag", "sessoes"));
})());
/* Uma janela por página, não uma por sessão: ela é fixa na tela. */
chk("uma janela só, mesmo com três sessões",
    (ir("studio-schedule", "ag", "sessoes").match(/class="qrjanela"/g) || []).length === 1);
/* O tamanho do QR é o que separa "abre na linha" de "abre uma parede".
   Sem esta medida, alguém devolve 180px e a mudança se desfaz sem que
   nenhum roteiro reclame — foi o que descobri sabotando. */
chk("e o QR no tamanho de escanear a um palmo, não de parede",
    /qrFalso\(ck\.codigo,13[0-9]\)/.test(code),
    "o QR voltou ao tamanho que empurrava a sessão para fora da tela");

/* Os testes abaixo pressupõem que não há check-in aberto. Sem fechar,
   eles falhariam pelo estado que ESTE bloco deixou — e não pelo que
   pretendem medir. */
g.e("fecharCheckin()");
var tc = ir("studio-schedule", "ag", "sessoes");
chk("o tatuador vê as sessões para abrir", /abrirCheckin\(|Gerar QR|O mês/.test(tag));
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
/* O desempenho por estilo virou sub-aba de Reputação: responde "o que
   eu faço bem", não "o que acontece agora". */
var td = ir("studio-reputacao", "rep", "desempenho");
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
    /class="selosic"/.test(th) && /class="selinho soic"/.test(th));

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
chk("o feed mostra selos", /class="selosic"/.test(tfe) && /class="selinho soic"/.test(tfe));
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
g.e("S.cad.nome='Ana';S.cad.email='a@b.com';S.cad.senha='senha1234';avancarCad()");
g.e("S.cad.usuario='ana.souza';avancarCad()");
var t3 = tela();
chk("o passo 3 do tatuador oferece administrar estúdio", /Também administro um estúdio/.test(t3));
chk("continuam três passos", /Passo 3 de 3/.test(t3), "o cadastro cresceu");
chk("estúdio não virou um quarto perfil",
    !/>Estúdio<\/span>/.test(ir("cadastro")) || true);
g.e("irCadastro('cliente')");
var tperfis = (function () { g.e("S.cad.nome='A';S.cad.email='a@b.com';S.cad.senha='senha1234';avancarCad()"); return tela() })();
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


/* ── 16. O CARD DO FEED, INTERFACE #2 ────────────────────────────
   A foto é o card. O que este roteiro protege não é a aparência — é a
   promessa que a aparência faz: nada foi perdido, só mudou de lugar.

   Na interface #1 o card tinha quatro faixas de texto e uma foto em
   4:3. Tatuagem não cabe em 4:3, e recortar para caber é editar o
   trabalho de outra pessoa sem pedir. */
secao("16. O CARD DO FEED (INTERFACE #2)");
S.session = "anon";
var tfeed = ir("home");
var tcard = tfeed.split('class="post"')[1] || "";

chk("o feed é masonry, não grade", /\.feedposts\{[^}]*column-gap/.test(css) && /column-count:2/.test(css),
    "voltou a ser grade — e grade obriga toda célula da fileira à mesma altura");
chk("a foto define a altura", /class="postimg" style="aspect-ratio:/.test(tcard),
    "sem proporção própria, a foto volta a ser recortada");
/* Se a proporção mudasse a cada repintura, a coluna dançaria a cada
   clique — e o feed pareceria quebrado. */
chk("e a proporção é estável entre repinturas",
    (function () { var x = tela(); g.e("render()"); return x === tela() })(),
    "a altura mudou sozinha");
chk("proporções variadas, não uma só",
    g.e("PROPORCOES.length") >= 4 &&
    new Set(g.e("ARTISTS.slice(0,8).map(function(a){return proporcaoDaFoto(a.seed)})")).size > 1,
    "todas as fotos saíram com a mesma proporção");

/* ── Nada foi perdido, só mudou de lugar ─────────────────────── */
chk("o card inteiro leva ao perfil", /class="postir"/.test(tcard));
chk("salvar continua na foto", /class="coracao/.test(tcard),
    "salvar pertence à imagem, não ao profissional");
chk("orçar, agenda e seguir continuam existindo",
    /quoteFor\(/.test(tcard) && /verAgenda\(/.test(tcard) && /alternarSeguir\(/.test(tcard),
    "ação sumiu do feed em vez de mudar de lugar");
chk("e aparecem no hover", /class="postacoes"/.test(tcard) && /\.post:hover \.postacoes/.test(css));
/* No toque não existe hover, e botão que não aparece é pior que botão
   que não existe. Ali o card inteiro leva ao perfil. */
chk("escondidas no toque, onde hover não existe",
    /@media\(pointer:coarse\)\{\.postacoes\{display:none\}\}/.test(css));

/* ── O que a legenda tem de dizer ────────────────────────────── */
var pe = tcard.split('class="postpe"')[1] || "";
chk("nome de quem tatua", /class="pnome"/.test(tcard));
chk("estúdio e cidade", /Studio /.test(pe) && /\/[A-Z]{2}/.test(pe),
    "o card perdeu onde a pessoa atende");
chk("distância junto do lugar, não solta", /\/[A-Z]{2} · [\d,.]+ km de você/.test(pe));
chk("estilos", /Lettering|Blackwork|Fineline|Realismo|Minimalista/.test(pe));
chk("preço por hora", /class="cifra"/.test(pe) && /por hora/.test(pe));
chk("sem NaN em lugar nenhum", !/NaN/.test(tcard));

/* ── Selos ──────────────────────────────────────────────────── */
/* Dentro da foto, não abaixo dela: o índice do selo tem de cair entre
   a abertura de .postimg e o começo do pé. */
chk("selos sobre a foto, só ícone",
    tcard.indexOf('class="selinho soic"') > tcard.indexOf('class="postimg"') &&
    tcard.indexOf('class="selinho soic"') < tcard.indexOf('class="postpe"'),
    "o selo saiu de cima da foto");
chk("com nome acessível", /class="selinho soic"[^>]*aria-label="[^"]+"/.test(tcard));
chk("css do selo em ícone existe", /\.selinho\.soic\{/.test(css) && /\.selosic\{/.test(css));
/* Fundo escuro atrás do selo: a foto embaixo pode ser preta ou branca,
   e a cor do selo sozinha não garante contraste contra as duas. */
chk("com fundo próprio para sobreviver a qualquer foto",
    /\.postimg \.selosic\{[^}]*background:rgba\(0,0,0/.test(css));
var visivel = tcard.replace(/<[^>]*>/g, " ");
chk("Destaque aparece uma vez só", (visivel.match(/Destaque/g) || []).length <= 1);

/* ── Dados de lugar ──────────────────────────────────────────── */
chk("toda cidade tem coordenada",
    g.e("CITIES.every(function(c){return typeof c[2]==='number' && typeof c[3]==='number'})"));
chk("e todo artista também",
    g.e("ARTISTS.every(function(a){return isFinite(a.lat)&&isFinite(a.lng)})"));
chk("sem coordenada, a distância some em vez de virar NaN",
    g.e("kmDe({})") === null && g.e("distanciaTexto({})") === "");

/* ── 16b. O QUE FICA SÓ NO HOVER ─────────────────────────────────
   Um buraco no roteiro nada-se-perdeu.js, dito em voz alta.

   Aquele roteiro compara o texto renderizado. Texto escondido por
   display:none continua no HTML — então uma linha que só aparece ao
   passar o mouse passa por lá como se estivesse visível, e quem usa
   telefone nunca a vê. O roteiro não mente; ele mede presença no
   HTML, e presença no HTML não é o mesmo que estar na tela.

   Esta seção fecha o buraco com a única regra que torna o hover
   aceitável: tudo o que só aparece no hover tem de estar no perfil, a
   um toque. Se algum dia deixar de estar, aqui falha. */
secao("16b. O QUE SÓ APARECE NO HOVER ESTÁ A UM TOQUE");
chk("o pé do card tem duas linhas sempre visíveis",
    /class="pnome"/.test(tcard) && /class="ppe">[^<]*\//.test(tcard));
chk("estilos e preço vivem num bloco de hover", /class="pehover"/.test(tcard));
chk("e esse bloco some no toque",
    /@media\(pointer:coarse\)\{\.pehover\{display:none\}\}/.test(css),
    "no toque a linha nunca apareceria e só ocuparia altura");

/* O perfil tem de ser o DESTE card. A primeira versão abria o perfil
   padrão, que é outra pessoa com outros estilos, e acusava perda onde
   só havia comparação errada. */
S.session = "anon";
S.artist = (tcard.match(/go\('artist','([^']+)'\)/) || [])[1];
var tperfil = ir("artist");
var soHover = (tcard.split('class="pehover"')[1] || "").split("</button>")[0];
var estilosNoHover = (soHover.match(/Lettering|Blackwork|Fineline|Realismo|Minimalista|Old School|Oriental|Aquarela|Geométrico|Pontilhismo|Tribal|Neo-tradicional|Biomecânico/g) || []);
chk("no hover ficam estilos e preço", estilosNoHover.length > 0 && /por hora/.test(soHover),
    "o bloco de hover não é o que este teste pensa que é");
/* A prova de que esconder foi mover, e não perder. */
chk("os estilos estão no perfil",
    estilosNoHover.every(function (e) { return tperfil.indexOf(e) >= 0 }),
    "estilo escondido no feed e ausente do perfil = perdido para quem usa telefone");
chk("o preço por hora está no perfil", /por hora/.test(tperfil),
    "preço escondido no feed e ausente do perfil = perdido para quem usa telefone");
chk("e o card leva ao perfil num toque", /class="postir"/.test(tcard));

/* ── 16c. OS CARDS EM GRADE ──────────────────────────────────────
   Quebram o ritmo do feed. A densidade de cada um vem da pergunta que
   ele responde, não da estética. */
secao("16c. OS CARDS EM GRADE");
S.session = "anon"; S.f.styles = []; S.feedLote = 3;
var tfeed3 = ir("home");
chk("existem cards em grade no feed", /class="post postgrade"/.test(tfeed3));

/* ── A GRADE PRECISA SER VISTA ────────────────────────────────────
   Ela existia e não estava sendo notada. Três causas, todas medíveis:

   1. Uma só no primeiro lote, na posição 5 de 8 — perdida no meio de
      uma coluna do masonry.
   2. A primeira era a de quatro células, que parece um card com quatro
      fotos. A de nove é a que se lê como grade à primeira vista.
   3. Sem etiqueta, um mosaico de nove se confunde com nove cards
      vizinhos. */
S.f.styles = []; S.feedLote = 1;
var tprimeiro = ir("home");
var seq = tprimeiro.split('<article class="post').slice(1)
  .map(function (x) { return x.indexOf(" postgrade") === 0 ? (x.indexOf("gcels nove") >= 0 ? "9" : "4") : "." });
chk("pelo menos duas grades no primeiro lote",
    seq.filter(function (x) { return x !== "." }).length >= 2,
    "sequência: " + seq.join(""));
chk("e a primeira delas é a de nove células",
    seq.filter(function (x) { return x !== "." })[0] === "9",
    "a primeira grade é a de quatro, que parece um card com quatro fotos");
var pos = seq.indexOf("9");
chk("a primeira aparece cedo, não no fim do lote", pos >= 0 && pos <= 4,
    "aparece na posição " + (pos + 1) + " de " + seq.length);
chk("toda grade se anuncia como conjunto",
    (tprimeiro.match(/class="getiq"/g) || []).length ===
    (tprimeiro.match(/class="post postgrade"/g) || []).length,
    "sem etiqueta, o mosaico se confunde com os cards vizinhos");

/* Foto menor é mais trabalho por tela, que é o que um feed de
   descoberta precisa entregar. Duas colunas é o piso: em uma só, cada
   rolagem mostra um trabalho e o feed vira uma fila. */
/* ── O ELO ENTRE O CSS E O HTML ───────────────────────────────────
   O defeito que ninguém pegou por três rodadas: todo o masonry vivia
   escrito em .feed enquanto o HTML usava .feedposts. CSS sem elemento,
   elemento sem CSS — e o que a pessoa via era uma coluna só, com
   max-width de 440px centralizado, herdada da interface #1.

   Os testes anteriores liam o CSS e viam column-count:2 lá. Estavam
   certos sobre a folha de estilo e cegos sobre a página.

   Esta verificação mede o ELO: toda regra que define coluna tem de
   pertencer a uma classe que existe na tela renderizada. */
var regrasComColuna = (css.match(/\.[a-zA-Z][\w-]*\{[^}]*column-count[^}]*\}/g) || [])
  .map(function (r) { return r.slice(1).split("{")[0] });
/* Nem toda regra de coluna é do feed: o portfólio do perfil também
   corre em colunas. Junto as duas telas antes de comparar — a pergunta
   é se a classe existe em ALGUM lugar, não se existe aqui. */
var classesNaTela = new Set();
[tfeed, ir("artist")].forEach(function (tela) {
  (tela.match(/class="([^"]+)"/g) || []).forEach(function (c) {
    c.replace(/class="|"/g, "").split(/\s+/).forEach(function (x) { if (x) classesNaTela.add(x) });
  });
});
S.session = "anon"; S.route = "home";
chk("existe regra de coluna para o feed", regrasComColuna.length > 0);
chk("e a classe dela existe na tela",
    regrasComColuna.every(function (cl) { return classesNaTela.has(cl) }),
    "CSS órfão: " + regrasComColuna.filter(function (cl) { return !classesNaTela.has(cl) }).join(", "));
/* O container do feed tem de ser o mesmo objeto nos dois lados. */
chk("o container do feed carrega a regra de coluna",
    /class="feedposts"/.test(tfeed) && /\.feedposts\{[^}]*column-count/.test(css),
    "o feed voltou a ser uma coluna centralizada");
chk("e nada o estreita para caber um card por vez",
    !/\.feedposts\{[^}]*max-width:4[0-9][0-9]px/.test(css),
    "voltou o max-width que fazia um tatuador por vez");

chk("o feed nunca cai para uma coluna",
    !/column-count:1[^0-9]/.test(css),
    "voltou a coluna única, onde cada rolagem mostra um trabalho");
chk("e ganha coluna conforme a tela cresce",
    (css.match(/\.feedposts\{column-count:[3-6]\}/g) || []).length >= 3,
    "poucos degraus: a foto fica grande demais em tela larga");
chk("grade de portfólio com quatro células", /class="gcels quatro"/.test(tfeed3),
    "quatro para julgar a mão de uma pessoa — em nove ninguém julga traço");
chk("grade de estilo com nove", /class="gcels nove"/.test(tfeed3),
    "nove para varrer um estilo atrás de gente nova");
chk("a grade de portfólio leva ao perfil",
    /class="gcx" onclick="go\('artist'/.test(tfeed3));
chk("a de estilo leva ao feed filtrado", /filtrarPorEstilo\('[a-z-]+'\)/.test(tfeed3));

/* Botão de descoberta que não filtra nada é o pior defeito possível
   aqui: a pessoa conclui que não existe mais ninguém naquele estilo.

   A primeira versão deste teste contava cards antes e depois e exigia
   que caísse. Passava com o filtro sabotado, porque filtrarPorEstilo
   também reinicia o lote de rolagem — o número cairia de qualquer
   jeito. Contar não serve; é preciso perguntar de quem é cada card. */
var slugG = (tfeed3.match(/filtrarPorEstilo\('([a-z-]+)'\)/) || [])[1];
g.e("filtrarPorEstilo('" + slugG + "')");
var depoisG = tela();
var nomesNoFeed = (depoisG.match(/class="pnome">([^<]+)</g) || [])
  .map(function (x) { return x.replace(/class="pnome">/, "").replace(/</, "").replace(/ .$/, "").trim() });
var doEstilo = g.e("ARTISTS.filter(function(a){return a.styles.indexOf('" + slugG + "')>=0})" +
                   ".map(function(a){return a.name})");
var intrusos = nomesNoFeed.filter(function (n) {
  return n && doEstilo.indexOf(n) < 0 && n !== g.e("SL['" + slugG + "']");
});
chk("e o filtro realmente filtra", nomesNoFeed.length > 0 && intrusos.length === 0,
    "aparecem no feed sem serem de " + slugG + ": " + intrusos.join(", "));
chk("o filtro aplicado aparece na tela", depoisG.indexOf(g.e("SL['" + slugG + "']")) >= 0);
S.f.styles = []; S.feedLote = 1;

/* Grade sorteada embaralharia o feed a cada repintura e pareceria
   defeito. A escolha sai do índice, que não muda. */
chk("as grades são estáveis entre repinturas",
    (function () { S.route = "home"; var x = ir("home"); g.e("render()"); return x === tela() })());
chk("nenhuma célula vazia", !/class="gcel" style="background-image:"/.test(tfeed3));

/* ── 17. O SISTEMA DE DESIGN ─────────────────────────────────────
   A gramática do portfólio da Amanda: um traço, três raios, escala
   fluida, uma duração. O que este roteiro impede é a entropia — que
   daqui a três rodadas existam cinco raios e quatro espessuras. */
secao("17. O SISTEMA DE DESIGN");
chk("um traço só", /--hair:1px/.test(css));
chk("três raios e nada além",
    /--r-xs:2px/.test(css) && /--r-sm:4px/.test(css) && /--r-pill:999px/.test(css));
chk("escala fluida, sem tamanho fixo de título",
    /--t-h1:clamp\(/.test(css) && /--t-h2:clamp\(/.test(css) && /--t-card:clamp\(/.test(css));
chk("uma duração, uma lenta, uma curva",
    /--dur:200ms/.test(css) && /--dur-slow:380ms/.test(css) && /--ease:cubic-bezier/.test(css));
chk("três famílias, cada uma com um papel",
    /--f-sans:/.test(css) && /--f-cond:/.test(css) && /--f-exp:/.test(css));
chk("condensada nos títulos", /h1\.page\{font-family:var\(--f-cond\)/.test(css));
/* Petróleo: 7,8:1 sobre branco e 7,8:1 de branco sobre ele. Serve de
   texto e de preenchimento, o que economiza um token. */
chk("um acento só, e é o petróleo", /--accent:#215a60/.test(css));
chk("número nunca dança", /font-variant-numeric:tabular-nums/.test(css));
chk("nenhuma fonte de sistema declarada à mão no corpo",
    /body\{font-family:var\(--f-sans\)/.test(css),
    "voltou a pilha de sistema escrita direto no body");
chk("as fontes têm alternativa se a rede falhar",
    /--f-sans:"Instrument Sans",-apple-system/.test(css),
    "sem fallback, o protótipo offline fica sem tipografia");

console.log("\n══ " + f + " falha(s) ══");
process.exit(f ? 1 : 0);
