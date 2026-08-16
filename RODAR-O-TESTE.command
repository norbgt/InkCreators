#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# RODAR O TESTE
#
# O último passo antes de escrever mais código: pôr o protótipo na mão
# de gente.
#
# Este script confere que o link está no ar, põe a mensagem de convite
# na sua área de transferência, conta quantas pessoas já foram
# convidadas e lembra o critério para seguir adiante.
#
# O QUE ELE NÃO FAZ, E NÃO DEVE
# Não conta quantas pessoas participaram. Esse número está protegido:
# só admin lê a tabela de sessões, e a chave que este script usa é
# pública. Para ver o painel, entre no protótipo com a sua conta.
# É a política de segurança funcionando, não uma limitação.
# ═══════════════════════════════════════════════════════════════════

cd "$(dirname "$0")" || exit 1

VERDE=$'\033[32m'; VERM=$'\033[31m'; AMAR=$'\033[33m'; CINZA=$'\033[90m'
NEG=$'\033[1m'; FIM=$'\033[0m'

LINK="https://norbgt.github.io/InkCreators/?teste=1"
LISTA="teste/convidados.md"

clear 2>/dev/null || true
echo
echo "  ═══════════════════════════════════════════════════════"
echo "   ${NEG}RODAR O TESTE${FIM}"
echo "  ═══════════════════════════════════════════════════════"
echo

# ── 1. O link está de pé? ──────────────────────────────────────────
echo "  Conferindo o link…"
COD=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 \
      "https://norbgt.github.io/InkCreators/prototipo/index.html?cb=$RANDOM" 2>/dev/null)
if [ "$COD" = "200" ]; then
  echo "  ${VERDE}✓${FIM}  o link responde"
else
  echo "  ${VERM}!${FIM}  o link não respondeu (HTTP ${COD:-sem resposta})"
  echo "     ${CINZA}rode ENVIAR-E-TESTAR.command antes de convidar alguém${FIM}"
  echo
  read -p "  Enter para fechar..."
  exit 1
fi

# ── 2. Quantos já foram convidados? ────────────────────────────────
if [ -f "$LISTA" ]; then
  MARCADOS=$(grep -c '^- \[x\]' "$LISTA" 2>/dev/null || echo 0)
  echo "  ${VERDE}✓${FIM}  $MARCADOS pessoa(s) convidada(s) até agora"
  if [ "$MARCADOS" -lt 15 ]; then
    echo "     ${CINZA}faltam $((15 - MARCADOS)) para o mínimo de 15${FIM}"
    echo "     ${CINZA}→ abra teste/convidados.md e vá marcando${FIM}"
  else
    echo "     ${CINZA}amostra suficiente. Agora é esperar e conversar.${FIM}"
  fi
else
  echo "  ${AMAR}○${FIM}  a lista de convidados ainda não existe"
fi

# ── 3. A mensagem ──────────────────────────────────────────────────
echo
echo "  ═══════════════════════════════════════════════════════"
echo "   ${NEG}A MENSAGEM${FIM}"
echo "  ═══════════════════════════════════════════════════════"
echo
echo "  ${CINZA}Não explique o produto. O que você quer descobrir é o que a"
echo "  pessoa entende sozinha — e explicar antes apaga justamente isso.${FIM}"
echo

TATU="Oi! Tô montando uma plataforma pra quem tatua e quem quer tatuar, e queria muito a sua opinião como profissional.

Você abre esse link e navega uns 10 minutos, como se fosse usar de verdade? Não precisa me mandar feedback depois — eu consigo ver por onde você andou.

$LINK

Se sobrar tempo depois, adoraria 15 min de conversa."

CLI="Oi! Tô montando uma plataforma pra quem gosta de tatuagem e queria sua opinião.

Você abre esse link e navega uns 10 minutos, como se fosse procurar seu próximo tatuador de verdade? Não precisa me dar feedback — eu vejo por onde você passou.

$LINK"

echo "  ${NEG}── para tatuador ──${FIM}"
echo "$TATU" | sed 's/^/  /'
echo
echo "  ${NEG}── para cliente ──${FIM}"
echo "$CLI" | sed 's/^/  /'
echo

if command -v pbcopy >/dev/null 2>&1; then
  echo
  echo "  Qual você quer na área de transferência?"
  echo "    ${NEG}1${FIM}  tatuador      ${NEG}2${FIM}  cliente      ${NEG}Enter${FIM}  nenhuma"
  printf "  → "
  read -r ESCOLHA
  case "$ESCOLHA" in
    1) printf '%s' "$TATU" | pbcopy; echo "  ${VERDE}✓${FIM}  copiada. Cole no WhatsApp." ;;
    2) printf '%s' "$CLI"  | pbcopy; echo "  ${VERDE}✓${FIM}  copiada. Cole no WhatsApp." ;;
    *) echo "  ${CINZA}nada copiado${FIM}" ;;
  esac
fi

# ── 4. Como ler o resultado ────────────────────────────────────────
echo
echo "  ═══════════════════════════════════════════════════════"
echo "   ${NEG}COMO LER O RESULTADO${FIM}"
echo "  ═══════════════════════════════════════════════════════"
echo
echo "  Entre no protótipo com theinkcreatorsapp@gmail.com e vá em"
echo "  ${NEG}modelo de negócio → Painel do teste → Carregar dados${FIM}."
echo
echo "  ${CINZA}O que mais importa, nesta ordem:${FIM}"
echo
echo "    1. ${NEG}Última tela antes de sair.${FIM} Se muita gente para no"
echo "       mesmo lugar e não é fim de fluxo, o problema está ali."
echo
echo "    2. ${NEG}Telas que ninguém abriu.${FIM} Ou não interessam, ou não"
echo "       têm porta de entrada. As duas conclusões servem."
echo
echo "    3. ${NEG}Até onde cada um foi.${FIM} O degrau onde o funil despenca"
echo "       é a próxima coisa a consertar."
echo
echo "    4. ${NEG}Tempo por tela.${FIM} Tempo alto é interesse ou confusão —"
echo "       cruze com a taxa de saída daquela mesma tela."
echo
echo "  ${CINZA}A telemetria diz ONDE a pessoa parou. Só a conversa diz${FIM}"
echo "  ${CINZA}POR QUÊ. Cinco conversas de 15 minutos valem mais que${FIM}"
echo "  ${CINZA}vinte telas de gráfico.${FIM}"
echo
echo "  ═══════════════════════════════════════════════════════"
echo "   ${NEG}O CRITÉRIO PARA SEGUIR${FIM}"
echo "  ═══════════════════════════════════════════════════════"
echo
echo "  ${NEG}60% dos tatuadores dizerem, sem indução, que usariam o"
echo "  check-in.${FIM}"
echo
echo "  ${CINZA}Sem indução quer dizer: você não pergunta \"você usaria o"
echo "  check-in?\". Você pergunta \"o que aqui te seria útil?\" e vê se"
echo "  o check-in aparece sozinho na resposta.${FIM}"
echo
echo "  ${CINZA}Se atingir: vale gastar dois meses construindo o banco dele."
echo "  Se não: o produto muda antes de virar código — e você economizou"
echo "  esses dois meses.${FIM}"
echo
echo "  ${CINZA}Prazo: duas semanas. Data marcada para acabar, senão vira"
echo "  desculpa para continuar desenhando.${FIM}"
echo
echo "  ─── ATALHOS ───────────────────────────────────────────"
echo
echo "    teste/convidados.md      a lista, para editar"
echo "    ONDE-ESTOU.command       o estado geral do projeto"
echo "    PUBLICAR.md              o que a pessoa vê ao abrir"
echo
echo "  Enter para fechar."
read -r
exit 0
