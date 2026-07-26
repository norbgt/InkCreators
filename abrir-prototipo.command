#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Abre o protótipo conectado ao banco.
#
# POR QUE NÃO BASTA DAR DOIS CLIQUES NO index.html
# Ao abrir um arquivo direto do Finder, o navegador usa o endereço
# file:// e bloqueia, por segurança, o carregamento da biblioteca do
# Supabase. É uma proteção do navegador, não um defeito nosso.
#
# Este script sobe um servidor local mínimo e abre o endereço certo.
# Nada sai do seu computador — o servidor só responde para você.
#
# Para encerrar: feche a janela do Terminal ou aperte Control+C.
# ═══════════════════════════════════════════════════════════════════

cd "$(dirname "$0")/prototipo" || exit 1

PORTA=8765
while lsof -i :$PORTA >/dev/null 2>&1; do PORTA=$((PORTA+1)); done

echo "═══════════════════════════════════════════"
echo "  Ink Creators — protótipo conectado"
echo "═══════════════════════════════════════════"
echo
echo "  Servindo em: http://localhost:$PORTA"
echo "  Abrindo no navegador..."
echo
echo "  Para encerrar: Control+C ou feche esta janela."
echo

sleep 1 && open "http://localhost:$PORTA" &

python3 -m http.server $PORTA --bind 127.0.0.1
