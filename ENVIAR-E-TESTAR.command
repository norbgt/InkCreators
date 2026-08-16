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

# ── 2. Esperar o Pages republicar ──────────────────────────────────
#
# A conferência é uma só: o arquivo publicado tem de ter exatamente o
# mesmo tamanho do arquivo no disco.
#
# POR QUE TROQUEI A LISTA DE MARCAS POR ISTO
# Antes havia uma lista escrita à mão de trechos que "precisavam estar
# no ar" — nomes de função, textos de botão. Em 16/08/2026 ela mentiu:
# todas as marcas eram de rodadas antigas, então estavam presentes na
# versão velha, e o script disse "✓ o site já tem o cadastro novo"
# enquanto o Pages ainda servia um arquivo de 265 KB contra 410 KB no
# disco. Quem pegou a mentira foi a comparação de tamanho, no fim.
#
# Lista escrita à mão envelhece por construção: cada ajuste novo
# deveria acrescentar uma marca, e ninguém lembra. Tamanho não
# envelhece — muda sozinho a cada alteração, e não tem como ficar
# desatualizado.
BD=$(wc -c < prototipo/index.html | tr -d " ")
PRONTO=0
for tentativa in $(seq 1 40); do
  BP=$(curl -s -H 'Cache-Control: no-cache' "$SITE/prototipo/index.html?cb=$RANDOM" | wc -c | tr -d " ")
  if [ "$BD" = "$BP" ]; then PRONTO=1; break; fi
  printf "\r  tentativa %2d de 40 — publicado %s bytes, disco %s      " "$tentativa" "$BP" "$BD"
  sleep 15
done
echo

if [ "$PRONTO" -ne 1 ]; then
  echo
  echo "  ⏳ Depois de 10 minutos o Pages ainda serve outra versão."
  echo "     No ar: $BP bytes · No disco: $BD bytes"
  echo
  echo "     Confira em: https://github.com/norbgt/InkCreators/actions"
  echo "     Se estiver tudo verde lá, espere mais e rode de novo."
  read -p "Enter para fechar..."
  exit 1
fi

# ── 3. Confere o essencial no que está publicado ───────────────────
echo
echo "  ✓ O site publicado é byte a byte igual ao seu disco ($BD bytes)."
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
echo "  OS TRÊS ACESSOS"
echo
echo "    local    →  Abrir prototipo.html          (dois cliques na pasta)"
echo "    online   →  $SITE/"
echo "    teste    →  $SITE/?teste=1"
echo
echo "  PAINEL DO TESTE"
echo "    Conta admin: theinkcreatorsapp@gmail.com"
echo "    Papéis: admin, artist, client · e-mail confirmado"
echo
echo "    Entre em $SITE/#/conexao com essa conta e o painel"
echo "    do teste abre em: modelo de negócio > Painel do teste."
echo
read -p "Enter para fechar..."
