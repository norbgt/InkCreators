# 041 — Conta: senha, Google e permanecer conectado

20 de agosto de 2026

## O pedido

> "1. usuário que se cadastra tem seus dados armazenados e pode depois
> fazer login com e-mail e senha, ou via Google. 2. é possível um
> 'permanecer logado' de pelo menos 15 minutos?"

## 1. O que JÁ estava garantido (e conferi no banco)

**Cadastro grava de verdade.** `signUp` cria o usuário no Supabase; o
gatilho `handle_new_user` (li o código dele no banco hoje) cria o
perfil e semeia o papel `client` — e `artist` quando marcado. Nome de
usuário, cidade, estilos, portfólio e preços gravam nas tabelas com
RLS. **Login por e-mail e senha já existia** (`signInWithPassword`).

## 2. O que construí agora

**Entrar com o Google.** `Dados.entrarComGoogle()` usa o OAuth do
próprio Supabase Auth, com retorno para o endereço do produto. O botão
está na tela de conta (modo real). E uma sorte verificada: o gatilho
`handle_new_user` **já estava pronto para o Google** — ele cai para
`full_name` (que o Google envia) e para o prefixo do e-mail, e pega o
`avatar_url`. Quem entrar pelo Google nasce com perfil e papel de
cliente, igual ao cadastro por e-mail.

**Permanecer conectado.** A resposta à sua pergunta 2 é melhor que 15
minutos: a sessão do Supabase renova sozinha (`autoRefreshToken`) e
mora no `localStorage` — **sobrevive a fechar o navegador; dias, não
minutos**. O que construí foi a *escolha*: a caixa "Permanecer
conectado", **ligada por padrão**. Desligada, a sessão passa a morar no
`sessionStorage` e morre quando a aba fecha — o comportamento certo num
computador emprestado. Vale a partir do próximo entrar.

## 3. O que ficou pendente — e é seu, por envolver credencial

**Ligar o provedor Google no Supabase** (~15 min, uma vez):

1. No Google Cloud Console (`console.cloud.google.com`): projeto →
   **APIs e serviços → Credenciais → ID do cliente OAuth →
   Aplicativo da Web**.
   - Origem autorizada: `https://norbgt.github.io`
   - URI de redirecionamento (exatamente):
     `https://hdfigxygektppvlogaoj.supabase.co/auth/v1/callback`
2. Tela de consentimento: tipo Externo; escopos padrão (e-mail e
   perfil) — nada além.
3. No painel do Supabase: **Authentication → Providers → Google** →
   ligar e colar o Client ID e o Client Secret.
   O secret fica **só ali** — nunca em arquivo do repositório (mesma
   regra da decisão sobre o Google Agenda).

Enquanto o provedor não estiver ligado, o botão explica o motivo em vez
de fingir que funciona.

**As pendências antigas continuam valendo:** SMTP próprio antes de
abrir cadastro por e-mail para gente de verdade (o embutido envia 2
e-mails/hora no projeto todo — `SMTP-PRONTO-PARA-COLAR.md`), e
Supabase Pro antes do piloto (proteção contra senha vazada + sem pausa
automática).

**E um limite honesto:** nada disso roda em `file://` — navegador
bloqueia rede de arquivo local. Conta real se testa no endereço
publicado, em modo `banco real`.

## Guardas e sabotagens

Oito verificações novas em `fluxos.js` — cadastro real, senha, Google
com o provedor certo E com o retorno certo, renovação automática,
escolha com padrão ligado, escolha que muda de verdade onde a sessão
mora, e a tela oferecendo os dois. Quatro sabotagens, quatro acusações
— incluindo a escolha "decorativa" (existe mas não muda nada), que é o
defeito mais provável desse tipo de recurso.

**11 roteiros, tudo verde por código de saída.**
