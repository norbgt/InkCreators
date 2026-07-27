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
  if kill -0 "$PID" 2>/dev/null && ps -p "$PID" -o command= 2>/dev/null | grep -qE "servidor-local\.py $PORTA|http\.server $PORTA"; then
    kill "$PID" 2>/dev/null
    sleep 0.5
    kill -9 "$PID" 2>/dev/null   # se não saiu com jeito
    echo "  Servidor da porta $PORTA encerrado."
  else
    echo "  O servidor já não estava rodando."
  fi
  rm -f "$ESTADO"
fi

# Varre o que tiver sobrado de execuções antigas, que não deixavam
# registro nenhum.
sobrou=0
for p in 8765 8766 8767 8768 8769; do
  for pid in $(lsof -ti tcp:$p -sTCP:LISTEN 2>/dev/null); do
    cmd=$(ps -p "$pid" -o command= 2>/dev/null)
    case "$cmd" in
      *python*http.server*|*python*servidor-local.py*)
        kill "$pid" 2>/dev/null && sobrou=$((sobrou+1)) ;;
    esac
  done
done
if [ "$sobrou" -gt 0 ]; then
  echo "  Encerrei também $sobrou servidor(es) esquecido(s)."

fi

echo
osascript -e 'tell application "Terminal" to close (every window whose name contains "parar-prototipo")' >/dev/null 2>&1 &
sleep 1
exit 0
