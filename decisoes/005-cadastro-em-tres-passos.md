# 005 — Cadastro em três passos

**Data:** 27 de julho de 2026
**Situação:** desenhado no protótipo. Backend ainda não acompanha.

## O que mudou

| | Antes | Agora |
|---|---|---|
| Cliente | 3 passos | 3 passos |
| Tatuador | 5 ou 6 passos | 3 passos |
| Fornecedor | 4 passos | 3 passos |

**Passo 1 — nome e e-mail.** Nada mais. Quem abandona ali já deixou como
ser encontrado, e essa é a razão de ele vir sozinho.

**Passo 2 — nome de usuário e perfil.** O `@` da pessoa na plataforma, e
se ela é cliente, tatuador ou fornecedor. Essa escolha define o passo 3
inteiro.

**Passo 3 — um só, por perfil.** Termina criando a conta e entregando a
pessoa no produto. A tela de revisão saiu: revisar o que você acabou de
digitar em duas telas é cerimônia, não conferência.

## O que saiu do caminho

**A senha.** O acesso passa a ser por link enviado no e-mail. Não é só
economia de campo: senha é o item que mais gera abandono e o que mais
gera suporte depois.

**Portfólio e preços do tatuador.** Exigir foto no cadastro trava quem
está com o celular na mão e sem as imagens à mão. Ficam na gestão do
estúdio, que já tem as duas telas prontas.

**O modelo de orçamento.** Era um passo opcional dentro do cadastro.
Vai para a gestão do estúdio pelo mesmo motivo.

**A tela de revisão.** Um passo a mais para não decidir nada.

## Consequência para o backend

`criarConta(email, senha, ...)` em `dados.js` usa senha. O fluxo
desenhado usa link mágico — `signInWithOtp` no Supabase, não
`signUp`. Também não existe coluna de nome de usuário em `profiles`,
e ela precisa ser única.

**Isto ainda não foi feito.** O protótipo mostra a intenção; o modo
real continua com o fluxo antigo. Quando você decidir seguir com este
desenho, é uma migração pequena (uma coluna, um índice único) e uma
troca de método na camada de autenticação.

## Nome de usuário

Formato: 3 a 20 caracteres, letras minúsculas, números, ponto e traço
baixo. Sugestão automática a partir do nome. A lista de nomes ocupados é
fictícia por enquanto — serve para a pessoa encontrar, no teste, o
atrito real de descobrir que o nome que ela queria já foi.
