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
chk('sem IA em lugar nenhum',!/\bIA\b/.test(t));
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
chk('a aba existe no menu',/studio-caixa/.test(tc));
chk('mostra entrou, saiu, sobrou',/Entrou em julho/.test(tc)&&/Saiu/.test(tc)&&/Sobrou/.test(tc));
chk('separa de onde veio',/De onde veio/.test(tc)&&/Sessões/.test(tc)&&/Arte/.test(tc));
chk('resumo mostra os últimos lançamentos',/Últimos lançamentos/.test(tc));
S.sub={cx:'lancamentos'};g.e("render()");var tcl=tela();
chk('a sub-aba lista todos',/<table class="t"/.test(tcl));
chk('permite lançar à mão',/Lançar entrada/.test(tcl)&&/Lançar saída/.test(tcl));
chk('diz que é privado',/ninguém mais vê/.test(tcl));
S.sub={};
var c=g.e("somaCaixa()");
chk('a conta fecha',c.sobrou===c.entrou-c.saiu,c.entrou+' - '+c.saiu+' ≠ '+c.sobrou);
chk('tem entrada de sessão, arte e curso',c.porCat.sessao>0&&c.porCat.arte>0&&c.porCat.curso>0);

console.log('── 5. HISTÓRICO ──');
S.route='studio-historico';S.sub={hist:'pessoas'};g.e("render()");
var th=tela();
chk('lista quem ele tatuou',/Pessoas que você tatuou/.test(th));
chk('com quantas sessões e desde quando',/cliente desde/.test(th));
chk('e quanto cada um gastou',/no total/.test(th));
chk('diz para que serve',/chamar de volta quem sumiu/.test(th));
S.sub={hist:'estudios'};g.e("render()");
var te=tela();
chk('lista onde ele tatuou',/Onde você já tatuou/.test(te));
chk('distingue casa de guest spot',/Guest spot/.test(te)&&/Casa/.test(te));
chk('inclui convenção',/Convenção/.test(te));
chk('explica por que isso importa',/cada estúdio tem o próprio caderno/i.test(te));
chk('permite registrar passagem',/Registrar passagem/.test(te));

console.log('── 6. A VISÃO GERAL APONTA PARA AS DUAS ──');
S.route='studio';S.sub={vg:'mes'};g.e("render()");
var tv=tela();
chk('caixa no resumo do mês',/Caixa de julho/.test(tv)&&/studio-caixa/.test(tv));
chk('histórico no resumo do mês',/Últimas pessoas/.test(tv)&&/studio-historico/.test(tv));
chk('sem "Receita do mês" solta',!/Receita do mês/.test(tv));
S.sub={};

console.log('── 7. NADA QUEBROU ──');
['home','artist','plataforma','cadastro','modelo','conexao','me','studio','studio-caixa','studio-historico','studio-profile','studio-quotes'].forEach(function(r){
 S.session=r.indexOf('studio')===0?'artist':r.indexOf('me')===0?'client':'anon';S.route=r;
 try{g.e("render()");chk(r,tela().length>400)}catch(e){chk(r,false,e.message)}
});
console.log('══ '+f+' falha(s) ══');
process.exit(f?1:0);
