/* ═══════════════════════════════════════════════════════════════════
   O REPOSICIONAMENTO

   Rode com:  node diagnostico/ecossistema.js

   Confere as três decisões de 27/07/2026: o orçamento sem IA, a
   proposta de valor como ecossistema, e o que sustenta "tudo num lugar
   só" para o tatuador — galeria, caixa e histórico.

   A verificação mais importante é a mais boba: nenhuma menção a IA
   sobrou em tela nenhuma. Promessa retirada que continua escrita em
   algum canto é pior do que promessa nunca feita.
   ═══════════════════════════════════════════════════════════════════ */

var fs=require('fs');
var html=fs.readFileSync(require('path').join(__dirname,'..','prototipo','index.html'),'utf8'), tjs=fs.readFileSync(require('path').join(__dirname,'..','prototipo','teste.js'),'utf8');
var code=html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g,'');
var css=html.slice(0,html.indexOf('</style>'));
var f=0;function chk(n,c,d){console.log((c?'  ok  ':'  XX  ')+n+(d&&!c?' → '+d:''));if(!c)f++}
var nos={};
function no(id){if(!nos[id])nos[id]={id:id,tagName:'INPUT',innerHTML:'',value:'',style:{},addEventListener:function(){},hasAttribute:function(){return false},getAttribute:function(){return null},setAttribute:function(){},removeAttribute:function(){},focus:function(){},setSelectionRange:function(){}};return nos[id]}
var IO=function(){this.observe=function(){};this.disconnect=function(){}};
var g=new Function('document','window','alert','console','location','IntersectionObserver','navigator','localStorage','setInterval','crypto','URLSearchParams',
 'var iniciarSupabase=function(){return Promise.resolve(null)};'+tjs+'\n'+code+';return {e:function(js){return eval(js)},S:S}')
 ({getElementById:no,documentElement:no('h'),body:{},addEventListener:function(){}},{scrollTo:function(){},Dados:{},addEventListener:function(){},innerWidth:393,matchMedia:function(){return{matches:true}}},
  function(){},{log:function(){}},{protocol:'https:',search:'',hash:'',origin:'https://x',pathname:'/'},IO,{geolocation:{},language:'pt'},
  {getItem:function(){return null},setItem:function(){},removeItem:function(){}},function(){},{},URLSearchParams);
var S=g.S, tela=function(){return nos['app'].innerHTML}, gav=function(){return nos['drawerHost'].innerHTML};
S.modo='demo';

console.log('── 1. ORÇAMENTO SEM IA ──');
S.session='client';S.route='home';S.assistArtist=null;S.aiStep=0;S.drawer='assist';g.e("renderDrawer()");
var d=gav();
chk('a gaveta não se chama assistente',!/Assistente de orçamento/.test(d)&&/Pedir orçamento/.test(d));
chk('nenhuma menção a IA na gaveta',!/\bIA\b/.test(d));
chk('não promete estimar preço',!/sugere estilo, complexidade e faixa/.test(d));
chk('pede o estilo à pessoa',/Estilo que você quer/.test(d));
chk('e diz para que serve',/Define para quem o pedido vai/.test(d));
chk('pede referências',/Referências/.test(d));
/* A faixa saiu do passo 1 quando ela pediu simplificação: é detalhe
   de negociação, não descrição da tatuagem — mora no passo 2 com as
   outras decisões. O teste acompanhou a mudança de casa. */
chk('faixa de gasto saiu do passo 1',!/Quanto você pretende gastar/.test(d),
    'a faixa voltou a engordar o primeiro passo');
chk('cobertura continua separada',/cobrir ou corrigir/.test(d));
/* ── O PEDIDO É PADRONIZADO ────────────────────────────────────────
   Cinco campos, os mesmos para todo mundo. O que isso compra não é
   organização: é a comparação. Cinco tatuadores respondendo à mesma
   descrição produzem cinco preços comparáveis; cinco respondendo a
   cinco textos livres produzem cinco conversas.

   Este bloco preenche um campo de cada vez e exige que o botão
   continue travado até o último — e que ele DIGA qual falta, porque
   botão cinza mudo é onde a pessoa desiste. */
/* O aviso que anunciava o padrão em palavras saiu a pedido dela. O
   teste não foi apagado junto — mudou para medir a coisa em vez do
   texto sobre a coisa: os cinco campos continuam marcados como
   obrigatórios, um a um. Guarda que depende de uma frase morre na
   primeira revisão de copy; guarda que conta selos, não. */
/* Cidade deixou de ser obrigatória a pedido dela (20/08): sem ela as
   recomendações só perdem o recorte de proximidade — quem responde
   continua respondendo. O padrão obrigatório são QUATRO: referência,
   estilo, tamanho e parte do corpo. */
var obrigatorios = (d.match(/class="req">obrigatório</g) || []).length;
chk('os quatro campos do padrão continuam obrigatórios', obrigatorios === 4,
    obrigatorios + ' de 4 — o padrão encolheu ou engordou sem decisão');
/* A cidade durou um turno como opcional e SAIU do formulário no
   pedido seguinte dela — a localização já vive no perfil de quem
   pede. As observações voltaram ao passo 1 no lugar. */
chk('a cidade não existe mais no pedido', !/id="aiCidade"/.test(d),
    'a cidade voltou ao formulário que ela mandou enxugar');
chk('as observações moram no passo 1, opcionais',
    /Observações <span[^>]*>— opcional/.test(d) && /id="aiObs"/.test(d),
    'as observações sumiram do passo 1');
chk('tamanho virou campo, não texto livre',/>Tamanho</.test(d));
/* Não basta EXISTIR um "cm" na tela: cada degrau da régua tem de
   trazer o seu. Sabotei trocando um só rótulo por "médio" e este
   teste passava, porque os outros quatro seguravam o regex. */
var regua=g.e("TAMANHOS").filter(function(t){return t[0]!=='fech'});
var semCm=regua.filter(function(t){return !/\d+\s*cm/.test(t[1])});
chk('cada degrau da régua traz o centímetro', semCm.length===0,
    'degrau(s) em adjetivo: '+semCm.map(function(t){return '"'+t[1]+'"'}).join(', ')+
    ' — adjetivo não se compara entre duas pessoas');
chk('e a tela explica por que é em cm',
    /quer dizer coisa diferente/.test(d));
chk('fechamento fica fora da régua',
    g.e("TAMANHOS").filter(function(t){return t[0]==='fech'}).length===1 &&
    !/cm/.test(g.e("rotuloTamanho('fech')")),
    'fechamento entrou na régua: se mede em sessões, não em centímetros');
chk('o tamanho saiu do campo de observações',!/Tamanho aproximado/.test(d),
    'o campo existe e o texto livre continua pedindo a mesma coisa');

S.aiRefs=0;S.aiEstilos=[];S.aiTam='';S.aiParte='';S.aiCidade='';g.e("renderDrawer()");
var passos=[
 ['uma referência', "S.aiRefs=2"],
 ['o estilo',       "tog(S.aiEstilos,'fineline')"],
 ['o tamanho',      "S.aiTam='m'"],
 ['a parte do corpo',"S.aiParte='Antebraço interno'"]
];
g.e("S.aiCidade=''");  // a cidade vazia não pode travar nada
passos.forEach(function(pa,i){
 var atual=gav();
 chk('travado, e diz que falta '+pa[0],
     /disabled/.test(atual)&&atual.indexOf('Falta '+pa[0])>=0,
     'o botão não nomeia a pendência: "'+((atual.match(/Falta [^<]*/)||['—'])[0])+'"');
 g.e(pa[1]);g.e("renderDrawer()");
 var depois=gav();
 var ultimo=i===passos.length-1;
 chk(ultimo?'com os cinco, destrava':'ainda travado depois de '+pa[0],
     ultimo?!/disabled/.test(depois):/disabled/.test(depois),
     ultimo?'destravou faltando campo do padrão':'destravou cedo, com '+(i+1)+' de 5');
});
chk('o resumo devolve o tamanho escolhido',
    (g.e("S.aiStep=1;renderDrawer()"),/5 a 10 cm/.test(gav())),
    'quem responde não vê o tamanho que a pessoa escolheu');
g.e("S.aiStep=0;renderDrawer()");
g.e("S.aiStep=1;renderDrawer()");
var d1=gav();
/* O passo 2 foi refeito de novo por ela: SÓ busca + lista com
   "Solicitar orçamento" por card + o envio geral para o pool. Tipo
   de orçamento e faixa de gasto saíram do fluxo INTEIRO — decisão
   de 20/08, revertendo a do mesmo dia; fica registrado. */
chk('passo 2 recomenda para o pedido',/Recomendados para o seu pedido/.test(d1));
chk('a faixa de gasto saiu do fluxo inteiro',
    !/Quanto você pretende gastar/.test(d1),
    'a faixa voltou — ela mandou retirar os campos da imagem');
chk('o tipo de orçamento também saiu',
    !/Valor fechado/.test(d1),
    'o tipo voltou — ela mandou retirar os campos da imagem');
chk('sem "sugestão da IA"',!/Sugestão da IA/.test(d1));
chk('sem score de máquina',!/score /.test(d1));
/* Tirar/incluir morreu: escolher agora é clicar no card. */
chk('cada card chama para solicitar',/Solicitar orçamento/.test(d1) && /solicitarDe\(/.test(d1),
    'o card perdeu a chamada — escolher voltou a ser poda');
chk('e existe o envio geral para o pool',
    /Enviar orçamento</.test(d1) && /pool aberto/.test(d1) && /vínculos automáticos/.test(d1),
    'o caminho geral sumiu ou perdeu a explicação do pool');
chk('diz que cada um responde com o preço dele',/responde com o preço dele/.test(d1));
/* tirar/incluir morreu com S.aiFora; a escolha agora é o clique no
   card, e o teste da escolha vive no bloco 1b abaixo. */
g.e("S.aiEnviado={nome:'Teste'};S.aiStep=2;renderDrawer()");
chk('confirmação sem promessa de IA',!/\bIA\b/.test(gav())&&/Pedido enviado/.test(gav()));
g.e("S.aiEnviado=null");

/* ── O FLUXO DELA: 2 PASSOS + CONCLUSÃO ───────────────────────────
   Passo 1 SEMPRE igual (fala da tatuagem, e tatuagem não muda com a
   porta de entrada); passo 2 com busca que filtra as recomendações e
   a decisão do tipo de orçamento; conclusão dizendo para quantos foi. */
console.log('── 1b. DOIS PASSOS, BUSCA E TIPO ──');
/* O mesmo passo 1 com e sem artista de origem — bit a bit. */
g.e("S.aiStep=0");
g.e("S.assistArtist='a1'");var p1com=(g.e("renderDrawer()"),gav());
g.e("S.assistArtist=null");var p1sem=(g.e("renderDrawer()"),gav());
chk('o passo 1 é idêntico com e sem artista de origem', p1com===p1sem,
    'a porta de entrada mudou o passo 1 — ela pediu que começasse sempre igual');
/* Vir do perfil pré-preenche a BUSCA do passo 2. */
g.e("S.aiBusca='';quoteFor(ARTISTS[0].id)");
chk('vindo do perfil, o nome chega na busca do passo 2',
    g.e("S.aiBusca")===g.e("ARTISTS[0].name") && g.e("S.aiStep")===0,
    'busca: "'+g.e("S.aiBusca")+'" — o atalho do perfil se perdeu');
S.route='home';S.session='client';g.e("S.drawer='assist'");
/* A busca filtra as recomendações. */
g.e("S.aiBusca='';S.aiStep=1;renderDrawer()");
var semBusca=(gav().match(/class="lrow"/g)||[]).length;
g.e("S.aiBusca=ARTISTS[0].name;renderDrawer()");
var comBusca=gav();
chk('sem busca, as recomendações são automáticas e várias', semBusca>1, semBusca+' recomendação(ões)');
chk('a busca filtra a lista', (comBusca.match(/class="lrow"/g)||[]).length===1 && comBusca.indexOf(g.e("ARTISTS[0].name"))>=0,
    'digitei um nome e a lista não obedeceu');
g.e("S.aiBusca='zzz-ninguem';renderDrawer()");
chk('busca sem dono explica e ensina a sair', /Apague a busca/.test(gav()),
    'lista vazia muda sem dizer por quê');
g.e("S.aiBusca='';renderDrawer()");
/* O tipo de orçamento viveu UM turno e saiu com os campos da imagem
   dela — registrado. A escolha agora é o clique: solicitar de alguém
   nomeia a pessoa na conclusão; enviar geral cai no pool. */
g.e("solicitarDe(ARTISTS[0].id)");
chk('solicitar de alguém nomeia a pessoa na conclusão',
    new RegExp('Pedido enviado para '+g.e("ARTISTS[0].name")).test(gav()),
    'cliquei no card e a conclusão não disse para quem foi');
g.e("S.aiStep=1;renderDrawer();enviarGeral()");
chk('o envio geral cai no pool, com a explicação',
    /pool aberto/.test(gav()) && /vínculos automáticos/.test(gav()) && /Meus orçamentos/.test(gav()),
    'o pool virou caixa muda: enviou e não disse o que acontece');
g.e("S.aiStep=0;S.aiBusca='';S.assistArtist=null;S.aiEnviado=null");

/* ── PELA PORTA QUE O DEDO CLICA ───────────────────────────────────
   A raiz do "continua sem refletir": eu testava o fluxo entrando por
   S.drawer='assist' direto — a porta lateral — enquanto o botão ✨ da
   tela abria um MENU antigo que nenhum teste via. Este guarda entra
   pela porta REAL: extrai o onclick do botão renderizado, executa
   exatamente o que o dedo executaria, e exige que o que abre seja o
   passo 1 do pedido — não um menu, não um hub, não um passo zero. */
S.session='client';S.route='home';S.tab='discover';S.drawer=null;g.e("render()");
/* O emoji ✨ vira SVG no render (icons()) — procurar "✨ Orçamentos"
   acha nada, a MESMA pegadinha do extrator de rótulos de outra
   rodada. Acha-se o fecho "Orçamentos</button>" e recua até a
   abertura do botão. */
function botaoQueDiz(t,rotulo){
 var fim=t.indexOf(rotulo+"</button>");
 if(fim<0)return "";
 var ini=t.lastIndexOf("<button",fim);
 return t.slice(ini,fim);
}
var btnOrc=botaoQueDiz(tela()," Orçamentos");
var acao=(btnOrc.match(/onclick="([^"]+)"/)||[])[1];
chk('o botão ✨ Orçamentos existe', !!acao);
if(acao){try{g.e(acao.replace(/&#39;/g,"'"))}catch(e){}}
var abriu=gav();
chk('e abre DIRETO o passo 1 do pedido',
    /Referências \(/.test(abriu) && /Estilo que você quer/.test(abriu),
    'a porta real não leva ao fluxo: abriu outra coisa antes do passo 1');
chk('sem menu no caminho',
    !/Escolha como quer seguir/.test(abriu),
    'o passo zero disfarçado voltou — o menu antes do pedido');
/* A segunda porta: "Novo orçamento" dentro de Meus orçamentos. */
S.drawer=null;S.route='me';S.sub={mev:'quotes'};g.e("render()");
var btn2=botaoQueDiz(tela()," Novo orçamento");
var acao2=(btn2.match(/onclick="([^"]+)"/)||[])[1];
chk('a porta de Meus orçamentos também leva ao passo 1',
    (acao2?(g.e(acao2.replace(/&#39;/g,"'")),/Estilo que você quer/.test(gav())):false),
    'a segunda porta ficou para trás — duas portas, dois fluxos');
/* E as duas ideias do menu morto continuam vivas, agora como tela. */
S.drawer=null;g.e("render()");
var tmq=tela();
chk('o pool aberto virou conteúdo de Meus orçamentos',
    /Pool aberto/.test(tmq) && /Tatuadores prospectam aqui/.test(tmq));
chk('as recomendações também',
    /Para você/.test(tmq) && /estilos que você salvou e segue/.test(tmq));
S.sub={};S.route='home';

console.log('── 2. ECOSSISTEMA EM CONHECER ──');
/* ── A GRAMÁTICA DO PORTFÓLIO DELA ────────────────────────────────
   Conhecer alinhou à esquerda e os cards passaram a correr na
   horizontal, com contador 01/04 — a estrutura de cases.html. Três
   coisas que não podem se soltar:
   1. os trilhos existem e cada um tem o seu contador, com o total
      certo — contador que promete 04 sobre um trilho de 3 é o tipo de
      mentira pequena que mina confiança;
   2. o card corre, não empilha (overflow-x + snap);
   3. e nada voltou a se centralizar — o centrado morreu com decisão. */
S.drawer=null;S.route='plataforma';S.perfilLanding='cliente';g.e("render()");
var tpl=tela();
var trilhos=(tpl.match(/data-trilho="([a-z]+)"/g)||[]).map(function(x){return x.slice(13,-1)});
chk('os trilhos existem',trilhos.length>=4,'só '+trilhos.length+' trilho(s): a página voltou a empilhar');
trilhos.forEach(function(id){
  var corpo=(tpl.split('data-trilho="'+id+'"')[1]||"").split('</div></div>')[0];
  var cards=(tpl.split('data-trilho="'+id+'"')[1]||"").split("<\/div>");
  var nCards=((tpl.split('data-trilho="'+id+'"')[1]||"").split('class="tcab"')[0].match(/class="card pad vantagem"/g)||[]).length;
  var conta=(tpl.match(new RegExp('id="conta-'+id+'"><b>01<\\/b> \\/ (\\d+)'))||[])[1];
  chk('o contador de '+id+' fecha com os cards',Number(conta)===nCards,
      'contador diz '+conta+', o trilho tem '+nCards);
});
chk('o trilho corre na horizontal',/\.trilho\{[^}]*overflow-x:auto/.test(css)&&/scroll-snap-type:x/.test(css),
    'os cards voltaram a empilhar — a estrutura do portfólio se perdeu');
chk('e sangra até a borda',/\.trilho\{[^}]*margin:0 calc\(-1 \* var\(--gutter\)\)/.test(css),
    'sem o sangramento, o card cortado que convida a rolar some');
chk('a página alinha à esquerda',!/blococentro/.test(tpl)&&/class="tsec"/.test(tpl));
chk('o contador atualiza no scroll',/onscroll="contarTrilho\(this\)"/.test(tpl),
    'contador congelado em 01: interação prometida e não ligada');
/* O print dela: primeiro card cortado na borda e cards de 600px.
   Duas causas, dois guardas.
   1. snap alinha ao scrollport, que IGNORA o padding do trilho — sem
      scroll-padding o primeiro card é puxado para debaixo da borda;
   2. flex-basis com min() dentro falha em motores velhos e o card cai
      em largura automática. Largura vive em width, e pequena. */
chk('o snap respeita a margem da página',
    /\.trilho\{[^}]*scroll-padding:0 var\(--gutter\)/.test(css),
    'sem scroll-padding o snap corta o primeiro card na borda — o print dela');
var wCard=(css.match(/\.trilho>\.card\{flex:0 0 auto;width:min\((\d+)px/)||[])[1];
chk('o card do trilho é pequeno e mede por width',
    Number(wCard)>0 && Number(wCard)<=260,
    'card de '+(wCard||'?')+'px — ou voltou o flex-basis com min(), que vira 600px em motor velho');
/* Redundância: o título do perfil aparece UMA vez. O CTA repetia. */
var vezesTitulo=(tpl.match(/O lugar de quem gosta de tatuagem/g)||[]).length;
chk('o título do perfil aparece uma vez só',vezesTitulo===1,
    vezesTitulo+' vezes — voltou o cartão que repete o que a tela já disse');
S.drawer=null;S.route='plataforma';S.perfilLanding='cliente';g.e("render()");
var t=tela();
chk('abre falando do lugar, não do perfil',/Onde a tatuagem acontece/.test(t));
chk('os quatro lados aparecem',/>Pessoas</.test(t)&&/>Artistas</.test(t)&&/>Estúdios</.test(t)&&/>Arte</.test(t));
chk('menciona estúdio de passagem',/de passagem/.test(t));
chk('e que arte não é só tatuagem',/único destino do traço/.test(t));
chk('depois pergunta o que significa para você',/o que isso significa/.test(t));
chk('cliente: proposta reescrita',/O lugar de quem gosta de tatuagem/.test(t));
chk('cliente: preço vem de quem faz',/Preço de quem vai fazer/.test(t));
chk('cliente: confiança vem antes do preço',
    t.indexOf('Saber com quem você vai tatuar')>=0 &&
    t.indexOf('Saber com quem você vai tatuar')<t.indexOf('Preço de quem vai fazer'),
    'a proposta abre falando de preço, não de confiança');
chk('cliente: o passaporte é privado na promessa',/Privado por padrão/.test(t));
chk('sem IA em lugar nenhum',!/\bIA\b/.test(t));
S.perfilLanding='fornecedor';g.e("render()");
var tfo=tela();
/* A ordem das vantagens é o argumento da marca: recomendação sustenta
   embaixador, que sustenta a venda. Vender primeiro seria propaganda. */
chk('fornecedor: a cadeia começa na recomendação',
    tfo.indexOf('Recomendação de quem usa')>=0 &&
    tfo.indexOf('Recomendação de quem usa')<tfo.indexOf('Embaixadores, não anúncios'),
    'a proposta abre por alcance, não por confiança');
chk('fornecedor: a venda é no pós-sessão',/Venda no pós-sessão/.test(tfo));
S.perfilLanding='tatuador';g.e("render()");
var tt=tela();
chk('tatuador: tudo num lugar só',/Sua vida profissional num lugar só/.test(tt));
chk('tatuador: fala de caixa',/caixa/i.test(tt));
chk('tatuador: fala de histórico',/histórico/i.test(tt));
chk('tatuador: fala dos estúdios por onde passou',/estúdios por onde passou/.test(tt));

console.log('── 3. GALERIA NO PERFIL ──');
S.route='artist';S.artist='a0';S.abaPerfil='portfolio';g.e("render()");
var comG=g.e("ARTISTS").filter(function(a){return a.galeria}).length;
console.log('  '+comG+' de '+g.e("ARTISTS").length+' artistas vendem arte');
chk('nem todos têm galeria',comG>0&&comG<g.e("ARTISTS").length);
chk('a aba aparece para quem tem',/>Galeria</.test(tela()));
S.abaPerfil='galeria';g.e("render()");
var tg2=tela();
chk('mostra obras',/class="obra"/.test(tg2));
chk('com preço',/R\$/.test(tg2));
chk('distingue peça única de tiragem',/peça única|disponíveis/.test(tg2));
chk('explica que não passa pelo orçamento',/não passa pelo orçamento/.test(tg2));
chk('css da galeria existe',/\.gradeobras\{/.test(css)&&/\.obra\{/.test(css));
var semG=g.e("ARTISTS").filter(function(a){return !a.galeria})[0];
S.artist=semG.id;S.abaPerfil='portfolio';g.e("render()");
chk('quem não vende arte não tem a aba',!/>Galeria</.test(tela()));

console.log('── 4. CAIXA ──');
/* Dinheiro já foi aba, virou seção da Visão geral, e voltou a ser aba
   — agora "Financeiro", com Dinheiro e Lançamentos dentro. O que este
   bloco protege não é o endereço: é o conteúdo continuar inteiro em
   cada mudança de casa. */
S.session='artist';S.route='studio-financeiro';S.sub={fin:'dinheiro'};g.e("render()");
var tc=tela();
chk('a peça de dinheiro existe no toggle',/class="seg on"[\s\S]{0,140}?>Dinheiro</.test(tc));
chk('mostra entrou, saiu, sobrou',/Entrou em julho/.test(tc)&&/Saiu/.test(tc)&&/Sobrou/.test(tc));
chk('separa de onde veio',/De onde veio/.test(tc)&&/Sessões/.test(tc)&&/Arte/.test(tc));
/* A prévia de quatro linhas saiu: com as seções empilhadas, a tabela
   completa fica logo abaixo do resumo, na mesma página. */
/* Com o toggle são duas vistas: o resumo faz ponte, a tabela lança. */
chk('o resumo faz ponte para a tabela',/De onde veio/.test(tc)&&/Últimos lançamentos/.test(tc));
S.route='studio-financeiro';S.sub={fin:'lancamentos'};g.e("render()");var tcl=tela();
chk('a sub-aba lista todos',/<table class="t"/.test(tcl));
chk('permite lançar à mão',/Lançar entrada/.test(tcl)&&/Lançar saída/.test(tcl));
chk('diz que é privado',/ninguém mais vê/.test(tcl));
S.sub={};
var c=g.e("somaCaixa()");
chk('a conta fecha',c.sobrou===c.entrou-c.saiu,c.entrou+' - '+c.saiu+' ≠ '+c.sobrou);
chk('tem entrada de sessão, arte e curso',c.porCat.sessao>0&&c.porCat.arte>0&&c.porCat.curso>0);

console.log('── 5. HISTÓRICO ──');
/* 'Onde eu tatuei' virou sub-aba de Reputação; 'quem eu tatuei' foi
   para a Agenda a pedido dela — quem já sentou na cadeira e quem vai
   sentar são a mesma matéria, lida em duas direções. */
S.route='studio-schedule';S.sub={ag:'pessoas'};g.e("render()");
var th=tela();
chk('lista quem ele tatuou',/Pessoas que você tatuou/.test(th));
chk('com quantas sessões e desde quando',/cliente desde/.test(th));
chk('e quanto cada um gastou',/no total/.test(th));
chk('diz para que serve',/chamar de volta quem sumiu/.test(th));
S.route='studio-reputacao';S.sub={rep:'estudios'};g.e("render()");
var te=tela();
chk('lista onde ele tatuou',/Onde você já tatuou/.test(te));
chk('distingue casa de guest spot',/Guest spot/.test(te)&&/Casa/.test(te));
chk('inclui convenção',/Convenção/.test(te));
chk('explica por que isso importa',/cada estúdio tem o próprio caderno/i.test(te));
chk('permite registrar passagem',/Registrar passagem/.test(te));

console.log('── 6. A VISÃO GERAL APONTA PARA AS DUAS ──');
S.route='studio';S.sub={};g.e("render()");
var tv=tela();
/* O cartão "Sobrou" saiu do painel: a seção Dinheiro está na mesma
   página. O que o painel promete agora é levar para FORA dela. */
/* Dinheiro saiu desta página: virou a aba Financeiro. O painel
   continua responsável por levar até lá, e a checagem passou a exigir
   isso — cartão que aponta para uma aba que não existe mais é o
   defeito silencioso de toda mudança de arquitetura. */
chk('a visão geral não tem mais toggle',!/class="seg /.test(tv),
    'a Visão geral voltou a ter seções');
var destinos=(tv.match(/irSecao\(&#39;([a-z-]+)&#39;|irSecao\('([a-z-]+)'/g)||[])
  .concat(tv.match(/go\(&#39;([a-z-]+)&#39;|go\('([a-z-]+)'/g)||[])
  .map(function(x){return x.replace(/.*\(&?#?3?9?;?'?/,'').replace(/&#39;|'/g,'')});
var rotasValidas=g.e("ST_NAV.map(function(x){return x[0]})")
  .concat(Object.keys(g.e("ST_ROTA_ANTIGA")))
  .concat(["studio-profile","estudio-reivindicar","studio-checkin"]);
var orfaos=destinos.filter(function(r){return r.indexOf("studio")===0&&rotasValidas.indexOf(r)<0});
chk('nenhum cartão do painel aponta para aba que não existe',orfaos.length===0,
    'apontam para o vazio: '+orfaos.join(', '));
chk('o painel leva a quem ele tatuou',/Pessoas tatuadas/.test(tv)&&/ag&#39;,&#39;pessoas|ag','pessoas/.test(tv));
chk('e à galeria',/Obras à venda/.test(tv));
chk('sem "Receita do mês" solta',!/Receita do mês/.test(tv));

console.log('── 7. O PERFIL E O ESTÚDIO NA INTERFACE #2 ──');
/* Os dois cabeçalhos são a mesma pergunta — quem é este, o essencial,
   e o que fazer daqui. Se um for caixa e o outro não, a pessoa
   reaprende a ler no meio do caminho. */
S.session='anon';S.route='artist';S.sub={};g.e("render()");
var tpf=tela();
/* ── NENHUM BOTÃO SEM RÓTULO ──────────────────────────────────────
   O cabeçalho tinha quatro caixas grandes com só um ícone dentro: um
   ✨ preto, um calendário, um balão e um tique. Nenhuma palavra.

   Ícone sozinho só funciona com vocabulário universal — fechar,
   buscar, voltar. "Pedir orçamento" não tem ícone universal, e era
   justamente a ação que sustenta o negócio.

   title= e aria-label= resolvem para leitor de tela e não resolvem
   para quem enxerga: no toque não existe hover, e o title nunca
   aparece. */
/* Duas correções que a sabotagem obrigou:

   1. Janela larga — o ícone vira SVG no render e um botão de ícone só
      passa de 400 caracteres; com 80 esses botões nem eram encontrados.
   2. Só o MIOLO — a captura trazia os atributos junto, e depois de
      tirar as tags sobrava o texto do onclick. Todo botão "tinha
      letras" por causa do próprio código, e nenhum era acusado. */
var acoesPerfil = tpf.split('<button').slice(1)
  .filter(function (b) { return /^[^>]*class="btn/.test(b) })
  .map(function (b) {
    var miolo = b.slice(b.indexOf(">") + 1).split("</button>")[0];
    return miolo.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  });
var mudas = acoesPerfil.filter(function (t) { return !/[a-zA-ZÀ-ÿ]{3}/.test(t) });
chk('nenhuma ação do perfil é só ícone', mudas.length === 0,
    mudas.length + ' botão(ões) sem palavra nenhuma');
/* "Ver agenda" saiu: a agenda do tatuador não é pública. O cliente
   pede, ele decide. */
['Pedir orçamento', 'Conversar', 'Seguir'].forEach(function (r) {
  chk('a ação "' + r + '" diz o que faz', tpf.indexOf(r) >= 0);
});
/* ── TRÊS ACESSOS, MESMO PESO ──────────────────────────────────────
   Orçar era uma barra preta de largura inteira com o preço dentro. A
   pedido dela virou um acesso como conversar.

   A hierarquia não desapareceu — mudou de lugar. Ela não está mais no
   tamanho do botão, e sim no que cada um abre: conversar abre uma
   conversa em branco, seguir é um clique, e orçar abre um formulário
   de cinco campos fixos, igual para todo mundo. */
chk('as três ações dividem a mesma linha',
    (tpf.match(/class="acoessec"/g) || []).length === 1);
chk('e nenhuma delas é uma barra à parte',
    !/acaoprin/.test(tpf),
    'a ação de orçar voltou a ter forma própria');
chk('o acesso de orçar abre o pedido padronizado',
    /quoteFor\(/.test(tpf) || /explicarTrava/.test(tpf));

/* Os selos eram seis pastilhas em duas linhas — mais peso visual que o
   nome de quem elas descrevem. */
chk('no máximo três selos no cabeçalho',
    (tpf.split('class="acoessec"')[0].match(/class="selinho/g) || []).length <= 3,
    (tpf.split('class="acoessec"')[0].match(/class="selinho/g) || []).length + ' selos antes das ações');
/* Comparar contra ARTISTS[0] era errado: a tela renderiza S.artist,
   que pode ser outro. A conta se fecha sozinha — os que aparecem mais
   os que o contador promete têm de dar o total de quem está na tela. */
var cab=tpf.split('class="acoessec"')[0];
var mostrados=(cab.match(/class="selinho/g)||[]).length;
var promete=Number((cab.match(/class="maisselos"[^>]*>\+(\d+)/)||[])[1]||0);
var totalDele=g.e("selosDe(ARTISTS.filter(function(x){return x.id===S.artist})[0]||ARTISTS[0]).length");
chk('o contador fecha com o total de selos dele',
    mostrados+promete===totalDele,
    mostrados+' mostrados + '+promete+' prometidos ≠ '+totalDele+' que ele tem');

/* A bio deixou de ser <details>: parágrafo de duas linhas atrás de um
   clique é parágrafo que ninguém lê. */
chk('a bio fica visível, sem clique', /class="perfilbio"/.test(tpf) && !/<details/.test(tpf));

chk('o perfil abre sem moldura de cartão',/class="perfilcab"/.test(tpf)&&!/class="card pad" style="margin-top:12px"/.test(tpf),
    'o cabeçalho voltou para dentro de um cartão');
chk('o nome é título, não negrito de texto',/class="perfilnome"/.test(tpf));
chk('e sai na condensada',/\.perfilnome\{font-family:var\(--f-cond\)/.test(css));
/* Medido no texto sem as marcas: entre a abertura da linha e "por
   hora" passam cinco estrelas em SVG, e contar bytes de desenho para
   achar palavra é frágil por construção. */
var linhaNum=(tpf.split('class="perfilnum">')[1]||'').split('</div>')[0].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
/* O preço voltou para esta linha quando o botão deixou de ser barra.
   Ele não pode simplesmente sumir: é a segunda coisa que a pessoa
   procura, depois de "esta mão me serve?". */
chk('nota, anos de ofício e preço na mesma linha',
    /\d\.\d/.test(linhaNum) && /anos/.test(linhaNum) && /por hora/.test(linhaNum),
    'linha: "'+linhaNum.trim()+'"');
chk('e os cifrões vêm explicados',
    /faixa que ele costuma praticar/.test(tpf),
    'cifrão sem legenda é a pessoa adivinhando quanto custa');
chk('número tabular nas medidas',/\.perfilnum\{[^}]*tabular-nums/.test(css));

S.route='estudio';S.estudioSel=(g.e("ESTUDIOS[0].id"));g.e("render()");
var tes=tela();
chk('o estúdio usa o mesmo cabeçalho',/class="perfilcab"/.test(tes)&&/class="perfilnome"/.test(tes),
    'as duas páginas voltaram a ter formas diferentes para a mesma coisa');

/* Portfólio: a obra define a própria altura, igual ao feed. Grade de
   quadrados obriga a recortar, e recortar tatuagem é editar trabalho
   dos outros. */
chk('o portfólio corre em colunas, não em grade',/\.gradeport\{display:block;column-count:3/.test(css));
chk('e cada trabalho traz a própria proporção',/aspect-ratio:'\+proporcaoDaFoto\(p\)/.test(code),
    'voltou aspect-ratio:1 — o quadrado recorta');
chk('a mesma função de proporção do feed',/function proporcaoDaFoto/.test(code));

/* O trilho de vidro saiu do controle segmentado. Desfoque de fundo
   custa GPU e travava a rolagem em telefone antigo — e ali não pagava
   nada em troca, porque atrás da aba não passa foto nenhuma.

   Sobre a foto ele continua, e ali se paga: o desfoque é o que garante
   que o coração e os selos sejam legíveis contra uma tatuagem preta e
   contra uma tatuagem clara com o mesmo código. */
/* ── DOIS CONTROLES, DOIS TRABALHOS ───────────────────────────────
   A distinção não é estética, é semântica:

     aba     → outro destino. Você sai daqui e vai para lá.
     toggle  → o mesmo lugar, outro recorte. Você continua aqui.

   Quando os dois viraram sublinhado, a diferença sumiu da tela e um
   controle que só recorta passou a parecer que levava embora. Este
   roteiro impede que eles voltem a se confundir — nos dois sentidos. */
chk('o toggle é pílula, não sublinhado',
    /\.seg\{[^}]*border-radius:var\(--r-pill\)/.test(css) &&
    /\.seg\.on\{[^}]*background:var\(--background\)/.test(css),
    'o segmentado virou aba e deixou de dizer que você continua na mesma tela');
chk('e a aba é sublinhado, não pílula',
    /\.subnav a\{[^}]*border-bottom:var\(--hair\)/.test(css) &&
    !/\.subnav a\{[^}]*border-radius:var\(--r-pill\)/.test(css),
    'a navegação virou toggle e deixou de dizer que leva a outro lugar');
chk('os dois controles de navegação continuam iguais entre si',
    (function () {
      var a = (css.match(/\.subnav a\{[^}]*border-bottom:([^;}]*)/) || [])[1];
      var b = (css.match(/\.aba\{[^}]*border-bottom:([^;}]*)/) || [])[1];
      return a && b && a.trim() === b.trim();
    })(),
    '.subnav e .aba respondem à mesma pergunta e precisam da mesma forma');
/* O trilho tem de se ler como trilho: sem fundo, a peça ativa flutua
   sozinha e o conjunto volta a parecer aba. */
chk('o trilho do toggle tem fundo próprio',
    /\.segmento\{[^}]*background:var\(--muted\)/.test(css));

chk('sem desfoque no controle segmentado',
    !/\.segmento\{[^}]*backdrop-filter/.test(css),
    'voltou o vidro nas abas — caro em GPU e sem nada atrás para desfocar');
/* Contar ocorrências era frágil: bastou nascer um selo novo sobre a
   grade para o teste falhar sem nada ter piorado. O que importa não é
   quantos são — é se cada um está sobre imagem, onde o desfoque paga o
   que custa. */
var comDesfoque = (css.match(/[^{}]+\{[^}]*backdrop-filter[^}]*\}/g) || [])
  .map(function (b) { return b.split('{')[0].replace(/\s+/g, ' ').trim() });
var SOBRE_FOTO = /\.postimg|\.postacoes|\.coracao|\.selosic|\.tagtl|\.nav|\.getiq|\.obrafoto|\.pcard/;
chk('todo desfoque que sobrou está sobre imagem',
    comDesfoque.length > 0 && comDesfoque.every(function (sel) { return SOBRE_FOTO.test(sel) }),
    comDesfoque.filter(function (sel) { return !SOBRE_FOTO.test(sel) }).join('  |  '));
chk('o bloco do estúdio no perfil é traço, não caixa dentro de caixa',
    /\.cxestudio\{[^}]*border-top:var\(--hair\)/.test(css));

console.log('── 7. NADA QUEBROU ──');
['home','artist','plataforma','cadastro','modelo','conexao','me','studio','studio-caixa','studio-reputacao','studio-profile','studio-quotes'].forEach(function(r){
 S.session=r.indexOf('studio')===0?'artist':r.indexOf('me')===0?'client':'anon';S.route=r;
 try{g.e("render()");chk(r,tela().length>400)}catch(e){chk(r,false,e.message)}
});
console.log('══ '+f+' falha(s) ══');
process.exit(f?1:0);
