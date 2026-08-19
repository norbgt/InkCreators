# Google Agenda — o que falta para valer

19 de agosto de 2026

## O que existe hoje

No protótipo, a conexão é **simulação**. `conectarGoogleAgenda()` espera
900ms e devolve sucesso ou recusa, conforme um interruptor na tela.

Isso não é preguiça: é o que permite o teste com usuários medir a
decisão que interessa — *"eu daria acesso à minha agenda?"* — sem
depender de nada pronto no backend, e sem pedir a ninguém que autorize
de verdade um produto que ainda não existe.

A simulação foi melhorada nesta rodada para não dar um teste otimista de
graça:

- **Ela falha.** Conexão com serviço de terceiro falha — a pessoa fecha
  a janela, nega o escopo, perde a rede. A versão anterior sempre
  acertava, e um protótipo que só acerta não mostra o dia ruim.
- **Ela pergunta qual calendário.** Essa é a parte que dá medo de
  verdade: ninguém quer sessão de tatuagem caindo no calendário da
  família. A escolha entre criar um calendário separado ("Ink Creators")
  ou usar o principal é a decisão real, e o protótipo agora a faz.

## Por que não dá para "só ligar"

OAuth do Google exige um **client secret**, e client secret não pode
viver no navegador — qualquer pessoa abriria o código-fonte e o teria.
A troca do código de autorização por token tem de acontecer num
servidor.

O Ink Creators não tem servidor. Tem Supabase, que tem Edge Functions —
e é ali que isso mora.

Além disso, o Google só entrega tokens para um projeto registrado, com
tela de consentimento aprovada, e enquanto o app estiver "em teste" só
funciona para até 100 contas que você liste à mão.

## O que é seu

Nada disso eu posso fazer: envolve criar conta, aceitar termos e
manusear segredo.

1. **Criar o projeto no Google Cloud Console**
   `console.cloud.google.com` → novo projeto → "Ink Creators"

2. **Ativar a Google Calendar API**
   APIs e serviços → Biblioteca → Google Calendar API → Ativar

3. **Configurar a tela de consentimento**
   - Tipo: Externo
   - Escopo: **apenas** `https://www.googleapis.com/auth/calendar.events`
     (ver e criar eventos — não peça `calendar` inteiro, que dá acesso a
     configurações que você não usa e assusta na tela de permissão)
   - Enquanto estiver "em teste", adicione os e-mails dos tatuadores do
     piloto como usuários de teste

4. **Criar as credenciais OAuth**
   Credenciais → ID do cliente OAuth → Aplicativo da Web
   - Origem autorizada: `https://norbgt.github.io`
   - URI de redirecionamento:
     `https://hdfigxygektppvlogaoj.supabase.co/functions/v1/google-oauth`

5. **Guardar o segredo no Supabase, não no código**
   Painel do Supabase → Edge Functions → Secrets:
   `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

6. **Me avisar quando os passos 1 a 5 estiverem prontos**

## O que é meu

Depois que existirem as credenciais:

1. **Tabela `google_tokens`** — refresh token por usuário, com RLS
   fechada. Refresh token é credencial de longa duração: só o dono lê, e
   nem ele precisa ver.
2. **Edge Function `google-oauth`** — recebe o código do Google, troca
   por tokens, grava, devolve para a tela.
3. **Edge Function `google-sync`** — cria o calendário "Ink Creators" na
   primeira vez, e daí em diante empurra sessão confirmada e lê os
   compromissos que bloqueiam horário.
4. **Trocar a simulação pela chamada real** no protótipo, mantendo as
   duas telas que já existem: a de recusa e a de escolha de calendário.
5. **Diagnóstico** que falha se o segredo aparecer em qualquer arquivo
   do repositório.

## O que decidir antes de começar

**Vale agora?** Zero tatuadores usam o produto. A conexão com o Google é
uma promessa que aparece bem no teste — "minha agenda não vai ser
ignorada" — e a promessa já está sendo testada pela simulação.

Construir de verdade custa: um projeto no Google, uma tela de
consentimento que o Google revisa, duas Edge Functions, uma tabela com
credencial de terceiro. Enquanto o teste com usuários não disser que
essa é a razão pela qual alguém entraria ou não, é trabalho que envelhece
antes de servir.

**A recomendação:** rode o teste primeiro. Se "integra com minha agenda"
aparecer entre as três coisas que mais importam para quem tatua, isso
vira prioridade um. Se não aparecer, a simulação continua fazendo o
trabalho dela.

## Sobre a chave que já está no repositório

A chave do Supabase que aparece em `dados.js` é **publicável** — ela é
feita para ficar no navegador, e o que protege os dados é a RLS, não o
sigilo dela.

A do Google é de outra natureza: `GOOGLE_CLIENT_SECRET` **nunca** entra
em arquivo do repositório, nem em `.env` versionado. Só nos Secrets do
Supabase.
