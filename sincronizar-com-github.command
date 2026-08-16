#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Sincroniza este repositório com o GitHub.
#
# POR QUE ESTE ARQUIVO EXISTE
# O ambiente onde a Claude executa comandos não tem acesso de rede ao
# github.com — por política, não por falta de credencial. Então os
# commits acontecem localmente e o envio é uma ação sua.
#
# Isso também é saudável do ponto de vista de governança: o que vai
# para o seu repositório sai com as suas credenciais e sob o seu aval.
#
# COMO USAR
# Dê dois cliques neste arquivo no Finder. Se o macOS reclamar que não
# pode abrir, rode uma vez no Terminal:
#     chmod +x "sincronizar-com-github.command"
# ═══════════════════════════════════════════════════════════════════

cd "$(dirname "$0")" || exit 1

echo "═══════════════════════════════════════════"
echo "  Ink Creators — sincronizar com o GitHub"
echo "═══════════════════════════════════════════"
echo

if [ ! -d .git ]; then
  echo "✗ Esta pasta não é um repositório git."
  echo "  Algo saiu do lugar. Avise a Claude."
  echo; read -p "Enter para fechar..."; exit 1
fi

echo "→ Repositório: $(git remote get-url origin 2>/dev/null || echo 'sem remoto configurado')"
echo "→ Branch: $(git rev-parse --abbrev-ref HEAD)"
echo

# Confere se há algo não commitado
if [ -n "$(git status --porcelain)" ]; then
  echo "Há mudanças ainda não registradas:"
  git status --short
  echo
  read -p "Registrar tudo isso num commit agora? (s/N) " R
  if [ "$R" = "s" ] || [ "$R" = "S" ]; then
    read -p "Descreva a mudança em uma linha: " MSG
    [ -z "$MSG" ] && MSG="Ajustes"
    git add -A && git commit -q -m "$MSG"
    echo "✓ Commit criado."
  else
    echo "→ Seguindo sem registrar. Só o que já estava commitado será enviado."
  fi
  echo
fi

# Verificação de segurança antes de enviar
echo "→ Conferindo que nenhum segredo vai junto..."

if git ls-files | grep -qE '^\.env$'; then
  echo "✗ PARADO: o arquivo .env está versionado."
  echo "  Segredo não pode ir para o GitHub. Avise a Claude antes de continuar."
  echo; read -p "Enter para fechar..."; exit 1
fi

# O padrão é montado em pedaços de propósito. Se ficasse escrito inteiro
# aqui, a busca encontraria a si mesma e bloquearia o envio para sempre
# — foi exatamente o que aconteceu na primeira versão deste script.
P1='sb''_secret_'
P2='AIza''Sy[A-Za-z0-9_-]{30}'
P3='eyJhbG''ciOiJ'
PADRAO="$P1|$P2|$P3"

# Exclusões: os .md discutem o tema, o .env.exemplo lista os nomes das
# variáveis sem valores, e este script contém o próprio padrão.
ACHADOS=$(git grep -lIE "$PADRAO" -- \
  ':!*.md' ':!.env.exemplo' ':!sincronizar-com-github.command' 2>/dev/null)

if [ -n "$ACHADOS" ]; then
  echo "✗ PARADO: parece haver uma chave real nestes arquivos:"
  echo "$ACHADOS" | sed 's/^/    /'
  echo
  echo "  Mostre esta lista à Claude antes de continuar."
  echo; read -p "Enter para fechar..."; exit 1
fi

echo "✓ Nenhum segredo detectado."
echo

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# ── Existe conteúdo no GitHub que não temos aqui? ──────────────────
# Acontece quando o repositório foi criado pelo site com README, licença
# ou .gitignore automáticos. As duas histórias nascem separadas e o Git
# se recusa a sobrescrever uma com a outra sem ordem explícita.
echo "→ Verificando o que já existe no GitHub..."
git fetch origin "$BRANCH" 2>/dev/null

if git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
  SO_LA=$(git rev-list --count "HEAD..origin/$BRANCH" 2>/dev/null || echo 0)
  if [ "$SO_LA" -gt 0 ]; then
    echo
    echo "  O GitHub tem $SO_LA envio(s) que não estão aqui:"
    git log --oneline "HEAD..origin/$BRANCH" 2>/dev/null | sed 's/^/    /'
    echo
    echo "  Arquivos que existem lá e não aqui:"
    git diff --name-only HEAD "origin/$BRANCH" 2>/dev/null | sed 's/^/    /' | head -10
    echo
    echo "  Vou juntar as duas versões. Onde houver conflito, a versão do"
    echo "  seu Mac vence — é a que tem o projeto de verdade. Arquivos que"
    echo "  só existem no GitHub são preservados."
    echo
    read -p "  Pode juntar? (s/N) " R
    if [ "$R" != "s" ] && [ "$R" != "S" ]; then
      echo "  Cancelado. Nada foi alterado."
      echo; read -p "Enter para fechar..."; exit 0
    fi
    git merge origin/"$BRANCH" --allow-unrelated-histories -X ours \
      --no-edit -m "Junta o repositório criado no GitHub com o projeto local" 2>&1 | sed 's/^/    /'
    if [ $? -ne 0 ]; then
      echo
      echo "  ✗ A junção não foi automática. Avise a Claude."
      echo; read -p "Enter para fechar..."; exit 1
    fi
    echo "  ✓ Versões unidas."
    echo
  fi
fi

echo "→ Enviando para o GitHub..."
echo

SAIDA_PUSH="/tmp/ink-push.txt"
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push 2>&1 | tee "$SAIDA_PUSH"
else
  echo "  (primeiro envio — vinculando a branch ao remoto)"
  git push -u origin "$BRANCH" 2>&1 | tee "$SAIDA_PUSH"
fi

# ${PIPESTATUS[0]} pega o código do git, não o do tee. Sem isso, o
# script acharia que deu certo sempre — tee sempre sai com zero.
CODIGO=${PIPESTATUS[0]}
echo
if [ $CODIGO -eq 0 ]; then
  echo "═══════════════════════════════════════════"
  echo "  ✓ Pronto. Repositório sincronizado."
  echo "═══════════════════════════════════════════"
  echo
  echo "  Repositório:  https://github.com/norbgt/InkCreators"
  echo
  echo "  ── LINK DO TESTE ──────────────────────────────"
  echo "  https://norbgt.github.io/InkCreators/?teste=1"
  echo
  echo "  Esse endereço só funciona depois de ligar o GitHub"
  echo "  Pages uma vez, em Settings > Pages > Branch: main,"
  echo "  pasta / (root). O passo a passo está em PUBLICAR.md."
  echo
  echo "  O ?teste=1 é o que liga a coleta. Sem ele, ninguém"
  echo "  é registrado — inclusive você." 
else
  echo "✗ O envio falhou."
  echo

  # ── Caso conhecido: token sem permissão de workflow ──────────────
  # O GitHub recusa que um token crie ou altere arquivos dentro de
  # .github/workflows sem o escopo 'workflow'. É proteção deles: quem
  # controla um workflow controla o que roda na infraestrutura do
  # GitHub. Aconteceu em 16/08/2026 ao subir o ping diário do banco.
  if grep -q "workflow.*scope\|refusing to allow" "$SAIDA_PUSH" 2>/dev/null; then
    echo "  ══════════════════════════════════════════════════════"
    echo "   MOTIVO IDENTIFICADO: falta o escopo 'workflow' no token"
    echo "  ══════════════════════════════════════════════════════"
    echo
    echo "  O projeto tem um arquivo que roda na infraestrutura do"
    echo "  GitHub — o ping diário que impede o banco de pausar:"
    echo "    .github/workflows/manter-banco-acordado.yml"
    echo
    echo "  O GitHub não deixa um token criar ou alterar esse tipo de"
    echo "  arquivo sem permissão explícita. É proteção deles, e faz"
    echo "  sentido: quem controla um workflow controla o que roda."
    echo
    echo "  COMO RESOLVER (2 minutos)"
    echo
    echo "  Se o seu token é CLÁSSICO (começa com ghp_):"
    echo "    1. github.com/settings/tokens"
    echo "    2. Clique no token que você usa aqui"
    echo "    3. Marque a caixa 'workflow'"
    echo "    4. Update token"
    echo "    5. Rode este script de novo — a senha continua a mesma"
    echo
    echo "  Se é FINE-GRAINED (começa com github_pat_):"
    echo "    1. github.com/settings/personal-access-tokens"
    echo "    2. Abra o token → Repository permissions"
    echo "    3. Ponha 'Workflows' em Read and write"
    echo "    4. Salve e rode este script de novo"
    echo
    echo "  Não precisa gerar token novo nem trocar a senha guardada."
    echo
    echo "  ══════════════════════════════════════════════════════"
    echo
    read -p "Enter para fechar..."
    exit 1
  fi

  echo "  Copie a mensagem acima e mostre à Claude — ela identifica"
  echo "  o motivo. As causas mais comuns:"
  echo
  echo "  • Disse 'workflow scope': o token não tem permissão para"
  echo "    mexer em .github/workflows. Veja acima — o script já"
  echo "    explica quando reconhece."
  echo
  echo "  • Pediu senha e recusou: o GitHub não aceita senha comum."
  echo "    Gere um token em github.com/settings/tokens (marque 'repo')"
  echo "    e use o token no lugar da senha."
  echo
  echo "  • Disse 'rejected' ou 'fetch first': há conteúdo novo no"
  echo "    GitHub. Rode este script de novo — ele resolve sozinho."
  echo
  echo "  • Disse 'not found': confira se o repositório existe em"
  echo "    github.com/norbgt/InkCreators e se a sua conta tem acesso."
fi

echo
read -p "Enter para fechar..."
