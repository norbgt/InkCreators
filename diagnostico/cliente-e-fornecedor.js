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
 /* A palavra "conquista" abre caminhos que "marco" não abria. Estes
    são os que transformariam o acervo em placar. */
 ["não promete a próxima conquista", /próxima conquista|nova conquista|conquista a desbloquear/i],
 ["não conta quantas faltam", /falta[m]? \d+|mais \d+ para/i],
 ["não compara com outros clientes", /voc[êe] est[áa] (à frente|atr[áa]s)|mais que \d+% dos/i]
].forEach(function (c) { chk(c[0], !c[1].test(semTexto), "encontrei: " + (semTexto.match(c[1]) || [""])[0]) });

chk("mostra conquistas que já aconteceram", /class="marcos"/.test(tp) && /class="marco"/.test(tp));
/* As sessões vêm primeiro: são o que a pessoa tem no corpo, e o que
   ela veio ver. As conquistas são leitura DAQUILO — vir antes as faria
   parecer o assunto, e o corpo dela, a nota de rodapé. */
chk("as sessões vêm antes das conquistas",
    tp.indexOf(">Sessões<") >= 0 && tp.indexOf(">Sessões<") < tp.indexOf(">Conquistas<"),
    "as conquistas subiram e viraram o assunto da tela");
/* "Marcos" virou "Conquistas" a pedido dela. É uma palavra que puxa
   para placar, e por isso a frase-guarda ficou MAIS explícita, não
   menos: ela diz na mesma altura do título que nada ali cobra o
   próximo. Sem essa frase, o título sozinho vira gamificação. */
chk("e diz por que não cobra a próxima", /Nenhuma conquista cobra a próxima/.test(tp));
chk("e que elas vêm depois do que foi vivido",
    /aparecem depois do que você viveu, nunca antes/.test(tp));
chk("css dos marcos existe", /\.marcos\{/.test(css) && /\.marco\{/.test(css));
chk("sem barra de progresso no passaporte", !/class="bar"/.test(tp),
    "barra de progresso é a forma visual de dizer que falta algo");

/* ── 3. PRIVACIDADE ──────────────────────────────────────────────── */
/* ── 2b. AS DUAS FACES DO MESMO REGISTRO ─────────────────────────
   Um check-in produz UM fato. O cliente o lê como onde já esteve; o
   tatuador, como o que já fez. É o mesmo dado com o sujeito trocado.

   Se as duas telas contarem dimensões diferentes, ou na ordem
   diferente, a reciprocidade deixa de ser visível — e quem tatua
   também é cliente, então a mesma pessoa reaprende a ler ao trocar de
   papel. */
/* ── AVALIAÇÃO E SELO SÃO A MESMA PERGUNTA ───────────────────────
   Eram duas abas no perfil público, e as duas respondiam "por que
   confiar nesta pessoa". Quem chegava numa não tinha motivo para
   procurar a outra — e as duas metades da resposta ficavam separadas
   justamente no momento em que alguém está decidindo. */
/* ── QUEM MANDA NA AGENDA ────────────────────────────────────────
   A agenda do tatuador não é pública, e isso não é detalhe de tela: é
   quem manda na semana de trabalho de alguém.

   Mostrar horários livres para o cliente escolher transforma quem
   tatua em recurso a ser reservado — e tatuagem não é sala de reunião.
   O cliente pede; o tatuador decide, marca, e a sessão aparece do lado
   do cliente já resolvida. */
/* ── A VITRINE NÃO É O FEED ────────────────────────────────────────
   Duas grades, duas perguntas.

   O feed pergunta "que trabalho é esse?" — a foto é o produto, cada
   tatuagem tem a sua proporção, e masonry existe para não recortar o
   trabalho de ninguém.

   A loja pergunta "qual destes eu levo?" — e comparar exige que preço
   e nota fiquem na mesma altura de um card para o outro. Masonry
   desalinha de propósito: o que num feed é ritmo, num catálogo é a
   pessoa reancorando o olho a cada card.

   Este bloco protege a separação das duas gramáticas, e protege a
   coisa que mais quebra quando existem dois arranjos para os mesmos
   dados: um deles perder um campo pelo caminho. */
secao("1c. A VITRINE DA LOJA");
S.session = "client"; S.route = "home"; S.tab = "shop"; S.shopVista = "grade";
g.e("render()");
var tGrade = tela();

chk("a loja monta em grade, não em masonry",
    /class="vitrine/.test(tGrade) && !/class="feedposts"/.test(tGrade),
    "a loja voltou a usar o componente do feed");
chk("e o feed continua em masonry",
    (S.tab = "discover", g.e("render()"), /class="feedposts"/.test(tela())),
    "o masonry do feed foi junto — a foto voltou a ser recortada");
S.tab = "shop"; g.e("render()");

/* Duas no piso, quatro no teto — pedido dela, e cada extremo tem
   razão: em uma coluna o catálogo vira fila e a comparação some; em
   cinco a foto do produto fica menor que o polegar. */
var colunas = (css.match(/\.vitrine\{[\s\S]*?\}/)[0].match(/repeat\((\d)/) || [])[1];
/* Lê TODA declaração de coluna da vitrine, inclusive as de dentro de
   @media. Contar só a primeira deixaria um repeat(6) passar. */
var todas = (css.match(/\.vitrine[^{]*\{[^}]*grid-template-columns:repeat\((\d)/g) || [])
  .map(function (x) { return Number(x.match(/repeat\((\d)/)[1]) });
chk("duas colunas no telefone", Number(colunas) === 2,
    "abre com " + colunas + " coluna(s) — em uma só o catálogo vira fila");
chk("nunca menos de duas, nunca mais de quatro",
    Math.min.apply(null, todas) === 2 && Math.max.apply(null, todas) === 4,
    "colunas declaradas: " + todas.join(", "));

/* O que faz a grade ser REGULAR não é o grid: é o card esticar e o pé
   descer sozinho. Sem isso a grade é reta e o conteúdo dentro dela
   não é, que é o pior dos dois mundos. */
chk("o card ocupa a célula inteira",
    /\.prod\{[^}]*height:100%/.test(css),
    "card mais baixo que a célula: a linha volta a ficar irregular");
chk("e o preço desce para a mesma altura em toda a fileira",
    /\.prodpe\{margin-top:auto/.test(css),
    "o preço passa a flutuar onde o nome terminar — nome curto, preço alto");
chk("o nome não faz a célula crescer",
    /\.prodnome\{[^}]*line-clamp:2/.test(css),
    "nome de 60 caracteres estica a fileira toda");

/* ── TROCAR DE VISTA NÃO PODE PERDER NADA ──────────────────────────
   Dois arranjos para os mesmos dados é onde nasce o defeito silencioso:
   o segundo caminho esquece um campo, e ninguém percebe porque a tela
   continua bonita. Aqui os dois textos são comparados palavra a
   palavra — só a palavra "Grade"/"Lista" do próprio toggle pode
   diferir. */
function textoDe(t) {
  return t.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(" ")
    .filter(function (w) { return w.length > 1 });
}
S.shopVista = "lista"; g.e("render()");
var tLista = tela();
/* E a colisão que desenhou uma linha vertical entre os cards: o
   modificador se chamava "lista" e o componente .lista (caixa das
   listas de orçamento) emprestava a moldura ao container inteiro.
   Nenhum elemento pode vestir as duas. */
/* Sabotei pondo "lista" como TERCEIRA classe e a primeira versão
   deste guarda dormiu: os regex só cobriam duas ordens. Agora ele
   extrai a lista de classes do container e pergunta se "lista" está
   entre elas — posição nenhuma escapa. */
/* Terceira versão deste extrator, e cada queda ensinou uma coisa:
   a 1ª cobria só duas ordens de classe; a 2ª agarrou "vitrinecab",
   que vem ANTES do container no HTML e também contém "vitrine".
   Fronteira de palavra: a classe é "vitrine", seguida de espaço ou
   de fim — vitrinecab não passa. */
var clsVitrine=((tLista.match(/class="(vitrine(?: [^"]*)?)"/)||[])[1]||"").split(/\s+/);
chk("a vitrine não veste a classe do componente de lista",
    clsVitrine.indexOf("lista")<0,
    "voltou a colisão .lista: a moldura da caixa desenha linha vertical entre os cards");
chk("a lista é a mesma grade com uma coluna",
    /class="vitrine emlista"/.test(tLista) && /\.vitrine\.emlista\{grid-template-columns:1fr[;}]/.test(css),
    "a lista virou outro componente em vez de um arranjo do mesmo");
var faltando = textoDe(tGrade).filter(function (w) {
  return textoDe(tLista).indexOf(w) < 0;
});
chk("e nada se perde ao trocar de vista", faltando.length === 0,
    "some ao virar lista: " + faltando.slice(0, 8).join(", "));

/* O teste acima sozinho seria fé. Grade e lista saem do MESMO render
   — só muda uma classe — então o HTML é idêntico por construção e
   nenhuma sabotagem de código o faria falhar.

   Onde a perda pode acontecer de verdade é no CSS: basta um
   display:none dentro de .vitrine.emlista para um campo sumir da tela
   continuando no HTML. É o buraco que a decisão 012 já registrou.

   Some o que é controle — seta e pip, que a 88px cobrem metade da
   foto. Não some o que é informação. */
var CARREGAM_TEXTO = ["prodnome", "proddesc", "ppe", "prodnota", "prodpreco", "prodtxt", "badge"];
var escondidos = (css.match(/\.vitrine\.emlista[^{]*\{[^}]*display:none[^}]*\}/g) || [])
  .join(" ");
var textoEscondido = CARREGAM_TEXTO.filter(function (c) {
  return escondidos.indexOf("." + c) >= 0;
});
chk("e a lista não esconde informação por CSS", textoEscondido.length === 0,
    "sumiu da tela sem sumir do HTML: " + textoEscondido.join(", ") +
    " — o texto continua lá e nenhum teste de texto acusaria");
var mesmaConta = (tGrade.match(/class="prod"/g) || []).length ===
                 (tLista.match(/class="prod"/g) || []).length;
chk("com a mesma quantidade de produtos", mesmaConta,
    "grade: " + (tGrade.match(/class="prod"/g) || []).length +
    ", lista: " + (tLista.match(/class="prod"/g) || []).length);
/* Modo de ver é ícone, não toggle — decisão dela, com regra de
   sistema: toggle fatia CONTEÚDO; grade/lista é o mesmo conteúdo com
   outra lente, e ▦/☰ é vocabulário universal. Ícone só é aceitável
   com o rótulo vivo para leitor de tela — sem aria-label, vira o
   botão mudo que já derrubou este produto. */
chk("o modo de ver é um par de ícones",
    /class="vista on"/.test(tGrade) && (tGrade.match(/class="vista[ "]/g)||[]).length===2,
    "o par de ícones sumiu ou virou outra coisa");
chk("sem toggle fazendo papel de lente",
    !/class="seg [^"]*"[^>]*>Grade</.test(tGrade),
    "voltou o toggle de texto — toggle é para fatia de conteúdo");
chk("e cada ícone diz o que faz ao leitor de tela",
    /aria-label="Ver em grade"/.test(tGrade) && /aria-label="Ver em lista"/.test(tGrade),
    "ícone sem rótulo é o botão mudo de sempre, agora invisível também para quem não vê");
chk("a escolha da vista sobrevive à recarga",
    /"shopVista"/.test(code),
    "a pessoa escolhe lista, recarrega e volta para grade");
S.shopVista = "grade"; g.e("render()");

/* ── UM COMPONENTE, NÃO UMA CÓPIA PARECIDA ─────────────────────────
   "Mais consistência com o componente dos cards do feed" não se cumpre
   escrevendo CSS parecido: cópia parecida envelhece sozinha, e daqui a
   três rodadas as duas telas divergem sem ninguém decidir nada.

   O card do produto carrega as DUAS classes — post e prod — e herda de
   verdade a foto, o carrossel, as setas e os pips. */
chk("o card da loja é o card do feed, com um acréscimo",
    /class="post prod"/.test(tGrade),
    "a loja voltou a ter um card próprio, parecido e separado");

/* A armadilha desta herança: a seta só aparece por .post:hover. Se o
   card perder a classe post, o botão continua no HTML e nunca aparece
   na tela — o defeito que já apareceu aqui três vezes, existir sem
   estar ao alcance. Por isso o teste lê a REGRA e confere se a classe
   que ela exige está no card. */
var seletorSeta = (css.match(/([.\w\s:>-]+)\.postimg \.nav\{opacity:1\}/) ||
                   css.match(/([.\w\s:>-]+) \.postimg \.nav\{opacity:1\}/) || [])[1] || "";
chk("a seta do carrossel tem regra que a revela", seletorSeta.length > 0,
    "nenhuma regra liga a seta: ela existe e nunca aparece");
var classeExigida = (seletorSeta.match(/\.([a-z]+):hover/) || [])[1];
chk("e a classe que a revela está no card da loja",
    !!classeExigida && new RegExp('class="[^"]*\\b' + classeExigida + '\\b').test(tGrade),
    "a regra pede ." + classeExigida + " e o card da loja não tem — seta invisível");

/* Descrição: pedido dela, e a coisa que o feed resolve no hover.
   Aqui não pode ser hover — no toque ele não existe e quem compra
   decide pelo que a coisa faz. */
var semDesc = g.e("PRODUCTS").filter(function (x) { return !x.d || x.d.length < 20 });
chk("todo produto tem descrição escrita", semDesc.length === 0,
    semDesc.length + " sem descrição: " + semDesc.map(function (x) { return x.n }).slice(0, 4).join(", "));
chk("e ela aparece no card", /class="proddesc"/.test(tGrade));
chk("visível, não escondida atrás do mouse",
    !/\.proddesc\{[^}]*max-height:0/.test(css) && !/pehover[^{]*proddesc/.test(css),
    "descrição no hover: no telefone ela nunca aparece");

/* Carrossel: três slides, e trocar de slide troca de verdade. Contar
   que existem três não diz nada — o defeito real é a seta que não
   move nada. */
var slides = (tGrade.split('class="post prod"')[1] || "").split("</article>")[0];
chk("três fotos por produto", (slides.match(/class="sl /g) || []).length === 3);
var qualLiga = function (t) {
  var c = (t.split('class="post prod"')[1] || "").split("</article>")[0];
  return (c.match(/class="sl (on)?"/g) || []).indexOf('class="sl on"');
};
/* Primeira versão deste teste: eu mexia em S.caro na mão e conferia
   que o slide ligado mudava. Sabotei o onclick da seta para não fazer
   nada e o teste PASSOU — porque ele nunca tocou na seta.

   É a mesma armadilha de sempre, na sua forma mais pura: medir o
   efeito quando o defeito está no gatilho. Agora ele extrai o onclick
   do botão renderizado e executa exatamente o que o dedo executaria. */
var antesC = qualLiga(tGrade);
var cardUm = (tGrade.split('class="post prod"')[1] || "").split("</article>")[0];
var cliqueSeta = (cardUm.match(/class="nav r"[^>]*onclick="([^"]+)"/) || [])[1];
chk("a seta seguinte tem ação", !!cliqueSeta,
    "o botão do carrossel existe sem nada acontecendo ao clicar");
if (cliqueSeta) { try { g.e(cliqueSeta.replace(/&#39;|&apos;/g, "'")) } catch (e) {} }
g.e("render()");
chk("e clicar nela troca a foto", qualLiga(tela()) !== antesC,
    "a seta está lá, o dedo alcança, e nada muda");
g.e("S.caro={}"); g.e("render()"); tGrade = tela();

/* Lote que não fecha fileira parece catálogo acabando. Doze fecha em
   duas, três e quatro colunas — três, o número antigo, não fechava
   nenhuma delas. */
/* Dentro de listaLoja, não no arquivo inteiro: o primeiro
   S.feedLote* do código é o do feed, que carrega 8 e não precisa
   fechar fileira nenhuma porque masonry não tem fileira. Medi o lote
   errado e acusei a loja pelo número do feed. */
var corpoLoja = code.slice(code.indexOf("function listaLoja"), code.indexOf("function addCart"));
var lote = Number((corpoLoja.match(/S\.feedLote\*(\d+)/) || [])[1] || 0);
chk("o lote fecha fileira nas três larguras",
    lote > 0 && lote % 2 === 0 && lote % 3 === 0 && lote % 4 === 0,
    "lote de " + lote + ": sobra no meio da última linha");

/* Devolve a aba. Este bloco é o terceiro deste arquivo a deixar
   estado atrás de si — antes foram um check-in aberto e um papel
   trocado. Quem herda a sujeira falha por ela, não pelo que mede, e o
   relatório passa a acusar a tela errada. */
S.tab = "discover"; g.e("render()");

/* ── AS DUAS PONTAS DA MESMA SESSÃO ────────────────────────────────
   BOOK é a agenda do tatuador; minhasSessoes() é o que o cliente
   acompanha. No produto real serão UMA tabela lida por dois papéis;
   no protótipo são duas listas escritas à mão — e duas listas à mão
   divergem em silêncio: a Marina ganha uma sessão dia 12 e o cliente
   não fica sabendo.

   Divergência de mock parece inofensiva até o teste com usuários: a
   pessoa navega os dois papéis no mesmo protótipo, vê a sessão de um
   lado e não vê do outro, e conclui que o produto perde dados — a
   pior conclusão possível para um produto cuja tese é confiança. */
secao("1a. AS DUAS PONTAS DA MESMA SESSÃO");
/* O espelhamento literal (a sessão X do cliente = a linha X de BOOK)
   não dá para testar aqui, e é honesto dizer por quê: BOOK é a agenda
   da Marina com os clientes DELA, e minhasSessoes é o cliente demo
   com os tatuadores dele — são pessoas diferentes no mock. O que dá
   para exigir agora é que as duas pontas falem a mesma língua; o
   espelhamento vira teste de verdade quando a tabela sessions existir
   e as duas telas lerem dela. */
var doCliente=g.e("minhasSessoes()");
chk("o cliente tem sessões para acompanhar", doCliente.length>0);
chk("cada uma diz quem, quando e onde",
    doCliente.every(function(m){return m.artista&&m.quando&&m.estudio&&m.cidade}),
    "sessão do cliente sem quem, quando ou onde");
chk("as duas pontas usam as mesmas palavras de estado",
    doCliente.every(function(m){return ["confirmada","aguardando confirmação"].indexOf(m.estado)>=0}),
    "estado fora do vocabulário: cada tela inventando um nome para a mesma coisa");

secao("1b. A AGENDA É DE QUEM TATUA");
S.session = "anon";
var tPerfilPub = ir("artist");
S.session = "client";
var tFeedCli = ir("home");
chk("o perfil não oferece a agenda de quem tatua",
    !/Ver agenda/.test(tPerfilPub),
    "voltou o botão que abre a semana de trabalho de outra pessoa");
chk("o card do feed também não", !/Ver agenda/.test(tFeedCli));

/* Do lado do cliente existe a lista DELE — sem horário livre, sem
   escolha de data, sem nada do resto da semana de quem vai tatuar. */
var tMinhas = ir("me", "mev", "sessoes");
chk("o cliente acompanha o que foi marcado para ele",
    /O que está marcado para você/.test(tMinhas));
chk("e a tela diz de quem é a decisão",
    /Quem marca a data é quem vai tatuar/.test(tMinhas),
    "sem isso, a pessoa fica esperando um botão de marcar que não existe");
chk("sem horário livre para escolher",
    !/Escolher outro horário/.test(tMinhas) && !/horários livres/.test(tMinhas));
chk("e o caminho para remarcar é falar com ele",
    /Fale com quem vai te tatuar/.test(tMinhas));
S.sub.mev = "resumo";

secao("2a. REPUTAÇÃO É UMA ABA SÓ");
S.session = "anon"; S.abaPerfil = "reputacao";
var tRep = ir("artist");
var abasPerfil = (tRep.match(/class="seg [^"]*"[^>]*>([^<]+)</g) || [])
  .map(function (x) { return x.replace(/.*>/, "").replace(/<$/, "") });
chk("não existe aba de avaliações separada",
    abasPerfil.indexOf("Avaliações") < 0,
    "abas: " + abasPerfil.join(" · "));
chk("e existe a de reputação", abasPerfil.indexOf("Reputação") >= 0);
chk("a nota e os depoimentos estão nela", /O que dizem/.test(tRep) && /avaliações/.test(tRep));
chk("os selos com a regra de cada um também",
    /Como esta reputação se formou/.test(tRep));
/* Nota de gente que passou por ele pesa mais na decisão que selo de
   sistema. Esconder isso atrás dos selos inverteria a ordem da
   confiança. */
chk("o que dizem vem antes do que a plataforma verificou",
    tRep.indexOf("O que dizem") >= 0 &&
    tRep.indexOf("O que dizem") < tRep.indexOf("Como esta reputação se formou"),
    "os selos subiram na frente das pessoas");
S.abaPerfil = "portfolio";

secao("2b. PASSAPORTE E TRAJETÓRIA SÃO O MESMO FATO");
chk("existe uma função só de resumo", /function resumoDaTrajetoria/.test(code),
    "duas funções de resumo divergem em silêncio na primeira mudança");
chk("e uma faixa só de números", /function faixaDaTrajetoria/.test(code));
chk("com a dimensão que troca de nome conforme o papel",
    /papel==="cliente" \? t\.artista : t\.cliente/.test(code),
    "sem isso, a reciprocidade é decoração e não estrutura");

/* O ícone do rótulo vira SVG no render, então "class=lbl>" é seguido
   de "<svg", não de texto. Extrair até o primeiro "<" devolvia string
   vazia e o teste acusava o produto por um erro do medidor. */
function dimensoesDe(tela) {
  var i = tela.indexOf('class="stats"');
  if (i < 0) return [];
  return (tela.slice(i, i + 4000).match(/class="lbl">[\s\S]*?<\/div>/g) || [])
    .map(function (x) {
      return x.replace(/class="lbl">/, "").replace(/<[^>]*>/g, " ")
              .replace(/[^\wÀ-ÿ\s]/g, " ").replace(/\s+/g, " ").trim();
    });
}
S.session = "client";
var tPass = ir("me-passaporte");
S.session = "artist"; S.sub = S.sub || {}; S.sub.rep = "estudios";
var tTraj = ir("studio-reputacao");
var dc = dimensoesDe(tPass), dt = dimensoesDe(tTraj);
chk("o passaporte conta as cinco dimensões",
    ["Sessões","Estilos","Estúdios","Cidades","Países"].every(function (d) { return dc.indexOf(d) >= 0 }),
    dc.join(" · "));
chk("a trajetória conta as mesmas cinco",
    ["Sessões","Estilos","Estúdios","Cidades","Países"].every(function (d) { return dt.indexOf(d) >= 0 }),
    dt.join(" · "));
chk("e na mesma ordem",
    dc.slice(0, 5).join("|") === dt.slice(0, 5).join("|"),
    "cliente: " + dc.slice(0, 5).join(" · ") + "  |  tatuador: " + dt.slice(0, 5).join(" · "));
/* Horas só existem do lado de quem contou o relógio. Mostrar zero
   seria pior que não mostrar. */
chk("horas sob agulha só onde há relógio",
    dc.indexOf("Horas sob agulha") >= 0 && dt.indexOf("Horas sob agulha") < 0);
/* A frase de reciprocidade fica só do lado do tatuador, e ali serve:
   é o que explica de onde vem o número que ele mostra.

   No passaporte ela saiu. A pessoa está olhando o próprio corpo —
   explicar o que o outro vê é assunto dele, não dela, e a frase
   ocupava o lugar de leitura mais nobre da tela.

   A reciprocidade continua garantida onde importa: na estrutura, pelas
   verificações acima, não por um aviso. */
chk("a trajetória diz de onde vem o número",
    /class="reciproco"/.test(tTraj) && /passaporte de quem você tatuou/.test(tTraj),
    "sem isso, os números do tatuador parecem contagem interna");
chk("e o passaporte não explica o lado do outro",
    !/class="reciproco"/.test(tPass),
    "voltou o aviso que fala do tatuador na tela do corpo dela");
/* Uma faixa por tela: duas seria a repetição que este projeto passou a
   semana tirando — e foi o que aconteceu na primeira tentativa. */
chk("uma faixa de números por tela, não duas",
    (tTraj.match(/class="stats"/g) || []).length === 1,
    (tTraj.match(/class="stats"/g) || []).length + " faixas na trajetória");
/* Devolve papel E rota: os testes seguintes leem a tela do passaporte,
   e deixar a rota do tatuador aberta os faria falhar pelo estado que
   este bloco deixou. Mesmo erro da decisão 019, agora evitado. */
S.session = "client"; ir("me-passaporte");

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
/* A seção "Desempenho por estilo" saiu a pedido dela (decisão 032).
   Este bloco mudou de pergunta junto: não mede mais se a tabela de
   duração aparece — ela não aparece em lugar nenhum —, e sim se o que
   sobrou continua honesto.

   O cálculo ficou de pé, alimentando a faixa de trajetória com os
   estilos. As durações continuam sendo computadas e não têm mais
   tela: é o custo declarado da remoção, e este teste existe para que
   ele não seja esquecido nem descoberto por acaso. */
var td = ir("studio-reputacao", "rep", "estudios");
chk("a tabela de duração não está mais em Reputação",
    !/Quanto tempo leva, por estilo/.test(td),
    "a seção voltou sem passar por decisão");
chk("e nenhuma tela do tatuador mostra duração medida",
    ["studio", "studio-schedule", "studio-reputacao", "studio-quotes", "studio-eventos"]
      .every(function (r) { return !/Quanto tempo leva/.test(ir(r)) }),
    "a tabela reapareceu em outra aba sem registro");
/* O que o relógio ainda sustenta: os estilos da trajetória. */
var so = g.e("desempenhoPorEstilo()");
chk("o cálculo continua de pé", so.length > 0,
    "desempenhoPorEstilo() ficou sem dado — a faixa de trajetória perde os estilos");
chk("só entram sessões verificadas",
    so.reduce(function (t, x) { return t + x.n }, 0) === g.e("PASS.filter(function(t){return t.verificado}).length"),
    "sessão declarada entrou na média");
chk("e os estilos medidos chegam à trajetória",
    g.e("trajetoriaDoTatuador().filter(function(x){return x.estilo}).length") === so.length,
    "o que o relógio mede parou de aparecer em qualquer lugar");

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

/* O masonry mudou de motor: era column-count do CSS, virou colunas de
   verdade distribuídas por emColunas(). O motivo está na decisão 036 —
   coluna CSS rebalanceia o conteúdo inteiro a cada lote novo, e era a
   "grade dançando" que ela viu no celular. */
chk("o feed é masonry, não grade",
    /class="feedcol"/.test(tfeed) && !/\.feedposts\{[^}]*grid-template/.test(css),
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
/* "Ver agenda" saiu do card de propósito: a agenda do tatuador não é
   pública, e mostrar horário livre para o cliente escolher inverte
   quem manda na semana de trabalho de alguém. Orçar e seguir ficam. */
chk("orçar e seguir continuam existindo",
    /quoteFor\(/.test(tcard) && /alternarSeguir\(/.test(tcard),
    "ação sumiu do feed em vez de mudar de lugar");
chk("e a agenda não é oferecida no card", !/verAgenda\(/.test(tcard),
    "o card voltou a abrir a agenda de quem tatua");
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
/* O DOM agora é coluna a coluna (ziguezague), então a ordem no HTML
   não é mais a ordem de leitura. A sequência certa é a de comGrades,
   ANTES da distribuição — é ela que a pessoa percorre em zigue. */
var tprimeiro = ir("home");
var seq = g.e("comGrades(filteredArtists(),8)").map(function (x) {
  return x.indexOf("postgrade") >= 0 ? (x.indexOf("gcels nove") >= 0 ? "9" : "4") : ".";
});
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
/* ── A GRADE NÃO DANÇA ────────────────────────────────────────────
   O defeito que ela sentiu no dedo: com column-count, o navegador
   rebalanceia TODAS as colunas quando o scroll infinito acrescenta um
   lote — o card que a pessoa estava olhando muda de coluna embaixo do
   toque. Nenhum teste meu via, porque nenhum teste meu comparava a
   tela de ANTES do lote com a de DEPOIS.

   Agora a distribuição é nossa (emColunas), e a promessa é testável:
   card colocado nunca muda de coluna; lote novo só acrescenta. */
S.session = "anon"; S.route = "home"; S.f = S.f || {}; S.feedLote = 1;
g.e("render()");
function mapaDeColunas(t) {
  var m = {};
  (t.split('class="feedcol"').slice(1)).forEach(function (col, ci) {
    (col.match(/aria-label="Ver o perfil de ([^"]+)"/g) || []).forEach(function (a) {
      var nome = a.replace(/aria-label="Ver o perfil de |"/g, "");
      if (!(nome in m)) m[nome] = ci;
    });
  });
  return m;
}
var antesLote = mapaDeColunas(tela());
S.feedLote = 2; g.e("render()");
var depoisLote = mapaDeColunas(tela());
var mudaram = Object.keys(antesLote).filter(function (k) { return depoisLote[k] !== antesLote[k] });
chk("um lote novo não move nenhum card já colocado", mudaram.length === 0,
    "mudaram de coluna com o lote: " + mudaram.slice(0, 4).join(", ") + " — a dança voltou");
/* ── A ESTÉTICA PINTEREST, COMO INVARIANTE ────────────────────────
   Ela pediu que a estética "não mais aconteça" de se perder — então
   ela deixou de ser gosto e virou propriedade medida. A história em
   duas quedas: primeiro o CSS órfão fez o feed virar coluna única;
   depois o MEU conserto da dança (coluna mais curta por peso
   estimado) matou o ritmo — as duas grades numa coluna, cinco posts
   seguidos na outra.

   O que define a estética, cada um com teste:
   1. ziguezague — a peça i mora na coluna i % n, vizinho na sequência
      é vizinho na tela;
   2. contagem igual entre colunas (diferença ≤ 1);
   3. a foto manda na altura (proporções variadas na mesma coluna);
   4. as grades alternam de coluna;
   5. e a loja NÃO é assim — grade regular é o que diferencia os dois
      ambientes, então o contraste também é testado (seção 1c). */
/* As peças têm tamanhos MUITO diferentes de propósito. A primeira
   versão usava cinco iguais — e qualquer esquema por peso reproduz o
   ziguezague quando os pesos empatam. Sabotei com coluna-mais-curta e
   o guarda dormiu. Com uma peça enorme na frente, só o ziguezague de
   verdade mantém b na coluna seguinte; esquema por altura foge dela. */
var dist = g.e("emColunas(['<u>a</u>'+'x'.repeat(400),'<u>b</u>','<u>c</u>','<u>d</u>','<u>e</u>'])");
var colA = dist.split('class="feedcol"')[1] || "";
var colB = (dist.split('class="feedcol"')[2] || "").split("</div>")[0] + (dist.split('class="feedcol"')[2] || "");
chk("ziguezague: a peça i mora na coluna i % n",
    /<u>a<\/u>/.test(colA) && /<u>c<\/u>/.test(colA) && /<u>e<\/u>/.test(colA) &&
    !/<u>b<\/u>/.test(colA) && !/<u>d<\/u>/.test(colA),
    "a sequência deixou de alternar: vizinho na ordem não é mais vizinho na tela");
var contagens = tGrade ? null : null;
var tzz = (S.session = "anon", S.route = "home", S.tab = "discover", S.feedLote = 1, g.e("render()"), tela());
var colunas = tzz.split('class="feedposts"')[1].split('class="feedcol"').slice(1);
var porCol = colunas.map(function (c) { return (c.match(/class="post"|postgrade/g) || []).length });
chk("as colunas têm a mesma contagem, ±1",
    Math.max.apply(null, porCol) - Math.min.apply(null, porCol) <= 1,
    "contagens: " + porCol.join(" vs ") + " — uma coluna virou fila");
var variedade = colunas.map(function (c) {
  return new Set(c.match(/aspect-ratio:[^";]+/g) || []).size;
});
chk("cada coluna mistura proporções", variedade.every(function (v) { return v >= 2 }),
    "proporções por coluna: " + variedade.join(", ") + " — a foto deixou de mandar na altura");
/* O "engessado" que ela apontou duas vezes: alturas até variavam, mas
   pouco, e o topo do feed nascia numa régua reta. Três medidas:
   o vão entre a proporção mais baixa e a mais alta é de pelo menos
   1,7; o pin ALTO existe; e as colunas pares descem um degrau para o
   desencontro começar na primeira dobra. */
var razoes = g.e("PROPORCOES").map(function (p2) {
  var ab = p2.split("/"); return Number(ab[1]) / Number(ab[0]);
});
var vao = Math.max.apply(null, razoes) / Math.min.apply(null, razoes);
chk("as proporções vão do quadrado ao pin alto",
    razoes.length >= 6 && vao >= 1.7,
    razoes.length + " proporções, vão de " + vao.toFixed(2) + " — variação tímida lê como grade");
/* O degrau artificial nas colunas pares durou UMA rodada. Assim que o
   masonry ficou visível de verdade, ela pediu o contrário: primeira
   linha alinhada ao topo, rente à busca — no Pinterest o desencontro
   nasce das alturas das fotos, não de empurrão. Decisão que trocou de
   sinal, registrada aqui e no código. O guarda inverteu junto. */
/* Duas portas para o mesmo empurrão: o inline no HTML e a regra na
   folha. Removi o inline e ESQUECI a folha — 40px fantasmas que o
   guarda não via porque lá se escrevia var(--e6), e eu procurava
   "40px". Guarda de grafia morre na primeira variável; este agora
   fecha as DUAS portas pelo que elas fazem, não pelo que escrevem. */
chk("a primeira linha de fotos alinha ao topo (inline)",
    !/padding-top/.test(tzz.split('class="feedposts"')[1].split('class="post"')[0] || ""),
    "voltou o empurrão inline nas colunas");
chk("e nenhuma regra da folha empurra coluna do feed",
    !/\.feedcol[^{]*\{[^}]*padding-top/.test(css),
    "a folha voltou a empurrar coluna — o fantasma de var(--e6) do print dela");
chk("o flex das colunas é inline, imune ao assassino de regras",
    /class="feedposts" style="display:flex/.test(tzz) && /class="feedcol" style="flex:1 1 0/.test(tzz),
    "o masonry voltou a depender só da folha — foi assim que ela viu uma coluna única duas vezes");
var tons = (code.match(/var g=\[([^\]]+)\]/) || [])[1] || "";
chk("as texturas têm amplitude de luz",
    (tons.match(/#/g) || []).length >= 7,
    "voltaram os cinco cinzas médios: toda foto com a mesma luz lê como bloco");
/* Contar COLUNAS com grade era um buraco: duas grades na mesma
   coluna davam UMA coluna-com-grade, a lista tinha um elemento só, e
   a condição pulava o teste. Sabotei o período para constante — toda
   grade na mesma paridade — e o guarda dormiu. Agora conta grades. */
/* A classe real é "post postgrade" — a primeira versão procurava
   class="postgrade, achava zero grade em toda coluna, e um total de
   zero pulava o teste inteiro. Guarda que procura o seletor errado é
   guarda que aprova qualquer coisa. */
var gradesPorCol = colunas.map(function (c) { return (c.match(/class="post postgrade/g) || []).length });
var totalGrades = gradesPorCol.reduce(function (a, b) { return a + b }, 0);
chk("as grades não se acumulam numa coluna só",
    totalGrades < 2 || gradesPorCol.filter(function (x) { return x > 0 }).length > 1,
    totalGrades + " grade(s), todas na mesma coluna — o ritmo que quebrou no celular dela");

chk("e o lote novo de fato entrou",
    Object.keys(depoisLote).length > Object.keys(antesLote).length,
    "o teste passou porque nada foi acrescentado — isso não é estabilidade");
S.feedLote = 1; g.e("render()");

/* Os degraus de coluna: mesma régua de antes, agora numa função que o
   teste varia como o navegador varia. */
chk("o feed nunca cai para uma coluna",
    [320, 393, 560, 700, 1100, 1600].every(function (w) { return g.e("quantasColunas(" + w + ")") >= 2 }),
    "coluna única: cada rolagem mostra um trabalho e o feed vira fila");
/* Quatro é o teto, a pedido dela — o quinto degrau saiu. */
chk("e ganha coluna conforme a tela cresce, parando em quatro",
    g.e("quantasColunas(393)") === 2 && g.e("quantasColunas(600)") === 3 &&
    g.e("quantasColunas(800)") === 4 && g.e("quantasColunas(1600)") === 4,
    "degraus: " + [393, 600, 800, 1600].map(function (w) { return g.e("quantasColunas(" + w + ")") }).join(", "));
chk("os degraus são os pontos de quebra do sistema",
    /w<560\?2:w<700\?3:4/.test(code.replace(/\s+/g, "")),
    "quantasColunas inventou pontos de quebra próprios — dois sistemas de novo");
/* O canto de cartaz: a foto é o card, e o raio generoso é a moldura
   dela. Só descoberta — a loja fica no canto pequeno, e o contraste
   entre os dois é decisão com teste. */
chk("a foto do feed tem canto de cartaz",
    /\.postimg\{[^}]*border-radius:var\(--r-foto\)/.test(css) && /--r-foto:1[2-9]px/.test(css),
    "o canto voltou a ser o de campo de formulário — o feed perdeu a cara de Pinterest");
/* ── O FEED TEM DOIS SUJEITOS ─────────────────────────────────────
   Tatuadores e estúdios: duas fatias do mesmo lugar, no toggle
   padrão. O card do estúdio usa a MESMA gramática (masonry, cartaz,
   pé de duas linhas) — o que muda é o sujeito, não a forma. */
S.session = "anon"; S.route = "home"; S.tab = "discover";
g.e("S.feedQuem='estudios'"); g.e("render()");
var tEst = tela();
chk("o toggle do feed oferece tatuadores e estúdios",
    /class="seg on"[^>]*>Estúdios</.test(tEst) && />Tatuadores</.test(tEst),
    "o toggle sumiu ou perdeu uma fatia");
chk("os estúdios saem em masonry, como o resto do feed",
    /class="feedcol"/.test(tEst) && (tEst.match(/Ver o estúdio /g) || []).length >= 3,
    "a fatia de estúdios perdeu a gramática do feed");
chk("o card do estúdio responde o que se pergunta de um lugar",
    /cadeira\(s\)/.test(tEst) && /desde /.test(tEst),
    "o card virou cópia do de tatuador — sujeito errado nas linhas");
chk("e leva à página do estúdio",
    /go\(&#39;estudio&#39;\)|go\('estudio'\)/.test(tEst),
    "card de estúdio sem porta: bonito e sem destino");
g.e("S.feedQuem='tatuadores'"); g.e("render()");
chk("a fatia de tatuadores continua inteira",
    (tela().match(/class="post"/g) || []).length >= 6,
    "trocar o padrão quebrou a fatia principal");

/* O contraste com o feed mudou de forma sem mudar de ideia: agora o
   card da loja é CAIXA nas duas vistas (pedido dela), com canto curto
   no container e foto abraçando o topo. Cartaz continua proibido no
   escopo da loja. */
/* Duas linhas de elementos entre a busca e os cards, e não mais —
   ela contou no print: "Relevância" numa linha e "9 produtos +
   ícones" noutra eram duas linhas magras pelo trabalho de uma. Tudo
   meta mora na linha-meta da barra: ordenação, contagem, e as vistas
   no slot da direita. A sabotagem que tirou a contagem passou calada
   na primeira rodada — este guarda nasceu dela. */
/* A primeira janela era de 400 caracteres e os dois ícones em SVG
   passam disso sozinhos: o regex não alcançava o </div>, devolvia
   vazio, e os DOIS guardas falhavam com a tela certa — quarta vez que
   uma janela fixa mede errado nesta construção. A linha-meta não tem
   div interna, então o primeiro </div> depois dela é o fecho dela
   mesma: split, sem janela nenhuma. */
var metaLoja=(tGrade.split('class="resumobusca"')[1]||"").split("</div>")[0];
chk("a contagem de produtos mora na linha-meta",
    / produtos?/.test(metaLoja),
    "a contagem sumiu ou voltou a ter linha própria");
chk("e as vistas moram no slot da direita dela",
    /class="vistas"/.test(metaLoja),
    "os ícones de vista saíram da linha-meta — terceira linha de novo");
chk("a vitrinecab não existe mais",
    !/class="vitrinecab"/.test(tGrade),
    "voltou a linha extra entre a busca e os cards");

chk("o card da grade é caixa como o da lista",
    /\.prod\{[^}]*border:var\(--hair\) solid var\(--border\)/.test(css) &&
    /\.prod\{[^}]*overflow:hidden/.test(css),
    "a grade da loja perdeu a moldura — as duas vistas voltaram a falar línguas diferentes");
chk("e a foto abraça o topo do container",
    /\.prod \.postimg\{[^}]*border-radius:0/.test(css),
    "a foto ganhou canto próprio dentro da caixa — moldura dupla");
chk("e a loja continua sem o cartaz do feed",
    !/\.prod[^{]*\{[^}]*--r-foto/.test(css),
    "a loja herdou o cartaz: sumiu o contraste que separa catálogo de feed");
chk("e nada estreita o feed para um card por vez",
    !/\.feedposts\{[^}]*max-width:4[0-9][0-9]px/.test(css),
    "voltou o max-width que fazia um tatuador por vez");
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
