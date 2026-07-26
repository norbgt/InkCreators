#!/bin/bash
# Copia o esquema inicial do banco para a área de transferência.
# Depois é só colar no SQL Editor do Supabase e clicar em Run.

cd "$(dirname "$0")" || exit 1

ARQ="banco/esquema/00_esquema_inicial.sql"

if [ ! -f "$ARQ" ]; then
  echo "✗ Arquivo não encontrado: $ARQ"
  echo; read -p "Enter para fechar..."; exit 1
fi

cat "$ARQ" | pbcopy

echo "═══════════════════════════════════════════"
echo "  ✓ Esquema copiado ($(wc -l < "$ARQ" | tr -d ' ') linhas)"
echo "═══════════════════════════════════════════"
echo
echo "Agora:"
echo "  1. Abra supabase.com/dashboard"
echo "  2. Escolha o projeto hdfigxygektppvlogaoj"
echo "  3. Menu lateral → SQL Editor → New query"
echo "  4. Cole (Command+V) e clique em Run"
echo
echo "Para conferir depois, rode no mesmo editor:"
echo "  select tablename from pg_tables where schemaname='public' order by 1;"
echo
echo "Devem aparecer 10 tabelas."
echo
read -p "Enter para fechar..."
