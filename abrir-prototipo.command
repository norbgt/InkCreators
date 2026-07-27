#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Abre o protótipo conectado ao banco.
#
# POR QUE NÃO BASTA DAR DOIS CLIQUES NO index.html
# Ao abrir um arquivo direto do Finder, o navegador usa o endereço
# file:// e bloqueia, por segurança, o carregamento da biblioteca do
# Supabase. É uma proteção do navegador, não um defeito nosso.
#
# POR QUE ESTE SCRIPT FECHA SOZINHO
# Antes, ele segurava o servidor em primeiro plano: a janela do
# Terminal ficava presa até você fechá-la na mão, e cada novo clique
# abria mais uma. Agora o servidor roda solto, em segundo plano, e a
# janela se fecha. Clicar de novo não sobe outro servidor — reaproveita
# o que já está de pé.
#
# Para encerrar o servidor: dois cliques em parar-prototipo.command.
# ═══════════════════════════════════════════════════════════════════

cd "$(dirname "$0")/prototipo" || exit 1

ESTADO="/tmp/ink-creators-prototipo.estado"

# ── Já existe servidor nosso de pé? ────────────────────────────────
# Confere quatro coisas: o arquivo de estado existe, o processo está
# vivo, é um http.server, e é o daquela porta. Sem tudo isso, um PID
# reciclado pelo sistema faria o script achar que está tudo certo e
# mandar o navegador para uma porta morta.
servidor_de_pe() {
  [ -f "$ESTADO" ] || return 1
  read -r PID PORTA < "$ESTADO" 2>/dev/null
  [ -n "$PID" ] && [ -n "$PORTA" ] || return 1
  kill -0 "$PID" 2>/dev/null || return 1
  ps -p "$PID" -o command= 2>/dev/null | grep -q "http\.server $PORTA" || return 1
  return 0
}

if servidor_de_pe; then
  REAPROVEITADO="sim"
else
  REAPROVEITADO="não"
  PORTA=8765
  while lsof -i :$PORTA >/dev/null 2>&1; do PORTA=$((PORTA + 1)); done

  # nohup + & : o servidor sobrevive ao fim deste script e da janela.
  nohup python3 -m http.server "$PORTA" --bind 127.0.0.1 >/dev/null 2>&1 &
  PID=$!
  echo "$PID $PORTA" > "$ESTADO"

  # Espera o servidor atender antes de mandar o navegador abrir. Sem
  # isso o Chrome às vezes chega primeiro e mostra "não foi possível".
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    curl -s -o /dev/null "http://127.0.0.1:$PORTA/" && break
    sleep 0.3
  done
fi

URL="http://localhost:$PORTA/"

echo "═══════════════════════════════════════════"
echo "  Ink Creators — protótipo conectado"
echo "═══════════════════════════════════════════"
echo
echo "  Endereço:  $URL"
if [ "$REAPROVEITADO" = "sim" ]; then
  echo "  O servidor já estava rodando. Só abri no navegador."
else
  echo "  Servidor iniciado em segundo plano (processo $PID)."
fi
echo
echo "  Para encerrar: parar-prototipo.command"
echo

open "$URL"

# Fecha só a janela deste script. O filtro pelo nome evita fechar
# qualquer outra janela de Terminal que você tenha aberta.
osascript -e 'tell application "Terminal" to close (every window whose name contains "abrir-prototipo")' >/dev/null 2>&1 &

exit 0
