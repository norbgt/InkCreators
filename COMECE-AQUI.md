# Começe aqui

> **Perdida? Dois cliques em `ONDE-ESTOU.command`.**
>
> Ele mede o estado real — commits pendentes, banco acordado, backup,
> diagnósticos — e diz qual é o próximo passo. Nada ali é escrito à mão,
> então não envelhece como esta documentação envelhece.


Três passos para o projeto sair do papel. Cada um leva poucos minutos.

---

## 1. Enviar para o GitHub

O repositório local já está pronto, com histórico e sem segredos. Falta só o envio — que precisa das suas credenciais, não das minhas.

**Dê dois cliques em `sincronizar-com-github.command`.**

Ele confere que nenhuma chave está indo junto, e só então envia para `github.com/norbgt/InkCreators`.

Se o macOS bloquear por ser um arquivo baixado, clique com o botão direito → Abrir → Abrir mesmo assim. Ou rode no Terminal:

```bash
cd ~/Desktop/"Ink Creators" && chmod +x sincronizar-com-github.command
```

**Sobre a senha:** o GitHub não aceita mais senha comum. Se ele pedir, crie um token em `github.com/settings/tokens` com escopo `repo` e use o token no lugar da senha. O macOS guarda no Chaveiro e não pergunta de novo.

---

## 2. Criar o banco de dados

Seu projeto Supabase (`hdfigxygektppvlogaoj`) está vazio. Para dar vida a ele:

1. Abra `supabase.com/dashboard` → seu projeto → **SQL Editor**
2. Abra o arquivo `banco/esquema/00_esquema_inicial.sql`
3. Cole o conteúdo inteiro e clique em **Run**

São 10 tabelas, 67 políticas de segurança, 9 gatilhos e os buckets de armazenamento. Já vem com a correção de segurança aplicada — a falha que expunha dados de clientes no projeto antigo não chega a existir aqui.

**Para conferir que deu certo**, rode no mesmo editor:

```sql
select tablename from pg_tables where schemaname = 'public' order by 1;
```

Devem aparecer 10 tabelas: `artist_instagram_oauth`, `artist_pricing`, `artist_styles`, `artists`, `portfolio_items`, `profiles`, `quote_matches`, `quote_requests`, `tattoo_styles`, `user_roles`.

⚠️ **Antes de rodar**, decida o que fazer com o projeto antigo (`xfiilq…`), que tem os dados de hoje. Ver `decisoes/pendencias.md`, item P0.

---

## 3. Conectar o Supabase à Claude

Assim eu passo a inspecionar schema, rodar migrações e conferir políticas direto daqui, sem você intermediar.

**Há dois caminhos, dependendo de onde você está usando a Claude:**

**No app da Claude** (aqui): use o conector do Supabase que sugeri na conversa. É o caminho mais simples — clicar em conectar e autorizar.

**No Claude Code, pelo Terminal:**

```bash
cd ~/Desktop/"Ink Creators"
claude mcp add --scope project --transport http supabase \
  "https://mcp.supabase.com/mcp?project_ref=hdfigxygektppvlogaoj&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching"
claude /mcp
```

Não criei o `.mcp.json` por você de propósito: arquivos que configuram acesso a servidores são protegidos, e é correto que uma IA não os altere sozinha. O conteúdo exato está guardado se você quiser conferir.

---

## Depois disso

O ciclo passa a ser: você me diz o que mudar → eu edito e registro no histórico → você dá dois cliques para sincronizar.

As decisões pendentes estão em `decisoes/pendencias.md`. A mais importante, porque define o que vale construir, é qual dos cinco produtos é **o** produto.
