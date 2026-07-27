#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Abre o protótipo conectado ao banco.
#
# TRÊS COISAS FAZIAM VOCÊ VER A VERSÃO VELHA, E AS TRÊS ESTÃO
# RESOLVIDAS AQUI:
#
# 1. O `open` do macOS, ao receber uma URL que já está aberta numa aba,
#    apenas muda o foco para ela — sem recarregar. Por isso o endereço
#    agora leva um carimbo de tempo: é sempre uma URL nova, e o
#    navegador é obrigado a buscar.
#
# 2. O servidor padrão do Python deixa o navegador guardar os arquivos.
#    Trocamos por um que responde no-store em tudo.
#
# 3. Servidores esquecidos de execuções anteriores continuavam de pé,
#    às vezes servindo de outra pasta. Agora eles são encerrados antes
#    de subir o novo.
#
# No fim, o script confere que o que o servidor está entregando é o
# arquivo que está no disco. Se não bater, ele avisa em vez de abrir.
#
# Para encerrar: dois cliques em parar-prototipo.command.
# ═══════════════════════════════════════════════════════════════════

RAIZ="$(cd "$(dirname "$0")" && pwd)"
PASTA="$RAIZ/prototipo"
ESTADO="/tmp/ink-creators-prototipo.estado"
PORTA=8765

cd "$PASTA" || { echo "Não encontrei a pasta prototipo."; read -p "Enter para fechar..."; exit 1; }

echo "═══════════════════════════════════════════"
echo "  Ink Creators — protótipo"
echo "═══════════════════════════════════════════"
echo

# ── 1. Encerra qualquer servidor nosso que tenha sobrado ───────────
# Inclui os que foram abertos por versões antigas deste script, que não
# deixavam registro nenhum. Procura por quem está escutando nas nossas
# portas e mata só o que for python servindo HTTP.
encerrar_antigos() {
  local achou=0
  for p in 8765 8766 8767 8768 8769; do
    for pid in $(lsof -ti tcp:$p -sTCP:LISTEN 2>/dev/null); do
      local cmd
      cmd=$(ps -p "$pid" -o command= 2>/dev/null)
      case "$cmd" in
        *python*http.server*|*python*servidor-local.py*)
          kill "$pid" 2>/dev/null && achou=$((achou+1))
          ;;
      esac
    done
  done
  [ -f "$ESTADO" ] && rm -f "$ESTADO"
  if [ "$achou" -gt 0 ]; then
    echo "  Encerrei $achou servidor(es) de execuções anteriores."
    sleep 0.6
  fi
}
encerrar_antigos

# ── 2. Sobe o servidor sem cache ───────────────────────────────────
while lsof -i :$PORTA >/dev/null 2>&1; do PORTA=$((PORTA + 1)); done

nohup python3 "$PASTA/servidor-local.py" "$PORTA" "$PASTA" >/dev/null 2>&1 &
PID=$!
echo "$PID $PORTA" > "$ESTADO"

for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  curl -s -o /dev/null "http://127.0.0.1:$PORTA/index.html" && break
  sleep 0.3
done

# ── 3. Confere que o servidor entrega o arquivo que está no disco ──
# Compara o tamanho em bytes. Se diferir, alguma outra coisa está
# atendendo naquela porta, e abrir o navegador só ia confundir.
BYTES_DISCO=$(wc -c < "$PASTA/index.html" | tr -d ' ')
BYTES_SERVIDOS=$(curl -s "http://127.0.0.1:$PORTA/index.html" | wc -c | tr -d ' ')

if [ "$BYTES_DISCO" != "$BYTES_SERVIDOS" ]; then
  echo "  ✗ O servidor não está entregando o arquivo desta pasta."
  echo "    no disco: $BYTES_DISCO bytes · servido: $BYTES_SERVIDOS bytes"
  echo
  echo "    Mostre esta mensagem à Claude."
  echo
  read -p "Enter para fechar..."
  exit 1
fi

# ── 4. URL nova a cada abertura ────────────────────────────────────
# O carimbo de tempo é o que impede o macOS de só focar uma aba antiga
# sem recarregar. O protótipo ignora esse parâmetro.
CARIMBO=$(date +%s)
URL="http://localhost:$PORTA/?v=$CARIMBO"

echo "  ✓ Servindo o arquivo desta pasta ($BYTES_DISCO bytes), sem cache."
echo
echo "  Protótipo:   $URL"
echo "  Verificação: http://localhost:$PORTA/?v=$CARIMBO&verificar=1"
echo
echo "  Para encerrar: parar-prototipo.command"
echo

open "$URL"

osascript -e 'tell application "Terminal" to close (every window whose name contains "abrir-prototipo")' >/dev/null 2>&1 &
exit 0
