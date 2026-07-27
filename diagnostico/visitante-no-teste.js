/* ═══════════════════════════════════════════════════════════════════
   O QUE O PARTICIPANTE DO TESTE ENCONTRA

   Rode com:  node diagnostico/visitante-no-teste.js

   Quem abre o link do teste chega sem conta, e o banco real tem zero
   tatuadores. Se a pessoa caísse nele, veria um catálogo vazio e o
   teste não teria objeto.

   Este diagnóstico confere que ela entra como visitante, com os dados
   fictícios, que há conteúdo em todas as áreas públicas, e que o que é
   ferramenta interna não aparece para ela.
   ═══════════════════════════════════════════════════════════════════ */

var fs=require('fs');
var html=fs.readFileSync(require('path').join(__dirname,'..','prototipo','index.html'),'utf8'), tjs=fs.readFileSync(require('path').join(__dirname,'..','prototipo','teste.js'),'utf8');
var code=html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g,'');
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
 g.nos=nos;g.disco=disco;g.tela=function(){return nos['app'].innerHTML};return g;
}

console.log('── O PARTICIPANTE ENTRA E VÊ O QUE UM VISITANTE VÊ ──');
var g=amb('?teste=1');
chk('cai direto no produto, sem formulário',!/Obrigada por topar/.test(g.tela()));
g.e("abrirConvite()");
g.S.te={nome:'Ana Souza',email:'ana@x.com',perfil:'cliente',aceite:true};
g.e("entrarNoTeste()");
setTimeout(function(){
 chk('entrou',g.T.ligado===true);
 chk('entra como VISITANTE, não logado',g.S.session==='anon',g.S.session);
 chk('com dados fictícios',g.S.modo==='demo',g.S.modo);
 chk('na descoberta',g.S.route==='home'&&g.S.tab==='discover');
 chk('a barra de desenvolvimento some',g.nos['protobar'].style.display==='none');
 chk('a barra do produto aparece',g.nos['topbar'].style.display==='');

 var t=g.tela();
 chk('o feed tem tatuadores',(t.match(/class="post"/g)||[]).length>=3,(t.match(/class="post"/g)||[]).length+' posts');
 chk('com nome, estúdio e cidade',/Studio /.test(t));
 chk('com faixa de preço',/class="cifra/.test(t));
 chk('com portfólio',/postimg|tat/.test(t));
 chk('sem catálogo vazio',!/Nenhum tatuador cadastrado/.test(t));
 var topo=g.nos['topActions']?g.nos['topActions'].innerHTML:'';
 chk('a barra do produto oferece entrada',/irCadastro|Criar conta|Entrar|Conhecer/.test(topo),'topo: '+topo.slice(0,120));

 console.log('── E NAVEGA PELO RESTO SEM LOGAR ──');
 [['loja','shop',/class="cardprod|produto|Cicatrizante|Cartucho/],
  ['eventos','events',/Convenção|Flash|evento/i],
  ].forEach(function(c){
  g.S.tab=c[1];g.e("render()");
  chk(c[0]+' com conteúdo',c[2].test(g.tela())&&g.tela().length>3000,g.tela().length+' chars');
 });
 g.e("go('artist','a0')");
 chk('perfil de tatuador abre',/Sobre o tatuador/.test(g.tela()));
 chk('com portfólio mockado',/gradeport/.test(g.tela()));
 g.e("go('plataforma')");
 chk('conhecer abre',/Como a plataforma se sustenta/.test(g.tela()));

 console.log('── O QUE É INTERNO NÃO APARECE ──');
 g.e("go('modelo')");
 chk('modelo de negócio é desviado',g.S.route==='home',g.S.route);
 g.e("go('conexao')");
 chk('conexão com o banco é desviada',g.S.route==='home',g.S.route);
 chk('e não dá para trocar o banco pela barra',g.nos['protobar'].style.display==='none');

 console.log('── FORA DO TESTE, NADA MUDA ──');
 var n=amb('');
 chk('barra de desenvolvimento intacta',!n.nos['protobar']||n.nos['protobar'].style.display!=='none');
 n.S.route='modelo';n.e("render()");
 chk('modelo de negócio acessível',n.S.route==='modelo');
 n.S.route='conexao';n.e("render()");
 chk('conexão acessível',n.S.route==='conexao');

 console.log('── QUEM VOLTA DEPOIS TAMBÉM NÃO VÊ A BARRA ──');
 var d={};d['ink.teste.sessao.v1']=JSON.stringify({id:'a',nome:'A',email:'a@b.c',perfil:'cliente'});
 var v=amb('?teste=1',d);
 chk('não pede consentimento de novo',!/Obrigada por topar/.test(v.tela()));
 chk('barra continua escondida',v.nos['protobar'].style.display==='none');
 chk('coleta ligada',v.T.ligado===true);

 console.log('══ '+f+' falha(s) ══');
 process.exit(f?1:0);
},30);
