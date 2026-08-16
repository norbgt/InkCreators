#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# FAZER BACKUP
#
# Congela o projeto numa versão com data, dentro de backups/.
#
# O que ele faz sozinho: empacota o repositório inteiro num .zip e
# consolida o esquema do banco num arquivo só.
#
# O que ele NÃO faz sozinho: baixar os dados do banco. Isso depende de
# ferramenta que talvez não esteja instalada aqui, e de o projeto não
# estar pausado. O script confere e te diz o caminho.
#
# POR QUE O ZIP IMPORTA MAIS QUE O DUMP, HOJE
# O banco tem uma conta e nenhum dado real. O ativo do projeto é o que
# está nesta pasta: 6 mil linhas de protótipo, dez decisões escritas e
# dez diagnósticos. Perder isso seria perder o projeto; perder o banco
# hoje seria perder um cadastro.
# ═══════════════════════════════════════════════════════════════════

set -u
cd "$(dirname "$0")" || exit 1
RAIZ="$(pwd)"

VERSAO="${1:-v0}"
DATA="$(date +%Y-%m-%d)"
DESTINO="$RAIZ/backups/$VERSAO-$DATA"
mkdir -p "$DESTINO"

echo
echo "  ══════════════════════════════════════════════════════"
echo "   BACKUP  ·  $VERSAO  ·  $DATA"
echo "  ══════════════════════════════════════════════════════"
echo

# ── 1. O projeto inteiro ───────────────────────────────────────────
echo "  1/3  Empacotando o projeto…"
ZIP="$DESTINO/InkCreators-$VERSAO-$DATA.zip"
rm -f "$ZIP"
zip -rq "$ZIP" . \
  -x "backups/*" \
  -x ".git/*" \
  -x "*.DS_Store" \
  -x "node_modules/*" 2>/dev/null
if [ -f "$ZIP" ]; then
  TAM=$(du -h "$ZIP" | cut -f1)
  echo "       ✓ $TAM  →  backups/$VERSAO-$DATA/"
else
  echo "       ✗ não consegui empacotar"
fi

# ── 2. Esquema consolidado ─────────────────────────────────────────
echo "  2/3  Consolidando o esquema do banco…"
ESQ="$DESTINO/esquema-consolidado.sql"
{
  echo "-- Esquema consolidado do Ink Creators"
  echo "-- Gerado em $(date '+%d/%m/%Y %H:%M')"
  echo "-- Montado a partir de banco/esquema/ e banco/migracoes/, na ordem."
  echo "-- Recria a estrutura do zero num Postgres limpo."
  echo
  for f in banco/esquema/*.sql banco/migracoes/*.sql; do
    [ -f "$f" ] || continue
    echo ""
    echo "-- ═══════════════════════════════════════════════════════"
    echo "-- $f"
    echo "-- ═══════════════════════════════════════════════════════"
    cat "$f"
  done
} > "$ESQ"
N=$(grep -c "^-- banco/" "$ESQ" 2>/dev/null || echo 0)
echo "       ✓ $N arquivo(s) reunidos em esquema-consolidado.sql"

# ── 3. Dados do banco ──────────────────────────────────────────────
echo "  3/3  Dados do banco…"
if command -v pg_dump >/dev/null 2>&1; then
  echo "       pg_dump encontrado."
  echo
  echo "       Para baixar os dados, rode com a sua senha do banco:"
  echo
  echo "         pg_dump --data-only --no-owner \\"
  echo "           'postgresql://postgres.hdfigxygektppvlogaoj:SUA_SENHA@aws-0-ca-central-1.pooler.supabase.com:5432/postgres' \\"
  echo "           > '$DESTINO/dados-$DATA.sql'"
  echo
  echo "       A região é ca-central-1 — confirmado no painel."
  echo
  echo "       A string de conexão está em: Supabase → Project Settings → Database."
else
  echo "       pg_dump não está instalado neste Mac."
  echo
  echo "       Caminho sem instalar nada:"
  echo "         Supabase → Database → Backups → baixar o backup lógico"
fi
echo
echo "       Lembrete: o banco precisa estar ATIVO. Se estiver pausado,"
echo "       retome no painel antes de tentar."

echo
echo "  ══════════════════════════════════════════════════════"
echo "   PRONTO"
echo "  ══════════════════════════════════════════════════════"
echo
echo "   Um backup no mesmo computador que o original não é backup."
echo "   Suba o .zip para o Drive ou mande por e-mail para você mesma."
echo
echo "   Pressione Enter para fechar."
read -r
exit 0
