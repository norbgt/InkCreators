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

console.log('── SEIS ABAS E UMA FAIXA SÓ ──');
/* Eram nove abas com até quatro sub-abas: dezoito lugares para clicar
   e metade do conteúdo atrás do segundo clique. Agora cada aba é uma
   página que rola, com as partes em sequência — num painel de gestão
   rolar é mais barato que esconder, e comparar duas coisas exige
   vê-las juntas, o que sub-aba impede por construção. */
chk('exatamente cinco abas na barra',g.e("ST_NAV.length")===5,g.e("ST_NAV.length")+' abas');
chk('e são estas',
    g.e("ST_NAV.map(function(x){return x[1]}).join('·')")==='Visão geral·Orçamentos·Agenda·Reputação·Cursos e eventos',
    g.e("ST_NAV.map(function(x){return x[1]}).join(' · ')"));
/* Tatuador e cliente chamam a primeira aba do mesmo jeito. A mesma
   pessoa troca de papel — quem tatua também é cliente — e dois nomes
   para a mesma função obrigam a reaprender a ler no meio do caminho. */
chk('a primeira aba tem o mesmo nome nos dois papéis',
    g.e("ST_NAV[0][1]")===g.e("ME_NAV[0][1]"),
    g.e("ST_NAV[0][1]")+' vs '+g.e("ME_NAV[0][1]"));
chk('Meu perfil saiu da barra',!/studio-profile/.test(JSON.stringify(g.e("ST_NAV"))));
chk('e continua alcançável',/class="conf /.test(ir('studio')) && ir('studio-profile').length>1500);

/* Cursos e eventos tem porta própria: quem entra ali vai criar um
   curso, não conferir reputação. */
chk('cursos e eventos é aba, não sub-aba',/studio-eventos/.test(JSON.stringify(g.e("ST_NAV"))));

console.log('── NENHUMA SEGUNDA FAIXA DE ABAS ──');
var ESPERADO={'studio':4,'studio-quotes':2,'studio-schedule':3,'studio-reputacao':3,'studio-eventos':2};
Object.keys(ESPERADO).forEach(function(rota){
 var t=ir(rota);
 var secoes=(t.match(/class="secgt"/g)||[]).length;
 chk(rota+': '+ESPERADO[rota]+' seções na página',secoes===ESPERADO[rota],secoes+' seções');
 chk(rota+': sem segunda faixa de abas',!/class="segmento"/.test(t),
     'voltou a esconder metade do conteúdo atrás de um clique');
});

/* A montagem recorta o corpo da página por marcador. Recorte por
   marcador é frouxo, então ele devolve null em vez de lixo — e a
   página inteira volta a ser renderizada do jeito antigo. */
chk('a montagem em seções tem rede',/if\(i<0\)return null/.test(code));
chk('e devolve S.sub como estava',/finally\{ montandoSecoes=false; S\.sub=JSON\.parse\(guardado\) \}/.test(code),
    'sem restaurar, a aba visitada mudaria a próxima');

/* A primeira seção não leva traço em cima: ela encosta na barra, e um
   traço logo abaixo de outro traço não separa nada. */
chk('a primeira seção não repete o traço da barra',/\.secg\.pri\{margin-top:0;padding-top:0;border-top:none\}/.test(css));

/* Setenta pixels de nada entre a barra e o conteúdo: 11 do respiro da
   aba, 24 do main e até 36 da margem do segmento, somados sem que
   ninguém tivesse decidido somá-los. */
chk('sem folga tripla entre a barra e o conteúdo',/\.envhead \+ main\{padding-top:14px\}/.test(css));

console.log('── CADA SEÇÃO MOSTRA COISA DIFERENTE ──');
/* A guarda essencial da página empilhada, e a que faltava.

   A página tem uma chave só — vg — e os blocos internos continuam
   escritos em torno das chaves antigas (orc, cx). Uma tradução liga as
   duas. Se essa tradução sumir, a seção "Propostas enviadas" renderiza
   o conteúdo de "recebidos" e a página fica com o mesmo bloco duas
   vezes, com títulos diferentes.

   Descobri isso sabotando: apaguei a linha da tradução e os dez
   roteiros continuaram verdes. Verificação que não existe é pior que
   verificação frouxa, porque ninguém sabe que falta. */
Object.keys(g.e("SECOES_DA_GESTAO")).forEach(function(rota){
 var secoes=g.e("SECOES_DA_GESTAO['"+rota+"']");
 var papel=rota.indexOf('forn')===0?'forn':rota.indexOf('me')===0?'client':'artist';
 S.session=papel;
 var corpos=secoes.map(function(sc){
  S.sub=S.sub||{}; S.sub[sc[0]]=sc[1];
  S.route=rota; g.e("render()");
  /* Só o miolo: o cabeçalho e a barra de abas são iguais em todas. */
  var t=tela(); var i=t.lastIndexOf('class="secgt"');
  return {nome:sc[2], txt:t.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ')};
 });
 /* Compara o corpo de cada seção isoladamente, renderizando fora da
    montagem — é assim que dá para ver uma seção de cada vez. */
 var isolados=secoes.map(function(sc){
  S.sub=S.sub||{}; S.sub[sc[0]]=sc[1];
  var pg=g.e("(function(){var r=(SECOES_DA_GESTAO['"+rota+"']?1:0);return "+
             (papel==='forn'?'vForn':papel==='client'?'vMe':'vStudio')+"('"+rota+"')})()");
  var c=pg.replace(/[\s\S]*<main><div class="wrap">/,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  return {nome:sc[2], c:c};
 });
 var iguais=[];
 for(var i=0;i<isolados.length;i++)for(var j=i+1;j<isolados.length;j++)
  if(isolados[i].c===isolados[j].c)iguais.push(isolados[i].nome+' = '+isolados[j].nome);
 chk(rota+': as '+secoes.length+' seções têm conteúdos distintos',iguais.length===0,
     'duas seções renderizam a mesma coisa: '+iguais.join(', '));
});
S.session='artist'; S.sub={};

console.log('── NENHUMA PÁGINA SE REPETE ──');
/* Defeito que só existe depois de empilhar: a montagem renderiza a
   página inteira uma vez por seção, então tudo o que é da PÁGINA e não
   da seção — banner de convite, aviso de área em estudo — sai repetido.

   Aconteceu com dois deles na primeira versão desta arquitetura: três
   convites "Também é tatuador?" empilhados no cliente, e três avisos
   "Perfil em estudo" no fornecedor. A guarda é naPrimeiraSecao(). */
chk('existe uma função só para preâmbulo de página',/function naPrimeiraSecao/.test(code),
    'sem ela, cada preâmbulo novo inventa a própria guarda e um deles erra');

[['artist','studio'],['artist','studio-quotes'],['artist','studio-schedule'],
 ['artist','studio-caixa'],['artist','studio-reputacao'],['artist','studio-eventos'],
 ['client','me'],['forn','forn-loja'],['forn','forn-recomendacoes'],
 ['forn','forn-embaixadores']].forEach(function(par){
 S.session=par[0];
 var t=ir(par[1]).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 var frases=t.split(/(?<=[.?!])\s|\s{2,}/).map(function(x){return x.trim()})
              .filter(function(x){return x.length>32});
 var vistos={},reps=[];
 frases.forEach(function(x){ if(vistos[x]&&reps.indexOf(x)<0)reps.push(x); vistos[x]=1 });
 chk(par[1]+': nenhuma frase sai duas vezes',reps.length===0,
     reps.slice(0,2).map(function(x){return '"'+x.slice(0,58)+'…"'}).join('  '));
});
S.session='artist';

console.log('── AS ROTAS ANTIGAS AINDA CHEGAM ──');
[['studio-checkin','studio'],['studio-events','studio-eventos'],
 ['studio-reviews','studio-reputacao'],['studio-historico','studio'],
 ['studio-quotes','studio-quotes'],['studio-caixa','studio']].forEach(function(par){
 var t=ir(par[0]);
 chk(par[0]+' → '+par[1],S.route===par[1] && t.length>1500,
     'foi para '+S.route+' com '+t.length+' caracteres');
});

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
/* Nomeando a sub-aba de propósito: a aba Hoje tem dois recortes, e um
   teste que não diz qual quer depende da ordem em que os outros
   rodaram — que é o tipo de teste que falha por motivo errado. */
var tv=ir('studio','hoje','visao');
chk('é um painel de números grandes',/class="grandes"/.test(tv)&&/class="grande/.test(tv));
var cartoes=(tv.match(/class="grande[ "]/g)||[]).length;
/* Nove, não dez: "Sobrou" saiu porque a seção Dinheiro está nesta
   mesma página dizendo o mesmo número. */
chk('nove números',cartoes===9,cartoes+' cartões');

/* ── A REGRA DO PAINEL ────────────────────────────────────────────
   O painel só guarda cartão que leva para FORA desta página. O que
   mora aqui se lê rolando.

   Sem essa regra, "Sobrou R$ 3.135" ficava no cartão e a seção
   Dinheiro repetia o mesmo número com as mesmas palavras, duzentos
   pixels abaixo — e cartão que repete o que está logo embaixo não
   resume nada, só faz a pessoa ler duas vezes e desconfiar de qual dos
   dois vale. */
var seg2=tv.indexOf('class="secgt"', tv.indexOf('class="secgt"')+5);
var abaixo=tv.slice(seg2>0?seg2:tv.length).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
var repetidos=[];
(tv.slice(0,seg2>0?seg2:tv.length).match(/class="grot">([^<]+)<[\s\S]{0,240}?class="gval">([^<]+)</g)||[])
 .forEach(function(bloco){
  var m=bloco.match(/class="grot">([^<]+)<[\s\S]*class="gval">([^<]+)</);
  if(!m)return;
  var rot=m[1].trim(), val=m[2].trim();
  /* O par rótulo+valor junto, não o valor solto: "2" e "5" aparecem em
     qualquer lugar de uma página de gestão, e compará-los sozinhos
     acusa tudo. Foi o erro da primeira versão desta verificação, que
     apontou oito repetições onde havia zero.

     O caso real era "Sobrou R$ 3.135" — rótulo e número lado a lado no
     cartão e de novo na seção. */
  var k=abaixo.indexOf(rot);
  if(k>=0 && abaixo.slice(k, k+rot.length+40).indexOf(val)>=0)repetidos.push(rot+' '+val);
 });
chk('nenhum cartão repete número que está logo abaixo',repetidos.length===0,
    repetidos.join('  |  '));

chk('agrupa por urgência',/Precisa de você/.test(tv)&&/Como vai o mês/.test(tv)&&/O que você construiu/.test(tv));
[['pedidos novos',/Pedidos novos/],['propostas sem retorno',/Propostas sem retorno/],
 ['avaliações a responder',/Avaliações a responder/],
 ['sessões marcadas',/Sessões marcadas/],['propostas que fecharam',/Propostas que fecharam/],
 ['pessoas tatuadas',/Pessoas tatuadas/],['estúdios',/Estúdios por onde passei/],
 ['obras à venda',/Obras à venda/],['avaliação',/>Avaliação</]].forEach(function(c){
 chk('resume '+c[0],c[1].test(tv));
});
/* O destino pode ser outra rota (go) ou uma seção da mesma página
   (irSecao). O que não pode é cartão sem destino nenhum. */
chk('todo cartão leva a algum lugar',
    (tv.match(/class="grande[^"]*" onclick="[^"]*(go\(|irSecao\()/g)||[]).length===cartoes,
    'algum cartão sem destino');
var tvl=tv.replace(/&#39;/g,"'");
chk('e leva à seção certa',/irSecao\('studio-quotes','orc','enviados'\)/.test(tvl),
    'o cartão de propostas sem retorno não aponta para a seção de enviados');
/* Cartão que aponta para uma seção inexistente rola para lugar nenhum,
   e a pessoa conclui que o número está errado.

   A primeira versão deste teste procurava irSecao() com destino
   inválido — e não podia falhar nunca: cartaoGrande() só emite
   irSecao quando a seção existe. Com valor errado ele cai no caminho
   antigo, go() + S.sub, e o clique não faz nada visível. É esse o
   sintoma que precisa ser procurado. */
var caiuNoAntigo=(tvl.match(/S\.sub\.([a-z]+)='([^']+)';go\('([^']+)'\)/g)||[]);
var orfaos=caiuNoAntigo.filter(function(x){
 var m=x.match(/S\.sub\.([a-z]+)='([^']+)';go\('([^']+)'\)/);
 return !!g.e("SECOES_DA_GESTAO['"+m[3]+"']");
});
chk('nenhum cartão aponta para seção que não existe',orfaos.length===0,
    'destino em página empilhada que não é seção: '+orfaos.join(' '));
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
/* A prévia dos últimos lançamentos existia para levar à outra
   sub-aba. Numa página só, a tabela completa está logo abaixo. */
chk('resumo não repete a lista que vem abaixo',!/Últimos lançamentos/.test(tc));
var tl=ir('studio-caixa');
chk('lançamentos: a tabela cheia',/<table class="t"/.test(tl));
chk('lançamentos: dá para lançar',/Lançar entrada/.test(tl));
chk('resumo e lançamentos convivem na mesma página',/De onde veio/.test(tl)&&/Lançar entrada/.test(tl));

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
console.log('── A GESTÃO NA INTERFACE #2 ──');
/* Vinte telas de gestão, e o que a pessoa faz nelas é ler número e
   comparar linha. Estas verificações protegem as duas coisas. */

/* Número que dança de largura entre repinturas parece instável, e num
   painel de dinheiro isso vira desconfiança. */
chk('o número do painel não dança de largura',
    /\.stat \.val\{[^}]*tabular-nums/.test(css));
chk('e nas tabelas também',/table\.t td\{[^}]*tabular-nums/.test(css));
chk('o número do painel acompanha a tela',
    /\.stat \.val\{font-size:clamp\(/.test(css),
    'voltou tamanho fixo — num painel a pessoa lê de longe');
/* Rótulo é etiqueta, não frase: expandida, caixa alta, pequena. */
chk('o rótulo do painel é etiqueta',
    /\.stat \.lbl\{font-family:var\(--f-exp\)/.test(css) &&
    /\.stat \.lbl\{[^}]*text-transform:uppercase/.test(css));

/* Numa tabela de vinte linhas o traço se repete vinte vezes. Traço
   forte repetido vinte vezes deixa de separar e vira grade. */
chk('a linha da tabela usa o traço mais claro',
    /table\.t td\{[^}]*border-bottom:var\(--hair\) solid var\(--rule\)/.test(css));
chk('e o cabeçalho, o mais forte',
    /table\.t th\{[\s\S]{0,220}border-bottom:var\(--hair\) solid var\(--border\)/.test(css),
    'sem contraste entre cabeçalho e linha a tabela vira bloco');

/* A barra mede proporção. Se um dia virar progresso de meta, contradiz
   o passaporte, que é a única decisão ética registrada do produto. */
chk('a barra é fina e arredondada',
    /\.bar\{height:4px[^}]*border-radius:var\(--r-pill\)/.test(css));
chk('e usa o acento, não o primário',
    /\.bar i\{[^}]*background:var\(--accent\)/.test(css));

/* Cartões de atalho: um traço, um raio, e o acento marcando o alvo. */
chk('o cartão de atalho tem traço fino',
    /\.grande\{[\s\S]{0,200}border:var\(--hair\) solid var\(--border\)/.test(css));
chk('e o raio do sistema',/\.grande\{[\s\S]{0,220}border-radius:var\(--r-sm\)/.test(css));
chk('o alvo se marca pelo acento',/\.grande:hover\{border-color:var\(--accent\)\}/.test(css));

/* Nenhum raio fora dos três declarados: é assim que a entropia entra —
   um 11px aqui, um 9px ali, e em três rodadas existem sete raios. */
var raiosSoltos = (css.match(/border-radius:\s*\d+px/g) || [])
  .filter(function (r) { return !/:\s*(0|1|2|3|4|50)px/.test(r) });
chk('nenhum raio inventado fora dos três do sistema',
    raiosSoltos.length === 0, raiosSoltos.slice(0, 8).join(', '));

console.log('══ '+f+' falha(s) ══');
process.exit(f?1:0);
