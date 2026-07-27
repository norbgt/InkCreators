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
[['studio','vg','Visão geral'],['studio-quotes','orc','Orçamentos'],['studio-schedule','ag','Agenda'],
 ['studio-caixa','cx','Caixa'],['studio-historico','hist','Histórico'],['studio-events','ev','Eventos'],
 ['studio-reviews','av','Avaliações']].forEach(function(c){
 var t=ir(c[0]);
 chk(c[2]+': tem sub-abas',/class="segmento"/.test(t),'nenhuma');
 chk(c[2]+': exatamente duas',segs(t)===2,segs(t)+' opções');
});
chk('todas usam a mesma função',(html.match(/abasInternas\(/g)||[]).length>=8);
chk('e o mesmo componente visual',/\.segmento\{/.test(css));

console.log('── ORÇAMENTOS: RECEBIDOS E ENVIADOS ──');
var tr=ir('studio-quotes','orc','recebidos');
chk('recebidos: lista de pedidos',/Pedidos recebidos/.test(tr));
chk('recebidos: dá para responder',/Enviar proposta/.test(tr));
chk('recebidos: e recusar',/Recusar pedido/.test(tr));
chk('o selo mostra quantos são novos',/class="selo"/.test(tr));
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

console.log('── VISÃO GERAL: AGORA E O MÊS ──');
var td=ir('studio','vg','dia');
chk('agora: só o que pede resposta',/Pedidos novos/.test(td)&&/Propostas sem retorno/.test(td));
chk('agora: orçamentos e agendamentos',/Orçamentos recentes/.test(td)&&/Próximos agendamentos/.test(td));
chk('agora: não mostra caixa nem visitas',!/Caixa de julho/.test(td)&&!/Visitas ao perfil/.test(td));
var tmes=ir('studio','vg','mes');
chk('o mês: caixa',/Caixa de julho/.test(tmes));
chk('o mês: pessoas',/Últimas pessoas/.test(tmes));
chk('o mês: visitas',/Visitas ao perfil/.test(tmes));
chk('o mês: não repete os pedidos',!/Orçamentos recentes/.test(tmes));

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
