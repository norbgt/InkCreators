# 038 — A estética Pinterest virou invariante

20 de agosto de 2026

## O que aconteceu

Meu conserto da dança (decisão 036) parou os cards de se moverem — e
matou o ritmo. A sonda estrutural confirmou o que você viu: **as duas
grades caíram na mesma coluna e a outra levou cinco posts seguidos.**

"Coluna mais curta por peso estimado" é o algoritmo do Pinterest de
verdade — mas com pesos estimados e poucos cards, ele aglomera. E o
Pinterest que você pediu não é só altura variada: é a **alternância** —
o olho lê em ziguezague, vizinho na sequência é vizinho na tela.

## A correção: ziguezague estrito

A peça `i` mora na coluna `i % n`. Três coisas de graça: a ordem de
leitura fica previsível, as colunas ficam com a mesma contagem, e a
estabilidade é trivial — o índice de uma peça nunca muda, então lote
novo não move ninguém. A dança continua morta.

As grades passaram a entrar depois de 3 posts, depois de 4, alternando
— intervalo constante par faria toda grade cair sempre na mesma coluna.

## "Garanta que isso não mais aconteça"

A estética deixou de ser gosto e virou **cinco propriedades medidas**:

1. ziguezague — testado com peças de tamanhos muito diferentes;
2. contagem igual entre colunas (±1);
3. proporções variadas dentro de cada coluna;
4. grades nunca acumuladas numa coluna;
5. e o contraste com a loja — grade regular lá, masonry aqui — é
   exatamente o que diferencia os dois ambientes, e ambos têm guarda.

## Sobre a loja

O fio entre as linhas da lista está no commit **ainda não publicado**
(decisão 037) — o que você viu no ar é a versão sem ele. Sobe no
próximo `ENVIAR-E-TESTAR.command`.

## As três mentiras que esta rodada desmontou

Esta é a parte que vale mais que o conserto.

**1. Meus guardas novos dormiram nas duas primeiras sabotagens.** O
teste de ziguezague usava cinco peças iguais — e qualquer esquema por
peso reproduz ziguezague quando os pesos empatam. Refeito com uma peça
enorme na frente. E o teste das grades procurava `class="postgrade`
quando a classe real é `post postgrade`: achava zero grade, e total
zero pulava o teste inteiro.

**2. Meu laço de verificação lia crash como verde.** Ele contava linhas
`XX` — e um roteiro que quebra no meio imprime zero XX. Uma variável
órfã derrubou o script inteiro e eu li "0 falhas". Nasceu
`diagnostico/rodar-todos.command`, que julga pelo **código de saída**:
roteiro que morre antes de medir não é roteiro que passou.

**3. `fluxos.js` só funcionava da raiz.** Caminho relativo — rodado de
qualquer outro lugar, quebrava. Corrigido para `__dirname`, como os
outros dez.

## Sabotagens (depois dos consertos dos guardas)

1. Volta a coluna-mais-curta → acusou duas vezes.
2. Grades em período constante → acusou: *"2 grade(s), todas na mesma
   coluna"*.
3. Ziguezague com ordem trocada (i*2 % n) → acusou três vezes.

**11 roteiros, tudo verde — e verde de verdade, por código de saída.**
