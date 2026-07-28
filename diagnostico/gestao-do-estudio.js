/* ═══════════════════════════════════════════════════════════════════
   A GESTÃO DO ESTÚDIO

   Rode com:  node diagnostico/gestao-do-estudio.js

   Sete telas, um mecanismo de sub-abas só. A verificação que mais
   importa não é nenhuma tela específica: é que todas usam a mesma
   função e o mesmo componente. Sub-aba que se comporta diferente em
   duas telas obriga a pessoa a aprender o gesto duas vezes.

   Também confere que cada lado não repete o outro — se os dois lados
   mostram a mesma coisa, dividir não simplificou nada.
   ═══════════════════════════════════════════════════════════════════ */

var fs=require('fs');
var html=fs.readFileSync(require('path').join(__dirname,'..','prototipo','index.html'),'utf8'), tjs=fs.readFileSync(require('path').join(__dirname,'..','prototipo','teste.js'),'utf8');
var code=html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g,'');
var css=html.slice(0,html.indexOf('</style>'));
var f=0;function chk(n,c,d){console.log((c?'  ok  ':'  XX  ')+n+(d&&!c?' → '+d:''));if(!c)f++}
var nos={};
function no(id){if(!nos[id])nos[id]={id:id,tagName:'INPUT',innerHTML:'',value:'',style:{},addEventListener:function(){},hasAttribute:function(){return false},getAttribute:function(){return null},setAttribute:function(){},removeAttribute:function(){},focus:function(){},setSelectionRange:function(){}};return nos[id]}
var IO=function(){this.observe=function(){};this.disconnect=function(){}};
var tempos=[];
var g=new Function('document','window','alert','console','location','IntersectionObserver','navigator','localStorage','setInterval','setTimeout','crypto','URLSearchParams',
 'var iniciarSupabase=function(){return Promise.resolve(null)};'+tjs+'\n'+code+';return {e:function(js){return eval(js)},S:S}')
 ({getElementById:no,documentElement:no('h'),body:{},addEventListener:function(){}},{scrollTo:function(){},Dados:{},addEventListener:function(){},innerWidth:393,matchMedia:function(){return{matches:true}}},
  function(){},{log:function(){}},{protocol:'https:',search:'',hash:'',origin:'https://x',pathname:'/'},IO,{geolocation:{},language:'pt'},
  {getItem:function(){return null},setItem:function(){},removeItem:function(){}},function(){},function(fn){tempos.push(fn)},{},URLSearchParams);
var S=g.S, tela=function(){return nos['app'].innerHTML};
S.session='artist';S.modo='demo';
function ir(rota,chave,valor){S.route=rota;if(chave){S.sub=S.sub||{};S.sub[chave]=valor}g.e("render()");return tela()}
function segs(t){var m=t.match(/class="segmento">([\s\S]*?)<\/div>/);return m?(m[1].match(/class="seg /g)||[]).length:0}

console.log('── UM MECANISMO SÓ, EM SEIS TELAS ──');
[['studio-quotes','orc','Orçamentos'],['studio-schedule','ag','Agenda'],
 ['studio-caixa','cx','Caixa'],['studio-historico','hist','Histórico'],['studio-events','ev','Eventos'],
 ['studio-reviews','av','Avaliações']].forEach(function(c){
 var t=ir(c[0]);
 chk(c[2]+': tem sub-abas',/class="segmento"/.test(t),'nenhuma');
 chk(c[2]+': exatamente duas',segs(t)===2,segs(t)+' opções');
});
// A visão geral é a exceção, e de propósito: dividir um resumo obriga a
// pessoa a escolher entre duas metades antes de saber o que procura.
chk('Visão geral NÃO tem sub-abas',!/class="segmento"/.test(ir('studio')));
chk('as seis usam a mesma função',(html.match(/abasInternas\(/g)||[]).length>=7,
    (html.match(/abasInternas\(/g)||[]).length+' usos');
chk('e o mesmo componente visual',/\.segmento\{/.test(css));

console.log('── ORÇAMENTOS RECEBIDOS: MAPA, PEDIDO, PROPOSTA ──');
/* Três passos, um de cada vez. O que a verificação persegue aqui é a
   ordem: se o campo de valor aparecer junto com as referências, a tela
   voltou a convidar o tatuador a precificar antes de olhar. */
S.orcPasso='lista';
var tr=ir('studio-quotes','orc','recebidos');
chk('passo 1: mapa dos pedidos',/class="mapa"/.test(tr));
chk('passo 1: lista embaixo do mapa',/class="lista"/.test(tr)&&/ver pedido/.test(tr));
chk('passo 1: o número da lista é o do pino',/class="pin /.test(tr)&&/class="av" style="font-size:12\.5px">1</.test(tr));
chk('passo 1: distância aparece',/km/.test(tr));
chk('passo 1: sem campo de valor',!/Enviar proposta/.test(tr)&&!/id="propValor"/.test(tr));
chk('o selo mostra quantos são novos',/class="selo"/.test(tr));

g.e("abrirPedido('s2')");var tp=tela();
chk('passo 2: abre o pedido clicado',/Rodrigo Palma/.test(tp));
chk('passo 2: referências em carrossel',/class="postimg"/.test(tp)&&/class="pips"/.test(tp)&&/class="nav r"/.test(tp));
chk('passo 2: diz qual referência é',/referência 1 de 5/.test(tp));
chk('passo 2: o comentário do cliente',/O que o cliente escreveu/.test(tp)&&/Ornamental, cobrindo/.test(tp));
chk('passo 2: ainda sem campo de valor',!/id="propValor"/.test(tp),'formulário apareceu cedo demais');
chk('passo 2: leva à proposta',/Fazer proposta/.test(tp));
chk('passo 2: e dá para recusar',/Recusar/.test(tp));
chk('passo 2: dá para voltar',/Todos os pedidos/.test(tp));

g.e("S.orcPasso='proposta';render()");var tq=tela();
chk('passo 3: valor e mensagem',/id="propValor"/.test(tq)&&/id="propMsg"/.test(tq));
chk('passo 3: sugere um valor de partida',/value="R\$ /.test(tq));
chk('passo 3: diz onde o valor cai',/id="dicaProposta"/.test(tq));
chk('passo 3: lembra de quem é o pedido',/Rodrigo Palma/.test(tq));
chk('passo 3: envia',/enviarProposta\(\)/.test(tq));
chk('passo 3: e dá para voltar sem enviar',/Voltar sem enviar/.test(tq));
/* O defeito do cursor sumindo nasceu exatamente assim: um oninput que
   repinta a tela inteira e destrói o campo em foco. */
chk('passo 3: digitar não repinta a tela',/oninput="atualizarProposta\(\)"/.test(tq)&&!/id="propValor"[^>]*oninput="[^"]*render\(\)/.test(tq));

g.e("enviarProposta()");var tf=tela();
chk('enviar volta para a lista e confirma',/class="avisook"/.test(tf)&&/Proposta enviada/.test(tf));
chk('e o pedido não fica mais como novo',/Rodrigo Palma[\s\S]{0,200}respondido/.test(tf));

/* O mapa é o mesmo componente em eventos, cursos e orçamentos. Altura
   diferente entre eles fazia o chão se mexer ao trocar de aba. */
chk('altura de mapa única',(html.match(/mapinha\([^)]*,\s*\d+\)/g)||[]).length===0,
    'ainda existe mapinha com altura própria');
chk('e a altura está num lugar só',/var ALT_MAPA=\d+;/.test(html));
var te=ir('studio-quotes','orc','enviados');
chk('enviados: o que ele respondeu',/O que você respondeu/.test(te));
chk('enviados: mostra a resposta do cliente',/Aceitou e marcou/.test(te));
chk('enviados: diz o que virou agendamento',/agendado/.test(te)&&/Viraram sessão/.test(te));
chk('enviados: separa aceito de aguardando',/aceito/.test(te)&&/aguardando/.test(te));
chk('enviados: e recusado',/recusado/.test(te));
chk('enviados: ação por situação',/Marcar data/.test(te)&&/Lembrar/.test(te));
chk('enviados: não repete o formulário de resposta',!/Enviar proposta/.test(te));

console.log('── AGENDA: GOOGLE ──');
var ta=ir('studio-schedule','ag','conexoes');
chk('existe a aba de conexões',/Google Agenda/.test(ta));
chk('começa desconectada',/não conectada/.test(ta));
chk('diz o que pede de permissão',/O que pedimos/.test(ta)&&/Nada de e-mail/.test(ta));
chk('diz o que faz com isso',/calendário separado/.test(ta));
chk('e como desfazer',/desconectar leva tudo embora/.test(ta));
chk('oferece conectar',/conectarGoogleAgenda/.test(ta));
g.e("conectarGoogleAgenda()");
chk('mostra que está conectando',S.googleConectando===true);
tempos.forEach(function(fn){fn()});
chk('conecta',S.agendaGoogle===true);
var ta2=ir('studio-schedule','ag','conexoes');
chk('conectada: mostra a conta',/conectada/.test(ta2)&&/gmail\.com/.test(ta2));
chk('conectada: diz o que sincroniza',/Sessões confirmadas/.test(ta2)&&/Compromissos do Google/.test(ta2));
chk('conectada: e o que NÃO sincroniza',/ficam só aqui/.test(ta2));
chk('conectada: dá para desconectar',/Desconectar/.test(ta2));
var tm=ir('studio-schedule','ag','mes');
chk('o mês avisa que está sincronizado',/Sincronizada com o Google/.test(tm));
S.agendaGoogle=false;
chk('sem conexão, sem aviso',!/Sincronizada com o Google/.test(ir('studio-schedule','ag','mes')));

console.log('── VISÃO GERAL: UM PAINEL SÓ ──');
var tv=ir('studio');
chk('é um painel de números grandes',/class="grandes"/.test(tv)&&/class="grande/.test(tv));
var cartoes=(tv.match(/class="grande[ "]/g)||[]).length;
chk('dez números',cartoes===10,cartoes+' cartões');
chk('agrupa por urgência',/Precisa de você/.test(tv)&&/Como vai o mês/.test(tv)&&/O que você construiu/.test(tv));
[['pedidos novos',/Pedidos novos/],['propostas sem retorno',/Propostas sem retorno/],
 ['avaliações a responder',/Avaliações a responder/],['sobrou',/>Sobrou</],
 ['sessões marcadas',/Sessões marcadas/],['propostas que fecharam',/Propostas que fecharam/],
 ['pessoas tatuadas',/Pessoas tatuadas/],['estúdios',/Estúdios por onde passei/],
 ['obras à venda',/Obras à venda/],['avaliação',/>Avaliação</]].forEach(function(c){
 chk('resume '+c[0],c[1].test(tv));
});
chk('todo cartão leva a algum lugar',(tv.match(/class="grande[^"]*" onclick="[^"]*go\(/g)||[]).length===cartoes,
    'algum cartão sem destino');
chk('e leva à sub-aba certa',/S\.sub\.orc='enviados';go\('studio-quotes'\)/.test(tv.replace(/&#39;/g,"'")));
chk('só o que tem pendência destaca',(tv.match(/grande alerta/g)||[]).length<=2);
/* Dez números e nada mais. As listas de "pedidos recentes" e "próximas
   sessões" saíram: cada uma já tem um número apontando para ela, e
   repetir o conteúdo da aba dentro do resumo é o que fazia esta tela
   crescer sem parar. */
chk('não repete o conteúdo das abas',!/Pedidos recentes/.test(tv)&&!/Próximas sessões/.test(tv),
    'a visão geral voltou a copiar lista de outra aba');
chk('css do painel existe',/\.grandes\{/.test(css)&&/\.grande\.alerta\{/.test(css));
chk('duas colunas no celular, mais nas telas maiores',
    /\.grandes\{[^}]*repeat\(2,1fr\)/.test(css)&&
    /@media\(min-width:560px\)\{\.grandes\{grid-template-columns:repeat\(3,1fr\)/.test(css)&&
    /@media\(min-width:700px\)\{\.grandes\{grid-template-columns:repeat\(4,1fr\)/.test(css));
/* Cartão pequeno é o pedido: dez cartões grandes viravam três rolagens
   no celular, que é o oposto de um resumo. */
chk('cartão compacto: ícone e rótulo na mesma linha',/class="gtopo"/.test(tv)&&/\.grande \.gtopo\{[^}]*display:flex/.test(css));
var mv=css.match(/\.grande \.gval\{font-size:(\d+)px/);
chk('e o número não domina a tela',mv&&+mv[1]<=24,mv?mv[1]+'px':'sem regra');

console.log('── CAIXA ──');
var tc=ir('studio-caixa','cx','resumo');
chk('resumo: entrou, saiu, sobrou',/Entrou em julho/.test(tc));
chk('resumo: de onde veio',/De onde veio/.test(tc));
chk('resumo: só os últimos lançamentos',/Últimos lançamentos/.test(tc)&&/Ver todos/.test(tc));
var tl=ir('studio-caixa','cx','lancamentos');
chk('lançamentos: a tabela cheia',/<table class="t"/.test(tl));
chk('lançamentos: dá para lançar',/Lançar entrada/.test(tl));
chk('lançamentos: não repete o resumo',!/De onde veio/.test(tl));

console.log('── EVENTOS ──');
var tev=ir('studio-events','ev','meus');
chk('meus: os que ele criou',/Seus eventos e cursos/.test(tev)&&/publicado/.test(tev));
chk('meus: liga ao caixa',/entra no caixa/.test(tev));
var tep=ir('studio-events','ev','participo');
chk('participo: onde se inscreveu',/Onde você se inscreveu/.test(tep)&&/inscrito/.test(tep));
chk('participo: liga ao histórico',/histórico/.test(tep));

console.log('── AVALIAÇÕES ──');
var tav=ir('studio-reviews','av','todas');
chk('todas: a nota e a distribuição',/4\.8/.test(tav));
chk('todas: mostra as respostas dadas',/Você respondeu/.test(tav));
var tresp=ir('studio-reviews','av','responder');
chk('responder: só as sem resposta',/Esperando você/.test(tresp));
chk('responder: campo de resposta',/Responder publicamente/.test(tresp));
chk('responder: diz por que importa',/como você lida quando algo não sai perfeito/.test(tresp));

console.log('── CELULAR E IPAD ──');
[[393,'iPhone 16'],[430,'iPhone 16 Pro Max'],[744,'iPad mini'],[820,'iPad 10.9'],[1024,'iPad Pro 11']].forEach(function(d){
 var util=d[0]-28-6;
 var pior=0;
 [['Sem resposta','Todas'],['Que eu criei','Que eu participo'],['Recebidos','Enviados'],['Lançamentos','Resumo'],['Quem eu tatuei','Onde eu tatuei']].forEach(function(par){
  var w=par.reduce(function(a,t){return a+Math.round(22+t.length*12.5*0.56)},0);
  if(w>pior)pior=w;
 });
 chk(d[1]+' ('+d[0]+'px): o par mais largo cabe em '+util+'px',pior<=util,pior+'px');
});
chk('e se não couber, rola na horizontal',/\.segmento\{[^}]*overflow-x:auto/.test(css));
chk('alvo de toque de 44pt',/@media\(pointer:coarse\)/.test(css));

console.log('── A ESCOLHA SOBREVIVE ──');
chk('sub-abas são persistidas',/"sub","agendaGoogle"/.test(html));
console.log('══ '+f+' falha(s) ══');
process.exit(f?1:0);
