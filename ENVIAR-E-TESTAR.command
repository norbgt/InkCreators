#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Envia tudo para o GitHub e confere se o site publicado atualizou.
#
# O GitHub Pages leva de 1 a 3 minutos para republicar depois do envio.
# Este script espera e confere sozinho: ele busca a página publicada e
# procura as marcas do cadastro novo. Só diz que está pronto quando
# encontrar.
# ═══════════════════════════════════════════════════════════════════

cd "$(dirname "$0")" || exit 1
SITE="https://norbgt.github.io/InkCreators"

echo "═══════════════════════════════════════════"
echo "  Ink Creators — enviar e conferir"
echo "═══════════════════════════════════════════"
echo

# ── 1. Envio ───────────────────────────────────────────────────────
echo "  Enviando para o GitHub..."
echo
./sincronizar-com-github.command < /dev/null 2>&1 | sed 's/^/    /'

if ! git diff --quiet origin/main HEAD 2>/dev/null; then
  echo
  echo "  ✗ O envio não terminou. Resolva o que apareceu acima e rode de novo."
  read -p "Enter para fechar..."
  exit 1
fi

# ── 2. Espera o Pages republicar ───────────────────────────────────
echo
echo "  Enviado. Agora esperando o GitHub Pages republicar."
echo "  (leva de 1 a 3 minutos na primeira vez)"
echo

MARCAS=("cadUsuario" "cadSenha" "dicaUsuario" "Também faço coberturas" "COBRANCAS")
PRONTO=0
for tentativa in $(seq 1 40); do
  CORPO=$(curl -s -H 'Cache-Control: no-cache' "$SITE/prototipo/index.html?cb=$RANDOM")
  FALTA=0
  for m in "${MARCAS[@]}"; do
    echo "$CORPO" | grep -qF "$m" || FALTA=$((FALTA+1))
  done
  if [ "$FALTA" -eq 0 ]; then PRONTO=1; break; fi
  printf "\r  tentativa %2d de 40 — %d marca(s) ainda faltando   " "$tentativa" "$FALTA"
  sleep 15
done
echo

if [ "$PRONTO" -ne 1 ]; then
  echo
  echo "  ⏳ O Pages ainda não republicou depois de 10 minutos."
  echo "     Confira em: https://github.com/norbgt/InkCreators/actions"
  echo "     Se estiver tudo verde lá, espere mais um pouco e rode de novo."
  read -p "Enter para fechar..."
  exit 1
fi

# ── 3. Confere o essencial no que está publicado ───────────────────
echo
echo "  ✓ O site publicado já tem o cadastro novo."
echo

conferir() {
  if curl -s "$SITE/$1?cb=$RANDOM" -o /dev/null -w '%{http_code}' | grep -q "^$2$"; then
    echo "    ok   $1"
  else
    echo "    XX   $1 não respondeu $2"
  fi
}
conferir "" 200
conferir "prototipo/index.html" 200
conferir "prototipo/dados.js" 200
conferir "prototipo/teste.js" 200
conferir "prototipo/verificar.js" 200

echo
echo "═══════════════════════════════════════════════════════"
echo "  LINK DO TESTE — mande este para as pessoas"
echo
echo "     $SITE/?teste=1"
echo
echo "  Conferir você mesma antes de mandar:"
echo "     $SITE/?verificar=1"
echo "═══════════════════════════════════════════════════════"
echo
echo "  Falta só uma coisa para o painel funcionar: criar sua"
echo "  conta pelo protótipo e me dizer o e-mail, para eu dar"
echo "  o papel de admin."
echo
read -p "Enter para fechar..."
