#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Atalho pelo Terminal. A lógica está em bin/prototipo.sh, a mesma que
# o aplicativo "Parar Ink Creators.app" usa.
#
# SE VOCÊ ESTÁ VENDO JANELAS DE TERMINAL SE ACUMULANDO, use o
# aplicativo em vez deste arquivo: o Finder o executa sem abrir
# Terminal nenhum, e não há janela para sobrar.
#
# Por que a janela às vezes não fecha: quem fecha é um comando que
# pede ao Terminal para se fechar, e o macOS exige permissão para um
# programa controlar outro. Se essa permissão nunca foi concedida —
# ou foi negada — o pedido falha em silêncio. O aplicativo não depende
# disso porque nunca abre janela.
# ═══════════════════════════════════════════════════════════════════

RAIZ="$(cd "$(dirname "$0")" && pwd)"
"$RAIZ/bin/prototipo.sh" parar

# Fecha só esta janela, encontrada pelo terminal (tty) em que ela roda.
# Procurar pelo título falhava quando o Terminal renomeava a janela ao
# terminar o processo.
TT=$(tty 2>/dev/null)
if [ -n "$TT" ]; then
  osascript >/dev/null 2>&1 <<APPLESCRIPT &
tell application "Terminal"
  repeat with w in windows
    try
      repeat with t in tabs of w
        if tty of t is "$TT" then close w saving no
      end repeat
    end try
  end repeat
end tell
APPLESCRIPT
  FECHOU=$?
  if [ "$FECHOU" -ne 0 ]; then
    echo
    echo "  Não consegui fechar esta janela sozinho."
    echo "  Use o aplicativo em vez deste arquivo, ou libere em"
    echo "  Ajustes > Privacidade e Segurança > Automação > Terminal."
  fi
fi
exit 0
