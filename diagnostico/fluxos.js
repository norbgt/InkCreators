const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','prototipo','index.html'),'utf8');
const dados=fs.readFileSync(require('path').join(__dirname,'..','prototipo','dados.js'),'utf8');

// Fluxos do produto: cada um com as etapas e o que sustenta cada etapa
const FLUXOS=[
{n:"Descobrir um tatuador",ator:"Visitante",etapas:[
 ["Abrir o catálogo","real","listarTatuadores + política de artistas publicados"],
 ["Filtrar por estilo, preço, nota","front","filtragem acontece no navegador, não no banco"],
 ["Ver o perfil completo","real","dados vêm de artists + profiles + portfolio_items"],
 ["Ver portfólio","real","portfolio_items, mas as imagens ainda são texturas geradas"],
 ["Ver avaliações","mock","não existe tabela de avaliações"]]},

{n:"Pedir um orçamento",ator:"Cliente",etapas:[
 ["Enviar imagens de referência","mock","buckets existem, a interface não envia"],
 ["IA analisar e sugerir faixa","mock","precisa de chave própria do provedor"],
 ["Gravar o pedido","real","criarPedidoDeOrcamento"],
 ["Convidar tatuadores compatíveis","real","matching por estilo e cidade"],
 ["Acompanhar respostas","real","meusOrcamentos"],
 ["Aceitar ou recusar proposta","parcial","política existe, função ainda não escrita"]]},

{n:"Virar tatuador e ser encontrado",ator:"Tatuador",etapas:[
 ["Escolher o papel no cadastro","real","gatilho handle_new_user grava em user_roles"],
 ["Passar pelo onboarding","real","wizard grava perfil, estilos e publicação"],
 ["Preencher perfil e estilos","real","salvarPerfilDeArtista, com verificação de papel"],
 ["Subir portfólio","real","envio para o bucket portfolio + registro em portfolio_items"],
 ["Definir tabela de preços","real","interface grava em artist_pricing"],
 ["Publicar","real","is_published controla a visibilidade pública"]]},

{n:"Responder a um orçamento",ator:"Tatuador",etapas:[
 ["Receber o pedido","real","orcamentosDoMeuEstudio"],
 ["Ver referências e análise","parcial","o pedido chega, mas sem imagens"],
 ["Enviar proposta com valor","real","responderOrcamento"],
 ["Combinar detalhes por chat","mock","não existe tabela de mensagens"],
 ["Agendar a sessão","mock","não existe tabela de agendamento"]]},

{n:"Comprar material ou arte",ator:"Ambos",etapas:[
 ["Navegar a loja","mock","nenhuma tabela"],
 ["Adicionar ao carrinho","mock","estado só no navegador"],
 ["Calcular frete","mock","valor fixo"],
 ["Pagar","mock","não existe integração de pagamento"]]},

{n:"Fazer curso ou ir a evento",ator:"Ambos",etapas:[
 ["Encontrar por proximidade","mock","mapa é simulado"],
 ["Filtrar e ordenar","front","funciona, sobre dados fictícios"],
 ["Inscrever-se","mock","nenhuma tabela"]]},

{n:"Assinar um plano",ator:"Tatuador",etapas:[
 ["Ver os planos","mock","só tela na landing"],
 ["Escolher e pagar","mock","nenhuma integração"],
 ["Ganhar os benefícios","mock","nenhum limite é aplicado hoje"]]}
];

const peso={real:1,parcial:.5,front:.5,mock:0};
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  DIAGNÓSTICO DE FLUXOS — o que atravessa ponta a ponta        ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

let totE=0,totR=0;
const resumo=[];
FLUXOS.forEach(f=>{
  const n=f.etapas.length;
  const s=f.etapas.reduce((a,e)=>a+peso[e[1]],0);
  const pct=Math.round(s/n*100);
  totE+=n; totR+=s;
  // um fluxo só "atravessa" se NENHUMA etapa for mock
  const quebra=f.etapas.findIndex(e=>e[1]==="mock");
  resumo.push({n:f.n,pct,quebra,etapa:quebra>=0?f.etapas[quebra][0]:null,ator:f.ator});
  console.log(`▸ ${f.n}  (${f.ator})   ${pct}% sustentado`);
  f.etapas.forEach((e,i)=>{
    const m={real:"█ real   ",parcial:"▓ parcial",front:"▒ só front",mock:"░ mock   "}[e[1]];
    const corte=(quebra>=0&&i===quebra)?"  ← quebra aqui":"";
    console.log(`   ${m}  ${e[0]}${corte}`);
    console.log(`              ${e[2]}`);
  });
  console.log();
});

console.log("─".repeat(64));
console.log(`COBERTURA GERAL: ${Math.round(totR/totE*100)}% das ${totE} etapas têm sustentação real\n`);
console.log("FLUXOS QUE ATRAVESSAM SEM QUEBRAR:");
const ok=resumo.filter(r=>r.quebra<0);
console.log(ok.length?ok.map(r=>"  ✓ "+r.n).join("\n"):"  nenhum");
console.log("\nONDE CADA FLUXO QUEBRA PRIMEIRO:");
resumo.filter(r=>r.quebra>=0).sort((a,b)=>b.pct-a.pct).forEach(r=>{
  console.log(`  ${String(r.pct).padStart(3)}%  ${r.n.padEnd(32)} → "${r.etapa}"`);
});
