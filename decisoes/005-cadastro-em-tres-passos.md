# 005 — Cadastro em três passos

**Data:** 27 de julho de 2026
**Situação:** desenhado no protótipo. Backend ainda não acompanha.

## O que mudou

| | Antes | Agora |
|---|---|---|
| Cliente | 3 passos | 3 passos |
| Tatuador | 5 ou 6 passos | 3 passos |
| Fornecedor | 4 passos | 3 passos |

**Passo 1 — nome, e-mail e senha.** Nada além disso. Quem abandona ali
já deixou uma conta utilizável, e não um cadastro pela metade.

**Passo 2 — nome de usuário e perfil.** O `@` da pessoa na plataforma, e
se ela é cliente, tatuador ou fornecedor. Essa escolha define o passo 3
inteiro.

**Passo 3 — um só, por perfil.** Termina criando a conta e entregando a
pessoa no produto. A tela de revisão saiu: revisar o que você acabou de
digitar em duas telas é cerimônia, não conferência.

## O que saiu do caminho

**Portfólio e preços do tatuador.** Exigir foto no cadastro trava quem
está com o celular na mão e sem as imagens à mão. Ficam na gestão do
estúdio, que já tem as duas telas prontas.

**O modelo de orçamento.** Era um passo opcional dentro do cadastro.
Vai para a gestão do estúdio pelo mesmo motivo.

**A tela de revisão.** Um passo a mais para não decidir nada.

## Consequência para o backend

`criarConta(email, senha, nome, querSerTatuador)` em `dados.js`
continua servindo — a senha permaneceu no passo 1.

O que falta: **não existe coluna de nome de usuário em `profiles`**, e
ela precisa ser única. É uma migração pequena, uma coluna com índice
único, mas ainda não foi feita. O protótipo mostra a intenção; o modo
real ainda ignora o campo.

## Onde a senha não entra

O estado do protótipo é salvo em `localStorage` para sobreviver a um
F5. A senha é removida antes de gravar: ela vive só na memória da aba e
some junto com ela. Testado.

## Um perfil não obriga a outra conta

Quem vende material muitas vezes também tatua — quem fabrica agulha
costuma ser quem usa. O passo 3 do fornecedor pergunta isso, e marcar
acrescenta o papel à mesma conta em vez de abrir outro cadastro. Duas
contas para a mesma pessoa seria o pior dos dois mundos: nenhuma com o
histórico inteiro.

O caminho de volta existe também: quem já é tatuador acrescenta o papel
de fornecedor pela gestão do estúdio, marcando uma caixa. Sem passar por
cadastro nenhum, sem mudar o perfil público, e reversível.

Quando o fornecedor também tatua, o que ele já disse é reaproveitado —
a empresa vira o estúdio, a cidade vira a cidade. Perguntar de novo
seria pedir dois cadastros com outro nome.

## O cliente informa onde antes do quê

A cidade decide quem pode atender; o estilo só refina dentro disso.
Perguntar o gosto antes de saber se existe alguém perto é começar pela
ponta que não muda nada.

Por isso cidade e UF são obrigatórias e o botão "Pular" saiu. Pular ali
era oferecer uma conta que não funciona: sem cidade, o pedido não chega
a ninguém. Os estilos continuam opcionais.

## Nome de usuário

Formato: 3 a 20 caracteres, letras minúsculas, números, ponto e traço
baixo. Sugestão automática a partir do nome. A lista de nomes ocupados é
fictícia por enquanto — serve para a pessoa encontrar, no teste, o
atrito real de descobrir que o nome que ela queria já foi.
