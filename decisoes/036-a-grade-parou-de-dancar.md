# 036 — A grade parou de dançar

20 de agosto de 2026

## O que você sentiu no celular

> "a grade fica dançando com o touch"

## A causa, e por que nenhum teste meu via

O masonry do feed usava `column-count` do CSS. Coluna CSS tem um
comportamento que ninguém pediu: **o navegador rebalanceia o conteúdo
inteiro a cada mudança**. Quando o scroll infinito acrescenta um lote —
ou um toque re-renderiza o feed — todos os cards são redistribuídos
entre as colunas, e o card que você estava olhando muda de lugar
embaixo do dedo.

Nenhum roteiro pegava isso porque nenhum comparava a tela de **antes**
do lote com a de **depois**. Todos mediam um instante; a dança mora na
transição.

## A correção

As colunas agora são divs de verdade e a distribuição é nossa:

- `quantasColunas(largura)` — os **mesmos** pontos de quebra de antes
  (2 · 560 → 3 · 700 → 4 · 1100 → 5), agora numa função que o teste
  varia como o navegador varia.
- `pesoDaPublicacao(a)` — altura estimada do card, derivada da
  proporção da foto, que é determinista por semente.
- `emColunas(pecas)` — cada peça entra na **coluna mais curta naquele
  momento**. Como sequência e pesos são deterministas, repintar com
  mais um lote reproduz exatamente as decisões anteriores e só
  acrescenta no pé. **Card colocado nunca mais se move.**

Redesenho por resize só quando o **número de colunas** muda — redesenhar
a cada pixel faria no desktop a dança que saiu do celular.

Dois consertos de toque no caminho: `overflow-x:clip` no body (um pixel
além da largura deixa a página inteira balançando para os lados, e o
scroll vertical ganha tremor diagonal) e `touch-action:manipulation`
nos botões (sem isso o toque espera 300ms pelo duplo-toque de zoom).

## Os guardas novos, e a sabotagem que me ensinou de novo

**O teste da dança** faz o que faltava: renderiza o lote 1, mapeia qual
card está em qual coluna, carrega o lote 2 e exige que **nenhum card já
colocado tenha mudado de coluna** — e que o lote novo de fato entrou,
porque estabilidade de uma tela que não cresceu não prova nada.

Aí sabotei a escolha da coluna — hash do conteúdo em vez da mais curta
— e o teste da dança **passou, com razão**: hash também é estável.
Estabilidade e equilíbrio são propriedades diferentes, e cada uma
precisa do seu teste. O segundo alimenta a distribuição com pesos
desenhados para denunciar — um card alto e três baixos — e exige que os
três baixos se acumulem longe do alto.

E o guarda de sistema: `quantasColunas` tem de usar **os pontos de
quebra do conjunto fechado** — sabotado com degraus inventados
(600/900/1300), acusou "dois sistemas de novo".

## Sabotagens

1. Coluna por sorteio estável → o teste da dança passou (certo!) e o de
   equilíbrio acusou.
2. Peso aleatório → acusaram os testes de estabilidade de proporção.
3. Uma coluna no telefone → acusou três vezes.
4. Degraus fora do sistema → acusou nomeando o defeito.

**11 roteiros, 0 falhas.**

Para ver no ar: `ENVIAR-E-TESTAR.command`, como sempre.
