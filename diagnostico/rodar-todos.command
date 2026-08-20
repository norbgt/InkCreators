#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Roda os 11 roteiros e responde com o CÓDIGO DE SAÍDA de cada um —
# não com uma contagem de texto.
#
# POR QUE ISTO EXISTE
# Durante a rodada do ziguezague, um roteiro quebrou no meio por uma
# variável órfã. Ele imprimiu zero "XX" — e a contagem de "XX" leu
# zero como verde. Roteiro que morre antes de medir não é roteiro que
# passou. O código de saída não mente: os scripts terminam com
# process.exit(falhas ? 1 : 0), e um crash sai com código != 0 por
# construção.
# ═══════════════════════════════════════════════════════════════════
cd "$(dirname "$0")" || exit 1
TOTAL=0
for f in *.js; do
  saida=$(node "$f" 2>&1); cod=$?
  n=$(echo "$saida" | grep -c "  XX  ")
  if [ $cod -ne 0 ] && [ $n -eq 0 ]; then
    printf "  %-26s !! QUEBROU NO MEIO (código %d)\n" "${f%.js}" "$cod"
    echo "$saida" | tail -4 | sed 's/^/      /'
    TOTAL=$((TOTAL+1))
  elif [ $cod -ne 0 ]; then
    printf "  %-26s %d falha(s)\n" "${f%.js}" "$n"
    TOTAL=$((TOTAL+n))
  else
    printf "  %-26s ok\n" "${f%.js}"
  fi
done
echo
[ $TOTAL -eq 0 ] && echo "  ══ tudo verde, e verde de verdade ══" || echo "  ══ $TOTAL problema(s) ══"
exit $([ $TOTAL -eq 0 ] && echo 0 || echo 1)
