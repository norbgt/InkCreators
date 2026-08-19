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
chk('e diz para que serve',/define para quem o pedido vai/.test(d));
chk('pede referências',/Referências/.test(d));
chk('faixa de gasto é opcional',/Quanto você pretende gastar/.test(d)&&/opcional/.test(d));
chk('cobertura continua separada',/cobrir ou corrigir/.test(d));
chk('travado sem estilo e cidade',/disabled/.test(d));
g.e("tog(S.aiEstilos,'fineline')");S.aiCidade='São Paulo';g.e("renderDrawer()");
chk('destrava com estilo e cidade',!/disabled/.test(gav()));
g.e("S.aiStep=1;renderDrawer()");
var d1=gav();
chk('passo 2 mostra para quem vai',/Vai para/.test(d1));
chk('sem "sugestão da IA"',!/Sugestão da IA/.test(d1));
chk('sem score de máquina',!/score /.test(d1));
chk('dá para tirar alguém da lista',/tog\(S\.aiFora/.test(d1));
chk('diz que cada um responde com o preço dele',/responde com o preço dele/.test(d1));
var antes=(d1.match(/class="lrow"/g)||[]).length;
g.e("tog(S.aiFora,'a0');renderDrawer()");
chk('tirar alguém muda a contagem do botão',/Enviar para/.test(gav()));
g.e("S.aiFora=[];S.aiStep=2;renderDrawer()");
chk('confirmação sem promessa de IA',!/\bIA\b/.test(gav())&&/Pedido enviado/.test(gav()));

console.log('── 2. ECOSSISTEMA EM CONHECER ──');
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
S.session='artist';S.route='studio-caixa';g.e("render()");
var tc=tela();
/* Dinheiro deixou de ser aba e virou seção da visão geral. O que
   importa não é o endereço, é a seção estar na página. */
chk('a seção de dinheiro existe',/class="secgt">Dinheiro</.test(tc));
chk('mostra entrou, saiu, sobrou',/Entrou em julho/.test(tc)&&/Saiu/.test(tc)&&/Sobrou/.test(tc));
chk('separa de onde veio',/De onde veio/.test(tc)&&/Sessões/.test(tc)&&/Arte/.test(tc));
/* A prévia de quatro linhas saiu: com as seções empilhadas, a tabela
   completa fica logo abaixo do resumo, na mesma página. */
chk('a lista completa está na mesma página do resumo',/Lançar entrada/.test(tc)&&/De onde veio/.test(tc));
S.sub={cx:'lancamentos'};g.e("render()");var tcl=tela();
chk('a sub-aba lista todos',/<table class="t"/.test(tcl));
chk('permite lançar à mão',/Lançar entrada/.test(tcl)&&/Lançar saída/.test(tcl));
chk('diz que é privado',/ninguém mais vê/.test(tcl));
S.sub={};
var c=g.e("somaCaixa()");
chk('a conta fecha',c.sobrou===c.entrou-c.saiu,c.entrou+' - '+c.saiu+' ≠ '+c.sobrou);
chk('tem entrada de sessão, arte e curso',c.porCat.sessao>0&&c.porCat.arte>0&&c.porCat.curso>0);

console.log('── 5. HISTÓRICO ──');
/* 'Onde eu tatuei' virou sub-aba de Reputação; 'quem eu tatuei' virou
   sub-aba de Dinheiro. Uma tela virou duas. */
S.route='studio-caixa';S.sub={cx:'pessoas'};g.e("render()");
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
chk('a seção de dinheiro está na própria visão geral',/class="secgt">Dinheiro</.test(tv)&&/Sobrou/.test(tv));
chk('o painel leva a quem ele tatuou',/Pessoas tatuadas/.test(tv)&&/vg&#39;,&#39;pessoas|vg','pessoas/.test(tv));
chk('e à galeria',/Obras à venda/.test(tv));
chk('sem "Receita do mês" solta',!/Receita do mês/.test(tv));

console.log('── 7. O PERFIL E O ESTÚDIO NA INTERFACE #2 ──');
/* Os dois cabeçalhos são a mesma pergunta — quem é este, o essencial,
   e o que fazer daqui. Se um for caixa e o outro não, a pessoa
   reaprende a ler no meio do caminho. */
S.session='anon';S.route='artist';S.sub={};g.e("render()");
var tpf=tela();
chk('o perfil abre sem moldura de cartão',/class="perfilcab"/.test(tpf)&&!/class="card pad" style="margin-top:12px"/.test(tpf),
    'o cabeçalho voltou para dentro de um cartão');
chk('o nome é título, não negrito de texto',/class="perfilnome"/.test(tpf));
chk('e sai na condensada',/\.perfilnome\{font-family:var\(--f-cond\)/.test(css));
/* Medido no texto sem as marcas: entre a abertura da linha e "por
   hora" passam cinco estrelas em SVG, e contar bytes de desenho para
   achar palavra é frágil por construção. */
var linhaNum=(tpf.split('class="perfilnum">')[1]||'').split('</div>')[0].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
chk('nota, anos e preço na mesma linha',
    /\d\.\d/.test(linhaNum) && /anos/.test(linhaNum) && /por hora/.test(linhaNum),
    'linha: "'+linhaNum.trim()+'"');
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
/* Testa a intenção, não a declaração. A primeira versão exigia a cor
   exata do traço e falhou no dia em que a cor mudou — ficando no
   caminho de uma correção em vez de proteger alguma coisa. O que
   importa é que exista sublinhado e que os três controles concordem. */
chk('as abas são sublinhado, não pílula de vidro',
    /\.seg\.on\{[^}]*border-bottom-color/.test(css) && !/\.seg\{[^}]*border-radius:999px/.test(css));
/* Três controles de aba no produto: .subnav, .seg e .aba. Três
   espessuras diferentes inventam hierarquia entre perguntas iguais. */
var espessuras = ['\\.subnav a\\{', '\\.seg\\{', '\\.aba\\{'].map(function (sel) {
  var m = css.match(new RegExp(sel + '[^}]*border-bottom:([^;}]*)'));
  return m ? m[1].trim() : 'ausente';
});
chk('os três controles de aba usam o mesmo traço',
    espessuras.every(function (x) { return x === espessuras[0] && /var\(--hair\)/.test(x) }),
    espessuras.join('  |  '));
chk('sem desfoque no controle segmentado',
    !/\.segmento\{[^}]*backdrop-filter/.test(css),
    'voltou o vidro nas abas — caro em GPU e sem nada atrás para desfocar');
/* Contar ocorrências era frágil: bastou nascer um selo novo sobre a
   grade para o teste falhar sem nada ter piorado. O que importa não é
   quantos são — é se cada um está sobre imagem, onde o desfoque paga o
   que custa. */
var comDesfoque = (css.match(/[^{}]+\{[^}]*backdrop-filter[^}]*\}/g) || [])
  .map(function (b) { return b.split('{')[0].replace(/\s+/g, ' ').trim() });
var SOBRE_FOTO = /\.postimg|\.postacoes|\.coracao|\.selosic|\.tagtl|\.nav|\.gmais|\.obrafoto|\.pcard/;
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
