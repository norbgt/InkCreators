#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# ATALHO DE EMERGÊNCIA — não é por aqui que se abre o protótipo.
#
# O jeito normal é dar dois cliques em "Parar Ink Creators" na pasta
# principal. O Finder executa o aplicativo sem abrir Terminal nenhum,
# e por isso não existe janela para sobrar.
#
# Este arquivo faz a mesma coisa, mas dentro de uma janela de Terminal.
# Ele mora aqui dentro, longe da pasta principal, exatamente para não
# ser clicado por engano: era ele que enchia a tela de janelas.
#
# Por que a janela às vezes não fechava: quem fecha é um comando que
# pede ao Terminal para se fechar, e o macOS exige permissão para um
# programa controlar outro. Sem essa permissão o pedido falha calado,
# e cada clique deixava mais uma janela para trás.
#
# Use este arquivo só se o aplicativo não funcionar — e então me conte
# o que apareceu aqui, porque é essa mensagem que diz o motivo.
# ═══════════════════════════════════════════════════════════════════

RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
"$RAIZ/bin/prototipo.sh" parar
echo
echo "  Pronto. Pode fechar esta janela (⌘W)."
exit 0
