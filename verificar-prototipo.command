#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Abre o protótipo já rodando a verificação.
#
# Um painel aparece por cima dizendo o que passou e o que não passou,
# usando campos de verdade no seu navegador. É o jeito de conferir, em
# segundos, se os ajustes chegaram até aí.
#
# Depois é só clicar em "Fechar e navegar".
# ═══════════════════════════════════════════════════════════════════

RAIZ="$(cd "$(dirname "$0")" && pwd)"
PASTA="$RAIZ/prototipo"
ESTADO="/tmp/ink-creators-prototipo.estado"
PORTA=8765

cd "$PASTA" || { echo "Não encontrei a pasta prototipo."; read -p "Enter para fechar..."; exit 1; }

echo "═══════════════════════════════════════════"
echo "  Ink Creators — verificação"
echo "═══════════════════════════════════════════"
echo

for p in 8765 8766 8767 8768 8769; do
  for pid in $(lsof -ti tcp:$p -sTCP:LISTEN 2>/dev/null); do
    cmd=$(ps -p "$pid" -o command= 2>/dev/null)
    case "$cmd" in
      *python*http.server*|*python*servidor-local.py*) kill "$pid" 2>/dev/null ;;
    esac
  done
done
rm -f "$ESTADO"
sleep 0.6

while lsof -i :$PORTA >/dev/null 2>&1; do PORTA=$((PORTA + 1)); done
nohup python3 "$PASTA/servidor-local.py" "$PORTA" "$PASTA" >/dev/null 2>&1 &
echo "$! $PORTA" > "$ESTADO"

for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  curl -s -o /dev/null "http://127.0.0.1:$PORTA/index.html" && break
  sleep 0.3
done

BYTES_DISCO=$(wc -c < "$PASTA/index.html" | tr -d ' ')
BYTES_SERVIDOS=$(curl -s "http://127.0.0.1:$PORTA/index.html" | wc -c | tr -d ' ')
if [ "$BYTES_DISCO" != "$BYTES_SERVIDOS" ]; then
  echo "  ✗ O servidor não está entregando o arquivo desta pasta."
  echo "    no disco: $BYTES_DISCO · servido: $BYTES_SERVIDOS"
  read -p "Enter para fechar..."
  exit 1
fi

URL="http://localhost:$PORTA/?v=$(date +%s)&verificar=1"
echo "  ✓ Abrindo a verificação."
echo "    $URL"
echo
open "$URL"

osascript -e 'tell application "Terminal" to close (every window whose name contains "verificar-prototipo")' >/dev/null 2>&1 &
exit 0
