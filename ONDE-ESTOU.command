#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# ONDE ESTOU
#
# Dois cliques e você vê o estado real do projeto e qual é o próximo
# passo. Nada aqui é escrito à mão: cada linha é medida na hora.
#
# POR QUE ELE EXISTE
# A lista de pendências vivia espalhada em quatro documentos e nas
# minhas mensagens. Documento envelhece, mensagem se perde, e o que
# sobra é a sensação de estar devendo alguma coisa sem saber o quê.
#
# Este script pergunta ao git, ao disco e ao banco. Se ele disser que
# está tudo certo, está tudo certo.
# ═══════════════════════════════════════════════════════════════════

cd "$(dirname "$0")" || exit 1

VERDE=$'\033[32m'; VERM=$'\033[31m'; AMAR=$'\033[33m'; CINZA=$'\033[90m'; FIM=$'\033[0m'
ok()    { echo "  ${VERDE}✓${FIM}  $1"; }
falta() { echo "  ${AMAR}○${FIM}  $1"; }
alerta(){ echo "  ${VERM}!${FIM}  $1"; }
nota()  { echo "     ${CINZA}$1${FIM}"; }

clear 2>/dev/null || true
echo
echo "  ═══════════════════════════════════════════════════════"
echo "   INK CREATORS — onde estou"
echo "   $(date '+%d/%m/%Y às %H:%M')"
echo "  ═══════════════════════════════════════════════════════"
echo

PENDENTE=0

# ── 1. O código está no ar? ────────────────────────────────────────
echo "  CÓDIGO"
git fetch -q origin 2>/dev/null
NAO_ENVIADOS=$(git log --oneline origin/main..HEAD 2>/dev/null | wc -l | tr -d ' ')
if [ "$NAO_ENVIADOS" = "0" ]; then
  ok "tudo enviado para o GitHub"
else
  alerta "$NAO_ENVIADOS commit(s) não enviados"
  nota "o endereço online serve uma versão antiga"
  nota "→ dois cliques em ENVIAR-E-TESTAR.command"
  PENDENTE=$((PENDENTE+1))
fi

SUJO=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
[ "$SUJO" != "0" ] && falta "$SUJO arquivo(s) alterados sem commit"

# ── 2. O banco está acordado? ──────────────────────────────────────
echo
echo "  BANCO"
URL="https://hdfigxygektppvlogaoj.supabase.co/rest/v1/tattoo_styles?select=slug&limit=1"
CHAVE="sb_publishable_Hs85aivJIJCba-l4UER1Gw_PI57PJxa"
COD=$(curl -s -o /tmp/ink-banco.json -w "%{http_code}" --max-time 20 \
      -H "apikey: $CHAVE" -H "Authorization: Bearer $CHAVE" "$URL" 2>/dev/null)
if [ "$COD" = "200" ] && ! grep -q '^\[\]$' /tmp/ink-banco.json 2>/dev/null; then
  ok "acordado e respondendo"
else
  alerta "não respondeu (HTTP ${COD:-sem resposta})"
  nota "provavelmente pausou. Retome em:"
  nota "supabase.com/dashboard/project/hdfigxygektppvlogaoj"
  PENDENTE=$((PENDENTE+1))
fi

# ── 3. O backup saiu daqui? ────────────────────────────────────────
echo
echo "  BACKUP"
ZIP=$(ls -t backups/*/InkCreators-*.zip 2>/dev/null | head -1)
if [ -n "$ZIP" ]; then
  QUANDO=$(date -r "$ZIP" '+%d/%m' 2>/dev/null)
  TAM=$(du -h "$ZIP" | cut -f1)
  ok "versão de $QUANDO ($TAM) em $(dirname "$ZIP")"
  # Só ela sabe se a cópia saiu daqui. O arquivo abaixo é a memória
  # disso — um backup no mesmo disco do original não é backup, e sem
  # registro a pergunta voltaria toda vez.
  if [ -f "backups/.copia-externa" ]; then
    ok "cópia fora deste computador: $(cat backups/.copia-externa)"
  else
    falta "confirme que existe uma cópia FORA deste computador"
    nota "backup no mesmo disco do original não é backup"
    nota "depois de copiar, registre com:"
    nota "  echo 'HD externo · $(date +%d/%m/%Y)' > backups/.copia-externa"
  fi
else
  alerta "nenhum backup encontrado"
  nota "→ dois cliques em fazer-backup.command"
  PENDENTE=$((PENDENTE+1))
fi

# ── 4. Os diagnósticos passam? ─────────────────────────────────────
echo
echo "  DIAGNÓSTICOS"
if command -v node >/dev/null 2>&1; then
  FALHAS=0; TOTAL=0
  for d in diagnostico/*.js; do
    TOTAL=$((TOTAL+1))
    n=$(node "$d" 2>&1 | grep -c "  XX  ")
    FALHAS=$((FALHAS+n))
  done
  if [ "$FALHAS" = "0" ]; then
    ok "$TOTAL roteiros, nenhuma falha"
  else
    alerta "$FALHAS falha(s) em $TOTAL roteiros"
    nota "→ node diagnostico/NOME.js para ver qual"
    PENDENTE=$((PENDENTE+1))
  fi
else
  nota "node não instalado — diagnósticos não rodam aqui"
fi

# ── O PRÓXIMO PASSO ────────────────────────────────────────────────
echo
echo "  ═══════════════════════════════════════════════════════"
if [ "$PENDENTE" -gt 0 ]; then
  echo "   RESOLVA O QUE ESTÁ MARCADO ACIMA PRIMEIRO"
  echo "  ═══════════════════════════════════════════════════════"
else
  echo "   O PRÓXIMO PASSO"
  echo "  ═══════════════════════════════════════════════════════"
  echo
  CONV=0
  [ -f teste/convidados.md ] && CONV=$(grep -c '^- \[x\]' teste/convidados.md 2>/dev/null || echo 0)
  echo "   Rodar o teste do protótipo com 15 a 25 pessoas."
  echo
  if [ "$CONV" = "0" ]; then
    echo "   ${CINZA}Ninguém convidado ainda. Metade tatuadores, metade quem"
    echo "   já tatuou. Duas semanas, custo zero, zero código novo.${FIM}"
  else
    echo "   ${CINZA}$CONV convidada(s). Faltam $(( 15 - CONV > 0 ? 15 - CONV : 0 )) para o mínimo de 15.${FIM}"
  fi
  echo
  echo "   ${VERDE}→ dois cliques em RODAR-O-TESTE.command${FIM}"
  echo "   ${CINZA}  ele confere o link, entrega a mensagem pronta e conta${FIM}"
  echo "   ${CINZA}  quantos faltam${FIM}"
fi

echo
echo "  ─── O QUE NÃO É URGENTE (e por quê) ───────────────────"
echo
echo "  SMTP próprio"
nota "só faz falta quando gente for CRIAR CONTA. O teste com"
nota "?teste=1 não cria conta nenhuma — grava em teste_sessoes."
nota "Guia pronto: SMTP-PRONTO-PARA-COLAR.md"
echo
echo "  Backup das contas de login"
nota "hoje existe uma conta, a sua. Vira importante quando"
nota "houver tatuadores dentro."
echo
echo "  Plano Pro do Supabase"
nota "destrava três coisas de uma vez: senha vazada, banco que"
nota "não pausa e ambiente separado. Vence antes do piloto,"
nota "não antes do teste."
echo
echo "  ─── ATALHOS ───────────────────────────────────────────"
echo
echo "    Abrir prototipo.html        ver o protótipo (interface #2)"
echo "    Comparar interface 1 e 2    o antes e o depois, lado a lado"
echo "    Verificar prototipo.html    conferir no navegador"
echo "    ENVIAR-E-TESTAR.command     publicar"
echo "    fazer-backup.command        congelar uma versão"
echo
echo "    SEGURANCA.md                o que falta em segurança"
echo "    CHECKPOINT-01…md            mercado, modelo e plano"
echo
echo "  Enter para fechar."
read -r
exit 0
