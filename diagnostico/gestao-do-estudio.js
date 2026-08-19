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
/* Seis, e seis é o teto que ela mesma pôs. Financeiro nasceu porque
   dinheiro é pergunta inteira, não pedaço da primeira tela. */
chk('exatamente seis abas na barra',g.e("ST_NAV.length")===6,g.e("ST_NAV.length")+' abas');
chk('e não passam do teto de seis',g.e("ST_NAV.length")<=6);
chk('e são estas',
    g.e("ST_NAV.map(function(x){return x[1]}).join('·')")==='Visão geral·Orçamentos·Agenda·Financeiro·Reputação·Cursos e eventos',
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

console.log('── A MONTAGEM TEM REDE ──');
/* montandoSecoes cala as barras internas enquanto a página é montada.
   Se ela ficar levantada porque uma tela estourou, as barras somem do
   produto INTEIRO — um erro numa aba apaga a navegação de todas. */
chk('a bandeira de montagem sempre volta',/finally\{ montandoSecoes=false \}/.test(code),
    'sem finally, um erro numa tela apaga as barras internas de todas');
/* Recorte por marcador é frouxo: ele devolve a página inteira em vez
   de lixo se o marcador mudar. */
chk('a montagem cai de pé se o marcador mudar',/if\(i<0\)\{ S\.sub=JSON\.parse\(guardado\); return render1\(rota\) \}/.test(code));
chk('e existe uma função só para preâmbulo de página',/function naPrimeiraSecao/.test(code));

console.log('── UMA SEÇÃO POR VEZ, COM TOGGLE ──');
/* Antes as seções vinham empilhadas. O argumento era bom — num painel
   de gestão rolar é mais barato que esconder — e se sustenta com duas
   ou três. Com sete, a Visão geral virava uma parede de dois metros e
   o custo de rolar passou a ser maior que o de um clique.

   O toggle diz QUANTAS partes a aba tem, que é o que a rolagem
   escondia: você só descobria o fim chegando nele. */
/* Reputação caiu de 3 para 2 quando 'Desempenho por estilo' saiu a
   pedido dela — decisão 032. */
/* studio saiu da lista: a Visão geral ficou sem seções, e trilho de
   uma peça só é um botão que não leva a lugar nenhum. Agenda foi de 2
   para 3 e Financeiro nasceu com 2. */
var ESPERADO={'studio-schedule':3,'studio-financeiro':2,'studio-reputacao':2,'studio-eventos':2};
chk('a Visão geral não tem toggle',!g.e("SECOES_DA_GESTAO['studio']"),
    'voltou a ter seções: trilho de uma peça é botão que não leva a lugar nenhum');
chk('e mesmo assim ela abre cheia',ir('studio').length>2000);
Object.keys(ESPERADO).forEach(function(rota){
 var t=ir(rota);
 var pecas=(t.match(/class="seg [^"]*"/g)||[]).length;
 chk(rota+': '+ESPERADO[rota]+' peças no toggle',pecas===ESPERADO[rota],pecas+' peças');
 chk(rota+': uma seção por vez',!/class="secgt"/.test(t),
     'as seções voltaram a empilhar e a página virou parede');
 chk(rota+': o toggle marca onde você está',/class="seg on"/.test(t));
});

/* Escolha guardada que não é mais seção — porque a arquitetura mudou —
   tem de cair na primeira, não em tela vazia. */
S.sub=S.sub||{}; S.sub.fin='rota-que-nao-existe-mais';
var tsalvo=ir('studio-financeiro');
chk('escolha antiga inválida cai na primeira seção',
    /class="seg on"[\s\S]{0,160}?>Dinheiro</.test(tsalvo)&&tsalvo.length>2000,
    'ficou em tela vazia com o toggle sem nada marcado');

/* A escolha PERSISTE de propósito: quem estava em Lançamentos e sai
   espera voltar em Lançamentos. Empilhado isso não existia. */
S.sub.fin='lancamentos'; ir('studio-financeiro');
chk('a escolha sobrevive à navegação',(S.sub||{}).fin==='lancamentos');
S.sub.fin='dinheiro';

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

console.log('── ORÇAMENTOS CONTINUA COM ALTERNADOR ──');
/* A exceção à regra da página que rola, e ela tem motivo escrito.
   Sem este teste, alguém "corrige" a inconsistência e devolve o fluxo
   de três passos para o meio de uma rolagem. */
var tq=ir('studio-quotes');
chk('tem alternador entre recebidos e enviados',/class="segmento"/.test(tq)&&segs(tq)===2,
    segs(tq)+' opções');
chk('e não vira página empilhada',!/class="secgt"/.test(tq),
    'os dois viraram seções e o fluxo de três passos foi parar no meio de uma rolagem');
/* Zerando a escolha antes de medir: o padrão só se observa em quem
   nunca escolheu, e um teste anterior pode ter deixado 'enviados'. */
S.sub=S.sub||{}; delete S.sub.orc;
var tq0=ir('studio-quotes');
var ativa=(tq0.match(/class="seg on"[\s\S]{0,150}?>([^<]+)</)||[])[1];
chk('recebidos é o padrão',/Recebidos/.test(ativa||''),
    'abre em '+(ativa||'nada')+', e quem chega quer ver quem está pedindo');

console.log('── OS QUATRO FLUXOS DA AGENDA ──');
/* Conectar o Google é uma OPÇÃO. Quem não conecta monta a agenda à mão
   e ela funciona igual — só não sabe do que acontece fora daqui.

   Estes quatro fluxos são a prova disso, e o quarto é o que costuma
   quebrar: desconectar tem de tirar o que veio de lá e SÓ isso. */
g.e("S.agendaGoogle=false");

/* 1. Sem Google, a agenda serve. */
S.diaSel=Number(g.e("BOOK[0].d"));
var f1=ir('studio-schedule','ag','agendado');
chk('1. sem Google, a sessão daqui aparece no dia',/Gerar QR/.test(f1));
S.diaSel=25;
var f1b=ir('studio-schedule','ag','agendado');
chk('   e o bloqueio escrito à mão também',/Almoço com fornecedor/.test(f1b));
chk('   sem nenhum item vindo de fora',!/dermatologista/.test(f1b));

/* 2. Escrever à mão, sem Google nenhum. */
var antesM=g.e("MANUAL.length");
S.diaSel=15; g.e("bloquearHorario()");
chk('2. bloquear à mão cria o item no dia escolhido',
    g.e("MANUAL.length")===antesM+1 && g.e("MANUAL[MANUAL.length-1].dia")===15);
var f2=ir('studio-schedule','ag','agendado');
/* Não basta existir marca de origem: ela tem de ser a DESTE item. Com
   a origem fixada em "ink", tudo continuava marcado e nada acusava —
   o teste media presença quando o que importa é correspondência. */
function marcaDe(tela,titulo){
  var i=tela.indexOf(titulo); if(i<0)return null;
  var antes=tela.slice(Math.max(0,i-260),i);
  var m=antes.match(/class="pt (ink|google|manual)"[^>]*><\/i>\s*<div[^>]*>\s*<div class="b small">$/);
  if(m)return m[1];
  var todas=antes.match(/class="pt (ink|google|manual)"/g)||[];
  return todas.length ? todas[todas.length-1].match(/(ink|google|manual)/)[1] : null;
}
chk('   e ele aparece marcado como SEU, não como sessão',
    /Horário bloqueado/.test(f2) && marcaDe(f2,'Horário bloqueado')==='manual',
    'marcado como '+marcaDe(f2,'Horário bloqueado'));
g.e("apagarManual('m"+g.e("MANUAL.length")+"')");

/* 3. Conectar acrescenta uma origem, não substitui as outras. */
g.e("conectarGoogleAgenda()"); tempos.forEach(function(fn){fn()});
g.e("escolherCalendarioGoogle('ink')");
S.diaSel=21; var f3=ir('studio-schedule','ag','agendado');
chk('3. conectado, o compromisso de fora entra no calendário',/dermatologista/.test(f3));
chk('   marcado como vindo de fora',marcaDe(f3,'dermatologista')==='google',
    'marcado como '+marcaDe(f3,'dermatologista'));
S.diaSel=25; var f3b=ir('studio-schedule','ag','agendado');
chk('   e o bloqueio à mão continua onde estava',/Almoço com fornecedor/.test(f3b));
S.diaSel=Number(g.e("BOOK[0].d")); 
chk('   e a sessão daqui também',/Gerar QR/.test(ir('studio-schedule','ag','agendado')));

/* 4. Desconectar tira o que veio de lá, e nada mais. É aqui que uma
      implementação descuidada apaga a agenda inteira. */
g.e("S.agendaGoogle=false");
S.diaSel=21; var f4=ir('studio-schedule','ag','agendado');
chk('4. desconectado, o compromisso de fora some',!/dermatologista/.test(f4));
S.diaSel=25;
chk('   o bloqueio à mão fica',/Almoço com fornecedor/.test(ir('studio-schedule','ag','agendado')));
S.diaSel=Number(g.e("BOOK[0].d"));
chk('   a sessão daqui fica',/Gerar QR/.test(ir('studio-schedule','ag','agendado')));
S.diaSel=null;
chk('   e a legenda passa a contar zero de fora',
    /Da sua agenda <b>0<\/b>/.test(ir('studio-schedule','ag','agendado')),
    'a contagem não acompanhou a desconexão');

console.log('── NENHUMA TELA ABRE VAZIA COM ESTADO VELHO ──');
/* O defeito que ela viu no navegador e nenhum roteiro meu via.

   A Visão geral abria VAZIA — cabeçalho, abas, rodapé, e nada no meio.
   Porque quem já tinha usado o produto tinha vg:"dinheiro" gravado, a
   chave "vg" morreu com as seções da Visão geral, e a condição do
   painel exigia vg==="visao".

   Meus roteiros nunca pegaram isso porque TODOS começam com S.sub={} —
   estado limpo, que é exatamente o estado que ninguém real tem. Testar
   sempre do zero é testar o primeiro minuto de um produto e nunca o
   segundo dia.

   Aqui o estado é envenenado de propósito: chaves de arquiteturas
   passadas, valores de seções que já não existem. Nenhuma tela pode
   abrir vazia por causa disso. */
var VENENO={vg:"dinheiro",ck:"agora",hoje:"visao",ag:"mes",rep:"desempenho",
            fin:"pessoas",mev:"nada",cx:"pessoas",orc:"inexistente",ev:"sumiu"};
var ROTAS_POR_PAPEL=[
 ["artist",["studio","studio-quotes","studio-schedule","studio-financeiro",
            "studio-reputacao","studio-eventos","studio-profile"]],
 ["client",["me","me-passaporte","me-formacao"]],
 ["forn",  ["forn","forn-recomendacoes","forn-embaixadores","forn-loja","forn-perfil"]]
];
var vazias=[];
ROTAS_POR_PAPEL.forEach(function(par){
 par[1].forEach(function(rota){
  S.session=par[0]; S.sub=JSON.parse(JSON.stringify(VENENO)); S.route=rota;
  var miolo="";
  try{ g.e("render()"); miolo=(tela().split("<main>")[1]||"") }catch(e){ miolo="" }
  if(miolo.length<1200)vazias.push(par[0]+"/"+rota+" ("+miolo.length+")");
 });
});
chk('nenhuma tela abre vazia com sub-aba de arquitetura antiga',vazias.length===0,
    'abriram só com casca: '+vazias.join(', '));
S.session='artist'; S.sub={};

/* A segunda defesa: o que ficou gravado é limpo ao carregar. A
   primeira já basta para a tela não quebrar; esta impede que a pessoa
   volte, dia após dia, para uma escolha que aponta para o nada. */
var sujo=g.e("limparSubAntigo({vg:'dinheiro',ck:'agora',hoje:'visao',ag:'mes',rep:'avaliacoes'})");
chk('chave de seção aposentada é descartada',
    !('vg' in sujo)&&!('ck' in sujo)&&!('hoje' in sujo),
    'sobrou: '+Object.keys(sujo).join(', '));
chk('valor que não é mais seção também',!('ag' in sujo),
    "ag continuou em 'mes', que deixou de existir");
chk('e a escolha ainda válida fica',sujo.rep==='avaliacoes',
    'a limpeza levou junto a escolha boa de quem já usava');

console.log('── AS ROTAS ANTIGAS AINDA CHEGAM ──');
/* studio-checkin apontava para ["studio","vg","checkin"] e as duas
   metades do destino tinham morrido: a chave vg sumiu com as seções da
   Visão geral, e "checkin" deixou de ser seção quando o QR passou a
   abrir dentro da linha da sessão. Quem entrasse pela rota antiga caía
   numa tela de corpo vazio.

   Este teste passava — ele conferia que a rota chegava em "studio",
   que era o destino ERRADO escrito na tradução. Media a promessa
   contra ela mesma. O piso de 1500 caracteres deveria ter pegado, e
   não pegou porque o cabeçalho sozinho já passa de 2800. */
[['studio-checkin','studio-schedule'],['studio-events','studio-eventos'],
 ['studio-reviews','studio-reputacao'],['studio-historico','studio-schedule'],
 ['studio-quotes','studio-quotes'],['studio-caixa','studio-financeiro']].forEach(function(par){
 var t=ir(par[0]);
 /* Mede o MIOLO, não a página. O cabeçalho de navegação sozinho já
    passa de 2800 caracteres, então um piso sobre a página inteira
    aprova uma tela sem conteúdo nenhum. */
 var miolo=(t.split("<main>")[1]||"");
 chk(par[0]+' → '+par[1],S.route===par[1] && miolo.length>1200,
     'foi para '+S.route+' com '+miolo.length+' caracteres de miolo');
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
var ta=ir('studio-schedule','ag','agendado');
chk('existe a aba de conexões',/Google Agenda/.test(ta));
/* "opcional" em vez de "não conectada": a etiqueta diz que a agenda
   funciona sem isto, em vez de sugerir que falta algo. */
chk('o Google se anuncia como opcional',/>opcional</.test(ta)&&/A agenda funciona sem isto/.test(ta));
chk('diz o que pede de permissão',/O que pedimos/.test(ta)&&/Nada de e-mail/.test(ta));
chk('diz o que faz com isso',/calendário separado/.test(ta));
chk('e como desfazer',/desconectar leva tudo embora/.test(ta));
chk('oferece conectar',/conectarGoogleAgenda/.test(ta));
g.e("conectarGoogleAgenda()");
chk('mostra que está conectando',S.googleConectando===true);
tempos.forEach(function(fn){fn()});
/* Conectar não é mais um passo só: o Google devolve o consentimento e
   aí vem a pergunta que dá medo — em qual calendário isso cai. */
chk('depois de autorizar, pergunta o calendário',S.googleEscolhendo===true&&S.agendaGoogle!==true,
    'conectou sem perguntar onde as sessões vão cair');
g.e("escolherCalendarioGoogle('ink')");
chk('conecta',S.agendaGoogle===true);
chk('e no calendário separado',S.googleCalendario==='ink');
var ta2=ir('studio-schedule','ag','agendado');
chk('conectada: mostra a conta',/conectada/.test(ta2)&&/gmail\.com/.test(ta2));
chk('conectada: diz o que sincroniza',/Sessões confirmadas/.test(ta2)&&/Compromissos do Google/.test(ta2));
chk('conectada: e o que NÃO sincroniza',/ficam só aqui/.test(ta2));
chk('conectada: dá para desconectar',/Desconectar/.test(ta2));
/* O Google mora colado ao calendário: é ele que enche esse calendário
   com o que acontece fora daqui. */
var tm=ir('studio-schedule','ag','agendado');
/* O calendário é o centro e não depende do Google: quem nunca conectou
   monta a agenda à mão e ela serve igual. O Google ACRESCENTA uma
   origem — por isso cada item diz de onde veio. */
chk('o calendário tem as três origens na legenda',
    /Sessões daqui/.test(tm)&&/Da sua agenda/.test(tm)&&/Bloqueios seus/.test(tm));
chk('e dá para bloquear um horário à mão',/bloquearHorario\(\)/.test(tm),
    'sem Google, a pessoa não consegue montar a própria agenda');
/* Só aparece com um dia aberto — o botão mora na linha do
   compromisso, não numa lista à parte. */
S.diaSel=21; var tdia=ir('studio-schedule','ag','agendado');
chk('o dia se abre com o compromisso do Google',/dermatologista/.test(tdia));
chk('e ele pode bloquear ou não',/alternarBloqueio\(/.test(tdia)&&/bloqueia/.test(tdia));
/* Bloquear é decisão dele, não do Google: aniversário não fecha a
   agenda, voo fecha. */
S.diaSel=26; var tdia2=ir('studio-schedule','ag','agendado');
chk('aniversário não bloqueia por padrão',/não bloqueia/.test(tdia2));
S.diaSel=null;
chk('e dá para puxar sob demanda',/Puxar agora/.test(tm),
    'sem isso, quem marcou algo no Google agora mesmo espera o relógio');
chk('o título do Google nunca vaza para quem marca',
    /O título nunca aparece para quem tenta marcar/.test(tm));
chk('desconectar tira só o que veio de lá',
    /Desconectar tira do calendário só o que veio de lá/.test(tm));
/* Agora o calendário vem primeiro: ele funciona sem o Google, e pôr a
   conexão antes faria parecer pré-requisito. */
/* Os dois têm de EXISTIR antes de comparar posição: com a classe
   ausente, indexOf devolve -1 e "-1 < qualquer coisa" faz o teste
   passar sozinho. Foi o que a sabotagem mostrou. */
var iCal=tm.indexOf('class="calmes"'), iG=tm.indexOf('Google Agenda');
chk('o calendário vem antes do Google', iCal>=0 && iG>=0 && iCal<iG,
    iCal<0 ? 'não há calendário na seção' : iG<0 ? 'não há bloco do Google' :
    'a conexão voltou a parecer pré-requisito de uma agenda que funciona sem ela');
chk('o calendário tem 28 dias',(tm.match(/class="caldia/g)||[]).length===28,
    (tm.match(/class="caldia/g)||[]).length+' células');
/* Ponto por origem: é o que permite desconectar o Google sem que a
   pessoa fique sem saber o que sumiu. */
chk('cada dia mostra de onde vêm seus compromissos',/class="pt ink"/.test(tm));
chk('e o dia se abre ao toque',/escolherDia\(/.test(tm));
/* A ordem mudou por pedido dela, e inverteu a de antes: agendado
   primeiro, quem eu tatuei no meio, próximas sessões no fim.

   A agenda passou a responder três perguntas em vez de duas — o que
   está marcado, quem já sentou, quem vai sentar. Registro a inversão
   porque a ordem anterior também tinha sido pedida, e uma decisão que
   troca de sinal sem registro vira "sempre foi assim". */
var ordemAg = g.e("SECOES_DA_GESTAO['studio-schedule'].map(function(x){return x[1]}).join(',')");
chk('a agenda tem as três peças, nesta ordem',ordemAg==='agendado,pessoas,sessoes',ordemAg);
chk('a célula do dia respeita o dedo',/@media\(pointer:coarse\)\{\.caldia\{min-height:44px\}\}/.test(css));
/* Conexão com serviço de terceiro falha. Protótipo que só acerta dá um
   teste otimista de graça. */
g.e("S.agendaGoogle=false;S.googleSimularErro=true");
g.e("conectarGoogleAgenda()");tempos.forEach(function(fn){fn()});
chk('recusar no Google não conecta',S.agendaGoogle===false&&!!S.googleErroGoogle);
chk('e a tela diz o que houve',/fechou a janela do Google/.test(ir('studio-schedule','ag','agendado')));
g.e("S.googleSimularErro=false;S.googleErroGoogle=null;S.agendaGoogle=true");
S.agendaGoogle=false;
chk('sem conexão, sem aviso',!/Sincronizada com o Google/.test(ir('studio-schedule','ag','agendado')));

console.log('── VISÃO GERAL: UM PAINEL SÓ ──');
/* Nomeando a sub-aba de propósito: a aba Hoje tem dois recortes, e um
   teste que não diz qual quer depende da ordem em que os outros
   rodaram — que é o tipo de teste que falha por motivo errado. */
var tv=ir('studio','vg','visao');
chk('é um painel de números grandes',/class="grandes"/.test(tv)&&/class="grande/.test(tv));
var cartoes=(tv.match(/class="grande[ "]/g)||[]).length;
/* Doze, e três deles são dinheiro.

   Foram nove por um tempo: "Sobrou", "Entrou" e "Saiu" tinham saído
   porque a seção Dinheiro estava NESTA página, uma rolagem abaixo,
   dizendo o mesmo número. Quando Dinheiro virou a aba Financeiro, a
   justificativa morreu — e o cartão não voltou sozinho. O painel ficou
   com nove números e nenhum era dinheiro.

   Por isso este teste deixou de contar só o total: ele exige que o
   dinheiro esteja aqui. Número solto envelhece; a regra, não. */
chk('treze números',cartoes===13,cartoes+' cartões');

/* ── O PAINEL CONSOLIDA O TODO ─────────────────────────────────────
   A regra que faltava, e que teria pego este defeito no dia em que ele
   nasceu: TODA aba da barra precisa de pelo menos um número no painel.

   Financeiro nasceu na decisão 033 e o painel não ganhou nenhum cartão
   para ela — nove números e nenhum era dinheiro. Nada acusou, porque
   os testes olhavam para o que ESTÁ no painel e nunca para o que
   deveria estar.

   Aba sem número no painel é aba que a pessoa esquece que tem. */
/* Só os cartões, e não a página: a barra de navegação repete o nome
   de todas as abas em go('...'), e uma varredura da tela inteira
   encontraria todas elas sempre — teste que nunca falha. */
var alvos=(tv.match(/<button class="grande[^>]*onclick="[^"]*"/g)||[])
  .map(function(b){
    var m=b.match(/(?:irSecao|go)\('([a-z-]+)'/);
    return m?m[1]:"";
  }).filter(Boolean);
var traduz=g.e("ST_ROTA_ANTIGA");
alvos=alvos.map(function(r){return traduz[r]?traduz[r][0]:r});
var semNumero=g.e("ST_NAV.map(function(x){return x[0]})")
  .filter(function(r){return r!=='studio'&&alvos.indexOf(r)<0});
chk('toda aba tem pelo menos um número no painel',semNumero.length===0,
    'sem número nenhum: '+semNumero.join(', ')+' — aba sem número é aba que a pessoa esquece que tem');
var comDinheiro=(tv.match(/class="grot">(Sobrou em julho|Entrou|Saiu)</g)||[]).length;
chk('e três deles são dinheiro',comDinheiro===3,
    comDinheiro+' de 3 — quem trabalha por conta própria abre a gestão para ver isto');
chk('sobrou vem antes de entrou e saiu',
    tv.indexOf('Sobrou em julho')<tv.indexOf('>Entrou<'),
    'entrou e saiu são o caminho; sobrou é a resposta');

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
/* Orçamentos é outra página, então o cartão navega em vez de rolar. */
chk('e leva ao recorte certo',/S\.sub\.orc='enviados';go\('studio-quotes'\)/.test(tvl),
    'o cartão de propostas sem retorno não abre Enviados');
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
/* Com o toggle, Lançamentos é outra vista — e a prévia volta a ser o
   que sempre foi: uma ponte para ela. Empilhado ela era a mesma lista
   duas vezes, e por isso tinha saído. */
chk('o resumo faz ponte para os lançamentos',/Últimos lançamentos/.test(tc)&&/Ver todos/.test(tc));
var tl=ir('studio-financeiro','fin','lancamentos');
chk('lançamentos: a tabela cheia',/<table class="t"/.test(tl));
chk('lançamentos: dá para lançar',/Lançar entrada/.test(tl));
/* Cada um na sua vista: o resumo explica de onde veio o dinheiro, a
   tabela deixa lançar. Se os dois aparecessem juntos, a prévia acima
   voltaria a ser repetição. */
chk('lançamentos não repete o resumo',!/De onde veio/.test(tl)&&/Lançar entrada/.test(tl));

console.log('── EVENTOS ──');
var tev=ir('studio-eventos','ev','meus');
chk('meus: os que ele criou',/Seus eventos e cursos/.test(tev)&&/publicado/.test(tev));
chk('meus: liga ao caixa',/entra no caixa/.test(tev));
var tep=ir('studio-eventos','ev','participo');
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
