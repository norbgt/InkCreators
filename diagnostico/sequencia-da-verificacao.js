/* ═══════════════════════════════════════════════════════════════════
   A SEQUÊNCIA DA VERIFICAÇÃO DO NAVEGADOR

   Rode com:  node diagnostico/sequencia-da-verificacao.js

   O verificar.js roda no navegador e é a única forma de conferir foco,
   cursor e posição real dos elementos. Mas ele tem um ponto cego: se
   uma seção conta com o estado que a anterior deixou, e alguém insere
   uma seção nova no meio, tudo abaixo passa a testar a tela errada —
   e reclama do produto quando o defeito é do roteiro.

   Foi exatamente o que aconteceu na primeira execução dele no ar.

   Este arquivo percorre a mesma sequência fora do navegador e confere
   só uma coisa: em cada seção, os elementos que ela vai consultar
   existem naquele momento. É barato e roda antes de publicar.
   ═══════════════════════════════════════════════════════════════════ */

var fs=require('fs');
var html=fs.readFileSync(require('path').join(__dirname,'..','prototipo','index.html'),'utf8'), tjs=fs.readFileSync(require('path').join(__dirname,'..','prototipo','teste.js'),'utf8');
var code=html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g,'');
var f=0;function chk(n,c,d){console.log((c?'  ok  ':'  XX  ')+n+(d&&!c?' → '+d:''));if(!c)f++}
var nos={};
function no(id){if(!nos[id])nos[id]={id:id,tagName:'INPUT',innerHTML:'',value:'',style:{},
  addEventListener:function(){},hasAttribute:function(){return false},getAttribute:function(){return null},
  setAttribute:function(){},removeAttribute:function(){},focus:function(){},setSelectionRange:function(){}};return nos[id]}
var doc={getElementById:no,documentElement:no('h'),activeElement:null,body:{},addEventListener:function(){},visibilityState:'visible'};
var g=new Function('document','window','alert','console','location','IntersectionObserver','navigator','localStorage','setInterval','crypto','URLSearchParams',
 'var iniciarSupabase=function(){return Promise.resolve(null)};'+tjs+'\n'+code+';return {e:function(js){return eval(js)},S:S}')
 (doc,{scrollTo:function(){},Dados:{},addEventListener:function(){},innerWidth:393,matchMedia:function(){return{matches:true}}},
  function(){},{log:function(){}},{protocol:'https:',search:'',hash:'',origin:'https://x',pathname:'/'},
  function(){this.observe=function(){};this.disconnect=function(){}},{geolocation:{},language:'pt'},
  {getItem:function(){return null},setItem:function(){},removeItem:function(){}},function(){},{},URLSearchParams);
var S=g.S, tela=function(){return nos['app'].innerHTML};
function passo(){var m=tela().match(/Passo \d de 3/);return m?m[0]:'fora do cadastro';}

// helpers, iguais aos do verificar.js
function aoPasso2Email(){g.e("irCadastro(null)");S.cad.nome='Ana Souza';S.cad.email='ana@exemplo.com';S.cad.senha='123456';g.e("render()");g.e("avancarCad()");return tela()}
function aoPasso2Google(){g.e("irCadastro(null)");g.e("entrarComGoogle()");return tela()}
function aoPasso3(perfil,u){aoPasso2Email();S.cad.usuario=u||'ana.souza';S.cad.perfil=perfil;g.e("render()");g.e("avancarCad()");return tela()}

console.log('── SEÇÃO 4b: passo 3 do tatuador ──');
aoPasso2Email();S.cad.usuario='ana.souza';S.cad.perfil='tatuador';g.e("render()");g.e("avancarCad()");
chk('está no passo 3',passo()==='Passo 3 de 3',passo());
chk('tem chips de estilo',/class="chip/.test(tela()));
chk('tem o marcador de cobertura',/class="marcador/.test(tela()));
chk('tem o campo de instagram',/id="onbInsta"/.test(tela()));
chk('instagram dentro do campoprefixo',/campoprefixo"><span>@<\/span><input class="fld" id="onbInsta"/.test(tela()));

console.log('── SEÇÃO 4c: Google x e-mail, cada um do zero ──');
var pe=aoPasso2Email(), pg=aoPasso2Google();
chk('e-mail chega no passo 2',/Passo 2 de 3/.test(pe));
chk('google chega no passo 2',/Passo 2 de 3/.test(pg));
['cadUsuario','campoprefixo','dicaUsuario','perfis','btnAvancarCad'].forEach(function(m){
 chk('marca "'+m+'" nos dois',pe.indexOf(m)>=0&&pg.indexOf(m)>=0,'email:'+(pe.indexOf(m)>=0)+' google:'+(pg.indexOf(m)>=0));
});
chk('google diz de qual conta',/Conectado com o Google/.test(pg));

console.log('── SEÇÃO 4d: cliente e fornecedor ──');
var pc=aoPasso3('cliente','ana.c');
chk('cliente: passo 3',passo()==='Passo 3 de 3',passo());
chk('cliente: tem cliCidade',/id="cliCidade"/.test(pc));
chk('cliente: tem chips',/class="chip/.test(pc));
chk('cliente: sem Pular',!/>Pular</.test(pc));
chk('cliente: travado sem cidade',/id="btnAvancarCad" disabled/.test(pc));
var pf=aoPasso3('fornecedor','cida.f');
chk('fornecedor: passo 3',passo()==='Passo 3 de 3',passo());
chk('fornecedor: tem o marcador',/class="marcador/.test(pf));
chk('fornecedor: Nome da empresa',/Nome da empresa/.test(pf));

console.log('── SEÇÃO 5: criar conta do zero ──');
aoPasso3('tatuador','ana.souza');
g.e("tog(S.onbStyles,'realismo')");
chk('escolher estilo destrava',!/id="btnAvancarCad" disabled/.test(tela()));
S.onbEstudio='Studio Ana';
g.e("avancarCad()");
chk('virou tatuador',S.session==='artist',S.session);
chk('caiu na gestão',S.route==='studio',S.route);
chk('guardou o usuário',S.usuario==='ana.souza',String(S.usuario));

console.log('── SEÇÃO 6: os três passos 3, todos exigem algo ──');
[['cliente','O que você procura'],['tatuador','O que você tatua'],['fornecedor','Nome da empresa']].forEach(function(c){
 var t=aoPasso3(c[0],'teste.'+c[0].slice(0,3));
 chk(c[0]+': passo 3',passo()==='Passo 3 de 3',passo());
 chk(c[0]+': conteúdo certo',new RegExp(c[1]).test(t));
 chk(c[0]+': exige preencher',/id="btnAvancarCad" disabled/.test(t),'botão livre');
});

console.log('── SEÇÃO 6b e 7 ──');
aoPasso2Email();
chk('6b: tem os três cartões',(tela().match(/class="perfilopt/g)||[]).length===3);
g.e("irCadastro(null)");
chk('7: rodapé existe no passo 1',/class="rodapepassos"/.test(tela()));
chk('7: tem Voltar e Continuar',/Voltar<\/button>/.test(tela())&&/id="btnAvancarCad"/.test(tela()));
console.log('══ '+f+' falha(s) ══');
process.exit(f?1:0);
