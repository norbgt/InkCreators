#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Encerra o servidor local do protótipo.
#
# Você não precisa rodar isto sempre. O servidor só responde para o seu
# computador, não consome quase nada e some quando você desliga a
# máquina. Use quando quiser fechar de propósito.
# ═══════════════════════════════════════════════════════════════════

ESTADO="/tmp/ink-creators-prototipo.estado"

echo "═══════════════════════════════════════════"
echo "  Ink Creators — encerrar o protótipo"
echo "═══════════════════════════════════════════"
echo

if [ ! -f "$ESTADO" ]; then
  echo "  Não havia servidor anotado. Nada a fazer."
else
  read -r PID PORTA < "$ESTADO"
  if kill -0 "$PID" 2>/dev/null && ps -p "$PID" -o command= 2>/dev/null | grep -q "http\.server $PORTA"; then
    kill "$PID" 2>/dev/null
    sleep 0.5
    kill -9 "$PID" 2>/dev/null   # se não saiu com jeito
    echo "  Servidor da porta $PORTA encerrado."
  else
    echo "  O servidor já não estava rodando."
  fi
  rm -f "$ESTADO"
fi

echo
osascript -e 'tell application "Terminal" to close (every window whose name contains "parar-prototipo")' >/dev/null 2>&1 &
sleep 1
exit 0
