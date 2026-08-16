/* ═══════════════════════════════════════════════════════════════════
   COMO O PROTÓTIPO SE ABRE

   Rode com:  node diagnostico/como-se-abre.js

   Este roteiro existe por causa de um erro que eu repeti três vezes:
   construir uma máquina para abrir o protótipo — servidor local,
   scripts de terminal, aplicativos — e a máquina quebrar. Cada versão
   dependia de alguma coisa fora do arquivo: uma porta livre, um
   processo vivo, uma permissão de automação do macOS.

   A regra que ficou: abrir o protótipo não pode depender de nada além
   de dois arquivos HTML e do navegador. Nada de servidor para subir,
   nada para parar depois, nenhuma permissão a conceder.

   O que este diagnóstico impede é a regressão — que eu, daqui a duas
   semanas, ache uma boa ideia trazer o servidor de volta.
   ═══════════════════════════════════════════════════════════════════ */

var fs = require("fs");
var path = require("path");
var RAIZ = path.join(__dirname, "..");

var f = 0;
function chk(n, c, d) { console.log((c ? "  ok  " : "  XX  ") + n + (d && !c ? " → " + d : "")); if (!c) f++; }
function secao(t) { console.log("\n── " + t + " " + "─".repeat(Math.max(0, 52 - t.length))); }

function existe(p) { return fs.existsSync(path.join(RAIZ, p)); }
function ler(p) { return fs.readFileSync(path.join(RAIZ, p), "utf8"); }

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  COMO O PROTÓTIPO SE ABRE                                    ║");
console.log("╚══════════════════════════════════════════════════════════════╝");

secao("OS DOIS ATALHOS EXISTEM");
chk("Abrir prototipo.html", existe("Abrir prototipo.html"));
chk("Verificar prototipo.html", existe("Verificar prototipo.html"));

if (existe("Abrir prototipo.html")) {
  var abrir = ler("Abrir prototipo.html");
  secao("ABRIR");
  chk("aponta para o protótipo", /prototipo\/index\.html/.test(abrir));
  chk("redireciona sozinho", /location\.replace/.test(abrir));
  chk("carrega com carimbo de tempo", /\?v=" \+ Date\.now\(\)/.test(abrir),
      "sem carimbo, o navegador serve a versão anterior");
  chk("tem link manual se o script falhar", /<a[^>]*id="manual"/.test(abrir));
  chk("não liga a coleta do teste", !/teste=1/.test(abrir));
}

if (existe("Verificar prototipo.html")) {
  var ver = ler("Verificar prototipo.html");
  secao("VERIFICAR");
  chk("aponta para o protótipo", /prototipo\/index\.html/.test(ver));
  chk("liga o painel de verificação", /verificar=1/.test(ver));
  chk("redireciona sozinho", /location\.replace/.test(ver));
  chk("carrega com carimbo de tempo", /Date\.now\(\)/.test(ver));
}

/* ── A máquina que quebrava três vezes ─────────────────────────────
   Cada item aqui já existiu e já falhou. Se algum voltar, este
   diagnóstico reclama antes de você descobrir clicando. */
secao("NADA DEPENDE DE SERVIDOR OU DE TERMINAL");
chk("sem servidor local", !existe("prototipo/servidor-local.py"),
    "voltou o servidor: porta ocupada e processo órfão voltam junto");
chk("sem aplicativos .app", !existe("Abrir Ink Creators.app") && !existe("Parar Ink Creators.app"),
    "aplicativo sem assinatura depende do Gatekeeper deixar");
chk("sem scripts de abrir/parar", !existe("bin/prototipo.sh") && !existe("bin/atalhos-terminal"),
    ".command abre janela de Terminal, e fechá-la exige permissão de automação");
chk("nada para parar depois", !existe("parar-prototipo.command"));

/* ENVIAR-E-TESTAR continua sendo .command de propósito: ele imprime os
   links no fim, e essa janela existe para ser lida. */
chk("publicar continua pelo terminal, de propósito", existe("ENVIAR-E-TESTAR.command"));

secao("O PROTÓTIPO NÃO DEPENDE DE HTTP PARA MONTAR");
var idx = ler("prototipo/index.html");
chk("os três arquivos vizinhos são carregados",
    /dados\.js/.test(idx) && /teste\.js/.test(idx) && /verificar\.js/.test(idx));
chk("carregados em ordem, antes do load", /document\.write\(/.test(idx),
    "createElement assíncrono quebraria a ordem que verificar.js espera");
chk("o carimbo sai de cena quando é arquivo local",
    /location\.protocol==="file:" \? "" :/.test(idx),
    "alguns navegadores não acham arquivo com interrogação no nome");
chk("nenhum script exige módulo ES na montagem",
    !/<script[^>]*type="module"/.test(idx),
    "módulo não carrega de file://");
chk("a tela do banco explica o que é aberto como arquivo",
    /location\.protocol==="file:"/.test(idx) && /dados fictícios/.test(idx));

secao("A DOCUMENTAÇÃO ACOMPANHA");
var doc = ler("COMO-ABRIR.md");
chk("COMO-ABRIR fala dos dois arquivos",
    /Abrir prototipo\.html/.test(doc) && /Verificar prototipo\.html/.test(doc));
chk("e não manda mais clicar em aplicativo ou .command",
    !/Ink Creators\.app/.test(doc) && !/abrir-prototipo\.command/.test(doc));

/* ── O QUE O SCRIPT DE PUBLICAR DIZ ──────────────────────────────
   Duas coisas envelheceram nele e mentiram no dia 16/08/2026.

   A primeira foi uma lista escrita à mão de trechos que "precisavam
   estar no ar". Todas as marcas eram de rodadas antigas, então estavam
   presentes na versão velha — e o script disse "✓ o site já tem o
   cadastro novo" enquanto o Pages ainda servia um arquivo de 265 KB
   contra 410 KB no disco.

   A segunda foi a mensagem final, que continuava pedindo para criar a
   conta de admin e avisar o e-mail. O papel já estava concedido desde
   27/07, e ela leu o pedido três vezes.

   As duas falhas têm a mesma origem: texto e listas escritas à mão
   dentro de um script que ninguém revisa. */
console.log("\n── O SCRIPT DE PUBLICAR NÃO ENVELHECE ───────────────────");
var pub = existe("ENVIAR-E-TESTAR.command") ? ler("ENVIAR-E-TESTAR.command") : "";
chk("compara tamanho, não lista de trechos",
    /BD=\$\(wc -c < prototipo\/index\.html/.test(pub) && /\[ "\$BD" = "\$BP" \]/.test(pub),
    "sem comparação de bytes na espera");
chk("não mantém lista de marcas à mão", !/MARCAS=\(/.test(pub),
    "voltou a lista escrita à mão, que envelhece por construção");
chk("não pede mais a conta de admin", !/dar o papel|me avise qual e-mail|me dizer o e-mail/i.test(pub),
    "o script voltou a pedir algo que já foi feito");
chk("diz qual é a conta de admin", /theinkcreatorsapp@gmail\.com/.test(pub));

/* ── O PAINEL DE ESTADO ──────────────────────────────────────────
   A lista de pendências vivia em quatro documentos e nas mensagens.
   Documento envelhece; medição, não. O ONDE-ESTOU.command pergunta ao
   git, ao disco e ao banco — e por isso nunca fica desatualizado.

   O que este teste protege é justamente essa propriedade: se alguém
   escrever a lista à mão dentro dele, ele volta a envelhecer. */
console.log("\n── O PAINEL DE ESTADO NÃO ENVELHECE ─────────────────────");
chk("ONDE-ESTOU.command existe", existe("ONDE-ESTOU.command"));
if (existe("ONDE-ESTOU.command")) {
  var oe = ler("ONDE-ESTOU.command");
  chk("mede commits pendentes no git", /git log --oneline origin\/main\.\.HEAD/.test(oe));
  chk("mede se o banco responde", /supabase\.co\/rest\/v1\/tattoo_styles/.test(oe));
  chk("mede se o backup existe", /backups\/\*\/InkCreators-\*\.zip/.test(oe));
  chk("roda os diagnósticos de verdade", /for d in diagnostico\/\*\.js/.test(oe));
  chk("aponta o próximo passo", /\?teste=1/.test(oe));
  chk("explica o que NÃO é urgente e por quê",
      /não cria conta nenhuma/.test(oe) && /Vence antes do piloto/.test(oe),
      "sem isso a pessoa sente que está devendo o que não deve");
}

/* ── O ÚLTIMO PASSO TEM PORTA ────────────────────────────────────
   Todo o resto do projeto existe para chegar aqui: pôr o protótipo na
   mão de gente. Se esse passo depender de lembrar de um link, de achar
   uma mensagem em conversa antiga e de contar convidados de cabeça,
   ele não acontece. */
console.log("\n── O TESTE TEM PORTA DE ENTRADA ─────────────────────────");
chk("RODAR-O-TESTE.command existe", existe("RODAR-O-TESTE.command"));
chk("a lista de convidados existe", existe("teste/convidados.md"));
if (existe("RODAR-O-TESTE.command")) {
  var rt = ler("RODAR-O-TESTE.command");
  chk("confere se o link está no ar antes de convidar", /norbgt\.github\.io.*index\.html/.test(rt));
  chk("entrega a mensagem pronta para os dois públicos",
      /para tatuador/.test(rt) && /para cliente/.test(rt));
  chk("copia para a área de transferência", /pbcopy/.test(rt));
  chk("conta quantos faltam", /grep -c '\^- \\\[x\\\]'/.test(rt));
  /* A mensagem não pode explicar o produto: o que se quer descobrir é o
     que a pessoa entende sozinha, e explicar antes apaga isso. */
  chk("não explica o produto na mensagem", /Não explique o produto/.test(rt));
  chk("diz o critério para seguir", /60%/.test(rt) && /sem indução/.test(rt));
  chk("e que a conversa vale mais que o gráfico",
      /Cinco conversas de 15 minutos/.test(rt));
  chk("não promete ler o painel sem login",
      /só admin lê a tabela de sessões/.test(rt),
      "sem essa nota, a limitação parece defeito em vez de política");
}

console.log("\n══ " + f + " falha(s) ══");
process.exit(f ? 1 : 0);
