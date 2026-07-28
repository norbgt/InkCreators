#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# A lógica de abrir, verificar e parar o protótipo — num lugar só.
#
# Chamado de dois jeitos:
#   · pelos aplicativos (Abrir Ink Creators.app e companhia), que o
#     Finder executa sem abrir Terminal nenhum;
#   · pelos arquivos .command, para quem preferir ver o que acontece.
#
# Ter a lógica duplicada nos dois era o que fazia um funcionar e o
# outro não depois de cada ajuste.
#
# Uso:  prototipo.sh abrir | verificar | parar
# ═══════════════════════════════════════════════════════════════════

set -u

ACAO="${1:-abrir}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PASTA="$RAIZ/prototipo"
ESTADO="/tmp/ink-creators-prototipo.estado"

avisar() {           # aparece como notificação quando não há Terminal
  osascript -e "display notification \"$2\" with title \"Ink Creators\" subtitle \"$1\"" >/dev/null 2>&1
  echo "  $1 — $2"
}
falhar() {
  osascript -e "display alert \"Ink Creators\" message \"$1\" as critical" >/dev/null 2>&1
  echo "  ✗ $1"
  exit 1
}

# ── Encerra servidores nossos, inclusive os de versões antigas ─────
encerrar() {
  local achou=0 pid cmd p
  for p in 8765 8766 8767 8768 8769; do
    for pid in $(lsof -ti tcp:$p -sTCP:LISTEN 2>/dev/null); do
      cmd=$(ps -p "$pid" -o command= 2>/dev/null)
      case "$cmd" in
        *python*http.server*|*python*servidor-local.py*)
          kill "$pid" 2>/dev/null && achou=$((achou+1)) ;;
      esac
    done
  done
  rm -f "$ESTADO"
  echo "$achou"
}

# ── Sobe o servidor e devolve a porta ──────────────────────────────
subir() {
  local porta=8765
  while lsof -i :$porta >/dev/null 2>&1; do porta=$((porta + 1)); done

  nohup python3 "$PASTA/servidor-local.py" "$porta" "$PASTA" >/dev/null 2>&1 &
  local pid=$!
  disown 2>/dev/null || true          # sobrevive ao fim deste processo
  echo "$pid $porta" > "$ESTADO"

  local i
  for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
    curl -s -o /dev/null "http://127.0.0.1:$porta/index.html" && break
    sleep 0.3
  done
  echo "$porta"
}

# ── Confere que o servidor entrega o arquivo desta pasta ───────────
conferir() {
  local porta="$1"
  local disco servido
  disco=$(wc -c < "$PASTA/index.html" | tr -d ' ')
  servido=$(curl -s "http://127.0.0.1:$porta/index.html" | wc -c | tr -d ' ')
  [ "$disco" = "$servido" ]
}

[ -d "$PASTA" ] || falhar "Não encontrei a pasta prototipo dentro de $RAIZ."

case "$ACAO" in
  parar)
    n=$(encerrar)
    if [ "$n" -gt 0 ]; then avisar "Servidor encerrado" "$n processo(s)."
    else avisar "Nada rodando" "Não havia servidor de pé."; fi
    ;;

  abrir|verificar)
    encerrar >/dev/null
    sleep 0.4
    PORTA=$(subir)

    if ! conferir "$PORTA"; then
      falhar "O servidor não está entregando o arquivo desta pasta. Rode de novo; se persistir, mostre isto à Claude."
    fi

    # Carimbo de tempo: sem ele o macOS só traz para frente a aba que
    # já estava aberta, sem recarregar — e você vê a versão de antes.
    URL="http://localhost:$PORTA/?v=$(date +%s)"
    [ "$ACAO" = "verificar" ] && URL="$URL&verificar=1"

    open "$URL"
    if [ "$ACAO" = "verificar" ]; then
      avisar "Verificação aberta" "O painel diz o que passou e o que não passou."
    else
      avisar "Protótipo aberto" "localhost:$PORTA — sem cache."
    fi
    ;;

  *)
    falhar "Ação desconhecida: $ACAO. Use abrir, verificar ou parar."
    ;;
esac
