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

console.log("\n══ " + f + " falha(s) ══");
process.exit(f ? 1 : 0);
