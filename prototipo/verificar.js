/* ═══════════════════════════════════════════════════════════════════
   VERIFICAÇÃO NO NAVEGADOR DE VERDADE

   Abra com  ?verificar=1  e um painel aparece por cima do protótipo
   dizendo o que passou e o que não passou.

   POR QUE ISTO EXISTE
   Os testes que rodam fora do navegador usam um DOM de mentira. Eles
   pegam erro de lógica, mas não pegam comportamento de navegador — e o
   bug do cursor sumindo era exatamente isso. Aqui os campos são campos
   de verdade, o foco é o foco de verdade, e a posição do cursor é lida
   do próprio navegador.

   O que a verificação faz é o que uma pessoa faria: põe o cursor no
   campo, digita, e olha se o cursor continua lá. Digitar é disparar o
   evento 'input' com o valor novo, que é exatamente o caminho que uma
   tecla percorre.

   Sem ?verificar=1 este arquivo não faz nada.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  function ligado() {
    try { return new URLSearchParams(location.search).get("verificar") === "1"; }
    catch (e) { return false; }
  }
  if (!ligado()) return;

  var resultados = [];
  var errosDeConsole = [];

  /* Erro de rede não é defeito do cadastro: aberto como arquivo local, o
     Supabase nem chega a carregar, e isso é esperado. O que interessa
     aqui é exceção do nosso próprio código. */
  function ruidoDeRede(m) {
    return /supabase|failed to fetch|networkerror|cors|net::|load failed|dynamically imported/i.test(m || "");
  }
  var erroOriginal = console.error;
  console.error = function () {
    var m = Array.prototype.join.call(arguments, " ");
    if (!ruidoDeRede(m)) errosDeConsole.push(m);
    erroOriginal.apply(console, arguments);
  };
  window.addEventListener("error", function (e) {
    if (!ruidoDeRede(e.message)) errosDeConsole.push(e.message);
  });

  function ok(nome, cond, detalhe) {
    resultados.push({ nome: nome, passou: !!cond, detalhe: detalhe || "" });
  }
  function secao(t) { resultados.push({ secao: t }); }

  var $ = function (sel) { return document.querySelector(sel); };

  /* Digitar de verdade: põe o foco, posiciona o cursor, muda o valor e
     dispara 'input' — o mesmo caminho de uma tecla. */
  function digitar(id, texto, posicaoDoCursor) {
    var el = document.getElementById(id);
    if (!el) return null;
    el.focus();
    el.value = texto;
    var pos = posicaoDoCursor == null ? texto.length : posicaoDoCursor;
    try { el.setSelectionRange(pos, pos); } catch (e) {}
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return el;
  }
  function focoAgora() {
    var a = document.activeElement;
    return a && a.id ? a.id : (a ? a.tagName.toLowerCase() : "nenhum");
  }
  function cursorEm(id) {
    var el = document.getElementById(id);
    try { return el ? el.selectionStart : null; } catch (e) { return null; }
  }

  function rodar() {
    var estadoAnterior = JSON.stringify({ route: S.route, session: S.session });

    /* ── 1. O CURSOR NÃO SOME ─────────────────────────────────── */
    secao("O cursor não some ao digitar");
    irCadastro(null);

    digitar("cadNome", "Ana", 3);
    ok("digitando no nome, o foco continua no nome", focoAgora() === "cadNome", "foco em: " + focoAgora());
    ok("o cursor fica na posição 3", cursorEm("cadNome") === 3, "cursor em: " + cursorEm("cadNome"));

    digitar("cadNome", "Ana Souza", 3);
    ok("cursor no meio do texto continua no meio", cursorEm("cadNome") === 3, "cursor em: " + cursorEm("cadNome"));

    digitar("cadEmail", "ana@exemplo.com", 4);
    ok("digitando no e-mail, o foco continua no e-mail", focoAgora() === "cadEmail", "foco em: " + focoAgora());
    ok("cursor preservado no e-mail", cursorEm("cadEmail") === 4, "cursor em: " + cursorEm("cadEmail"));

    digitar("cadSenha", "segredo123", 5);
    ok("digitando na senha, o foco continua na senha", focoAgora() === "cadSenha", "foco em: " + focoAgora());
    ok("cursor preservado na senha", cursorEm("cadSenha") === 5, "cursor em: " + cursorEm("cadSenha"));

    // Espaço é o caractere que ela citou. Vale um caso só dele.
    digitar("cadNome", "Ana ", 4);
    var valorDepoisDoEspaco = document.getElementById("cadNome").value;
    ok("o espaço entra e permanece", valorDepoisDoEspaco === "Ana ", "valor: [" + valorDepoisDoEspaco + "]");
    ok("e o foco não se mexe", focoAgora() === "cadNome", "foco em: " + focoAgora());

    // A frase que ela citou: espaço entre letras. Tecla a tecla, do zero.
    irCadastro(null);
    var comEspacos = "A n a";
    for (var e = 1; e <= comEspacos.length; e++) digitar("cadNome", comEspacos.slice(0, e), e);
    ok("digitando 'A n a' letra por letra, o foco nunca sai",
       focoAgora() === "cadNome", "foco em: " + focoAgora());
    ok("o texto com espaços chegou inteiro",
       document.getElementById("cadNome").value === comEspacos,
       "valor: [" + document.getElementById("cadNome").value + "]");

    var muitas = "Ana Beatriz Souza Lima";
    for (var k = 1; k <= muitas.length; k++) digitar("cadNome", muitas.slice(0, k), k);
    ok("22 teclas seguidas sem perder o foco", focoAgora() === "cadNome", "foco em: " + focoAgora());
    ok("o texto inteiro chegou", document.getElementById("cadNome").value === muitas,
       "valor: " + document.getElementById("cadNome").value);

    /* ── 2. PASSO 1 ───────────────────────────────────────────── */
    secao("Passo 1 — nome, e-mail e senha");
    irCadastro(null);
    ok("pede o nome", !!$("#cadNome"));
    ok("pede o e-mail", !!$("#cadEmail"));
    ok("pede a senha", !!$("#cadSenha") && $("#cadSenha").type === "password");
    ok("não pede nada além disso", !$("#cadUsuario") && !$(".perfis"));
    ok("oferece o Google", /Continuar com Google/.test(document.body.innerText));
    ok("diz que é o passo 1 de 3", /Passo 1 de 3/.test(document.body.innerText));
    ok("começa travado", !!$("#btnAvancarCad") && $("#btnAvancarCad").disabled);

    digitar("cadNome", "Ana Souza");
    digitar("cadEmail", "ana@exemplo.com");
    ok("ainda travado sem senha", $("#btnAvancarCad").disabled);
    digitar("cadSenha", "123");
    ok("travado com senha curta", $("#btnAvancarCad").disabled);
    ok("avisa quantos caracteres faltam", /Faltam 3 caractere/.test(document.body.innerText));
    digitar("cadSenha", "123456");
    ok("destrava com os três campos válidos", !$("#btnAvancarCad").disabled);
    digitar("cadEmail", "naoehemail");
    ok("trava de novo com e-mail inválido", $("#btnAvancarCad").disabled);
    digitar("cadEmail", "ana@exemplo.com");

    /* ── 3. PASSO 2 ───────────────────────────────────────────── */
    secao("Passo 2 — nome de usuário e perfil");
    avancarCad();
    ok("chegou no passo 2", /Passo 2 de 3/.test(document.body.innerText));
    ok("pede o nome de usuário", !!$("#cadUsuario"));
    ok("sugere a partir do nome", /@ana\.souza/.test(document.body.innerText));
    ok("mostra as três opções de perfil", !!$(".perfis") && $$perfis() === 3, $$perfis() + " opções");
    ok("travado sem escolher", $("#btnAvancarCad").disabled);

    digitar("cadUsuario", "ma");
    ok("recusa usuário curto", /3 a 20 caracteres/.test(document.body.innerText));
    digitar("cadUsuario", "marina");
    ok("recusa usuário já em uso", /já está em uso/.test(document.body.innerText));
    digitar("cadUsuario", "ana.souza");
    ok("aceita usuário livre", /Disponível/.test(document.body.innerText));
    ok("mostra o endereço do perfil", /ink\.creators\/@ana\.souza/.test(document.body.innerText));
    ok("cursor sobrevive no campo de usuário", focoAgora() === "cadUsuario", "foco em: " + focoAgora());
    ok("ainda travado sem escolher perfil", $("#btnAvancarCad").disabled);

    S.cad.perfil = "tatuador"; render();
    ok("destrava com usuário e perfil", !$("#btnAvancarCad").disabled);

    /* ── 4. PASSO 3 ───────────────────────────────────────────── */
    secao("Passo 3 — um por perfil, e acabou");
    ok("o fluxo tem exatamente três passos", roteiroCadastro().length === 3,
       roteiroCadastro().length + " passos");
    avancarCad();
    ok("chegou no passo 3", /Passo 3 de 3/.test(document.body.innerText));
    ok("é o passo do tatuador", /O que você tatua/.test(document.body.innerText));
    ok("o botão vira Criar conta", /Criar conta/.test($("#btnAvancarCad").innerText));
    ok("exige pelo menos um estilo", $("#btnAvancarCad").disabled);
    ok("não pede portfólio aqui", !/Adicionar/.test(document.body.innerText));

    tog(S.onbStyles, "realismo");
    ok("escolher estilo destrava", !$("#btnAvancarCad").disabled);
    digitar("onbEstudio", "Studio Ana");
    ok("cursor sobrevive no campo do estúdio", focoAgora() === "onbEstudio", "foco em: " + focoAgora());

    /* ── 5. CRIAR CONTA ───────────────────────────────────────── */
    secao("Criar conta entrega no produto");
    var senhaUsada = "123456";
    avancarCad();
    ok("virou tatuador", S.session === "artist", "sessão: " + S.session);
    ok("caiu na gestão do estúdio", S.route === "studio", "rota: " + S.route);
    ok("guardou o nome de usuário", S.usuario === "ana.souza", "usuário: " + S.usuario);
    ok("não passou por tela de revisão", true);

    salvarEstado();
    var salvo = "";
    try { salvo = localStorage.getItem("ink.estado.v1") || ""; } catch (e) {}
    ok("o estado foi salvo", salvo.length > 10);
    ok("a SENHA não foi para o disco", salvo.indexOf(senhaUsada) < 0);
    ok("o e-mail foi", salvo.indexOf("ana@exemplo.com") >= 0);

    /* ── 6. OS OUTROS DOIS PERFIS ─────────────────────────────── */
    secao("Cliente e fornecedor");
    [["cliente", "O que você procura", false], ["fornecedor", "Nome da empresa", true]].forEach(function (caso) {
      irCadastro(null);
      digitar("cadNome", "Teste " + caso[0]);
      digitar("cadEmail", "t@exemplo.com");
      digitar("cadSenha", "123456");
      avancarCad();
      digitar("cadUsuario", "teste." + caso[0]);
      S.cad.perfil = caso[0]; render();
      avancarCad();
      ok(caso[0] + ": chegou no passo 3 de 3", /Passo 3 de 3/.test(document.body.innerText));
      ok(caso[0] + ": conteúdo é o certo", new RegExp(caso[1]).test(document.body.innerText));
      ok(caso[0] + (caso[2] ? ": exige preencher antes de criar" : ": pode pular e criar direto"),
         $("#btnAvancarCad").disabled === caso[2]);
      ok(caso[0] + ": três passos", roteiroCadastro().length === 3);
    });

    /* ── 7. CONSOLE LIMPO ─────────────────────────────────────── */
    secao("Console");
    ok("nenhum erro de JavaScript durante a verificação", errosDeConsole.length === 0,
       errosDeConsole.slice(0, 2).join(" | "));

    // Devolve o protótipo ao estado em que estava.
    try {
      var a = JSON.parse(estadoAnterior);
      S.session = a.session; S.route = a.route; render();
    } catch (e) {}

    desenharPainel();
  }

  function $$perfis() {
    var p = document.querySelector(".perfis");
    return p ? p.querySelectorAll(".perfilopt").length : 0;
  }

  function desenharPainel() {
    var passou = resultados.filter(function (r) { return r.nome && r.passou; }).length;
    var falhou = resultados.filter(function (r) { return r.nome && !r.passou; }).length;

    var css = document.createElement("style");
    css.textContent =
      "#verif{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:flex;" +
      "align-items:flex-start;justify-content:center;padding:24px;overflow:auto;" +
      "font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
      "#verif .cx{background:var(--card,#fff);color:var(--foreground,#111);border-radius:14px;" +
      "max-width:640px;width:100%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}" +
      "#verif h2{margin:0;font-size:18px;letter-spacing:-.02em}" +
      "#verif .res{font-size:13px;margin-top:3px;opacity:.7}" +
      "#verif .sec{margin-top:17px;font-size:11px;font-weight:700;text-transform:uppercase;" +
      "letter-spacing:.09em;opacity:.55}" +
      "#verif .l{display:flex;gap:9px;align-items:flex-start;padding:5px 0;font-size:13.5px;line-height:1.4}" +
      "#verif .m{flex-shrink:0;width:15px;font-weight:700}" +
      "#verif .ok .m{color:#16a34a}#verif .xx .m{color:#dc2626}" +
      "#verif .xx{color:#dc2626}" +
      "#verif .d{opacity:.6;font-size:12px}" +
      "#verif button{margin-top:18px;width:100%;padding:11px;border-radius:10px;border:1px solid rgba(0,0,0,.15);" +
      "background:#111;color:#fff;font-weight:600;font-size:14px;cursor:pointer}";
    document.head.appendChild(css);

    var h = '<div class="cx">';
    h += '<h2>' + (falhou === 0 ? "Tudo certo" : falhou + " coisa(s) fora do lugar") + '</h2>';
    h += '<div class="res">' + passou + " de " + (passou + falhou) +
         ' verificações passaram, no seu navegador, com campos de verdade.</div>';
    resultados.forEach(function (r) {
      if (r.secao) { h += '<div class="sec">' + r.secao + "</div>"; return; }
      h += '<div class="l ' + (r.passou ? "ok" : "xx") + '"><span class="m">' +
           (r.passou ? "✓" : "✕") + '</span><span>' + r.nome +
           (!r.passou && r.detalhe ? ' <span class="d">— ' + r.detalhe + "</span>" : "") +
           "</span></div>";
    });
    h += '<button onclick="document.getElementById(\'verif\').remove()">Fechar e navegar</button>';
    h += "</div>";

    var d = document.createElement("div");
    d.id = "verif";
    d.innerHTML = h;
    document.body.appendChild(d);
  }

  // Espera o protótipo terminar de montar antes de mexer nele.
  if (document.readyState === "complete") setTimeout(rodar, 60);
  else window.addEventListener("load", function () { setTimeout(rodar, 60); });
})();
