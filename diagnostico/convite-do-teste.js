/* ═══════════════════════════════════════════════════════════════════
   O CONVITE, EM VEZ DO PORTÃO

   Rode com:  node diagnostico/convite-do-teste.js

   Antes o consentimento vinha primeiro e a plataforma ficava atrás de
   um formulário — o que media a disposição de preencher formulário, e
   não a primeira impressão do produto.

   Agora a pessoa cai no feed e o convite fica numa faixa embaixo. Este
   diagnóstico confere as três coisas que isso exige: que o feed é a
   primeira tela, que nada é registrado antes do aceite, e que o
   cadastro continua acessível pelas rotas de sempre.
   ═══════════════════════════════════════════════════════════════════ */

var fs=require('fs');
var html=fs.readFileSync(require('path').join(__dirname,'..','prototipo','index.html'),'utf8'), tjs=fs.readFileSync(require('path').join(__dirname,'..','prototipo','teste.js'),'utf8');
var code=html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g,'');
var css=html.slice(0,html.indexOf('</style>'));
var f=0;function chk(n,c,d){console.log((c?'  ok  ':'  XX  ')+n+(d&&!c?' → '+d:''));if(!c)f++}
function amb(query,disco){
 disco=disco||{};var nos={},guardado={teste_sessoes:[],teste_eventos:[]};
 function no(id){if(!nos[id])nos[id]={id:id,tagName:'INPUT',innerHTML:'',value:'',style:{},addEventListener:function(){},hasAttribute:function(){return false},getAttribute:function(){return null},setAttribute:function(){},removeAttribute:function(){},focus:function(){},setSelectionRange:function(){}};return nos[id]}
 var doc={getElementById:no,documentElement:no('h'),activeElement:null,body:{},addEventListener:function(){},visibilityState:'visible'};
 var IO=function(){this.observe=function(){};this.disconnect=function(){}};
 var sb={from:function(t){return {insert:function(l){(Array.isArray(l)?l:[l]).forEach(function(x){guardado[t].push(x)});return Promise.resolve({error:null})}}}};
 var g=new Function('document','window','alert','console','location','IntersectionObserver','navigator','localStorage','setInterval','crypto','__SB','URLSearchParams',
  'var iniciarSupabase=function(){return Promise.resolve(__SB)};'+tjs+'\n'+code+';return {e:function(js){return eval(js)},S:S,T:T}')
  (doc,{scrollTo:function(){},Dados:{},addEventListener:function(){},innerWidth:393,matchMedia:function(){return{matches:true}}},
   function(){},{log:function(){}},{protocol:'https:',search:query||'',hash:'',origin:'https://x',pathname:'/'},
   IO,{geolocation:{},language:'pt',userAgent:'t'},
   {getItem:function(k){return disco[k]===undefined?null:disco[k]},setItem:function(k,v){disco[k]=String(v)},removeItem:function(k){delete disco[k]}},
   function(){},{randomUUID:function(){return 's-1'}},sb,URLSearchParams);
 g.nos=nos;g.disco=disco;g.guardado=guardado;
 g.tela=function(){return nos['app'].innerHTML};
 g.convite=function(){return nos['conviteHost']?nos['conviteHost'].innerHTML:''};
 g.topo=function(){return nos['topActions']?nos['topActions'].innerHTML:''};
 return g;
}

console.log('── A PRIMEIRA COISA É O FEED ──');
var g=amb('?teste=1');
chk('não há formulário bloqueando',!/Obrigada por topar/.test(g.tela()));
chk('o feed está na tela',(g.tela().match(/class="post"/g)||[]).length>=3);
chk('como visitante',g.S.session==='anon');
chk('com dados fictícios',g.S.modo==='demo');
chk('a barra do produto aparece',g.nos['topbar'].style.display==='');
chk('a de desenvolvimento não',g.nos['protobar'].style.display==='none');
chk('nada foi registrado ainda',g.T.ligado===false&&g.guardado.teste_sessoes.length===0);

console.log('── O CONVITE FICA VISÍVEL, SEM BLOQUEAR ──');
var c=g.convite();
chk('a faixa aparece',/convitebarra/.test(c));
chk('diz o que é',/Isto é um teste/.test(c));
chk('convida sem obrigar',/Navegue à vontade/.test(c));
chk('oferece participar',/abrirConvite/.test(c));
chk('e recusar',/recusarConvite/.test(c));
chk('a faixa não tapa o conteúdo',/body:has\(\.convitebarra\) main\{padding-bottom/.test(css));

console.log('── NAVEGA LIVRE ANTES DE DECIDIR ──');
g.e("go('artist','a0')");
chk('abre perfil de tatuador',/class="perfilnome"/.test(g.tela()));
chk('convite continua ali',/convitebarra/.test(g.convite()));
g.e("go('plataforma')");
chk('abre Conhecer',/Como a plataforma se sustenta/.test(g.tela()));
chk('e nada foi registrado',g.guardado.teste_eventos.length===0&&g.T.fila.length===0);

console.log('── O CADASTRO ESTÁ NAS ROTAS DE SEMPRE ──');
g.e("go('home')");
chk('a barra oferece entrar ou criar conta',/irCadastro\(null\)/.test(g.topo()),g.topo().slice(0,140));
chk('e oferece Conhecer',/plataforma/.test(g.topo()));
g.e("go('plataforma')");
chk('Conhecer leva ao cadastro',/irCadastro\('cliente'\)|irCadastro\(/.test(g.tela()));
g.e("irCadastro(null)");
chk('o fluxo de três passos abre',/Passo 1 de 3/.test(g.tela()));
chk('mesmo sem ter aceitado o teste',g.T.ligado===false);
chk('o convite não some por isso',/convitebarra/.test(g.convite()));

console.log('── ACEITAR ──');
g.e("abrirConvite()");
chk('a caixa abre por cima',/convitecx/.test(g.convite()));
chk('o feed continua atrás',g.tela().length>1000);
chk('dá para voltar a navegar',/fecharConvite/.test(g.convite()));
chk('diz que o registro começa agora',/registro começa agora/.test(g.convite()));
g.S.te={nome:'Ana Souza',email:'ana@x.com',perfil:'cliente',aceite:true};
g.e("entrarNoTeste()");
setTimeout(function(){
 chk('passou a registrar',g.T.ligado===true);
 chk('sessão gravada',g.guardado.teste_sessoes.length===1);
 chk('o convite some',g.convite()==='');
 chk('e continua no produto',g.tela().length>1000);
 g.e("go('artist','a1')");
 chk('agora a navegação vira evento',g.T.fila.length>0);

 console.log('── RECUSAR ──');
 var r=amb('?teste=1');
 chk('faixa aparece',/convitebarra/.test(r.convite()));
 r.e("recusarConvite()");
 chk('some ao recusar',r.convite()==='');
 chk('e não registra nada',r.T.ligado===false);
 r.e("go('artist','a0')");
 chk('mas continua navegando',/class="perfilnome"/.test(r.tela()));
 var r2=amb('?teste=1',r.disco);
 chk('não insiste na próxima visita',r2.convite()==='');

 console.log('── SEM ?teste=1 ──');
 var n=amb('');
 chk('nenhum convite',n.convite()==='');
 chk('barra de desenvolvimento intacta',!n.nos['protobar']||n.nos['protobar'].style.display!=='none');
 console.log('══ '+f+' falha(s) ══');
 process.exit(f?1:0);
},30);
