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

---

## Segunda parte: o cartaz, o teto de quatro, e o toggle de estúdios

> "temos uma grade com fotos que variam de tamanho. no celular, vemos
> duas colunas, em desktop podemos ver até 4 colunas"
>
> "o feed tem um toggle que define 'tatuadores' ou 'estúdios'"

### O que faltava na estética, dito pela referência

A sua imagem do Pinterest mostrou o que o ziguezague sozinho não dava:
**o canto**. Lá a foto é o card e o raio generoso é a moldura dela; aqui
o feed usava `--r-sm` — 4px, o canto de campo de formulário.

O sistema de raios ganhou o quarto valor, com papel escrito:

> `--r-foto: 16px` — fotos do feed e mosaicos de **descoberta**. Só. A
> loja fica no `r-sm` de propósito: canto pequeno e grade regular são o
> que diferencia catálogo de feed, e o contraste tem teste dos dois
> lados.

O portfólio do perfil acompanha (é a mesma decisão do feed, mesma
`proporcaoDaFoto`); a loja não.

### Quatro colunas no teto

O quinto degrau saiu: `2 → 560px → 3 → 700px → 4`, e para. Acima de
quatro a foto encolhe além do que descoberta aguenta em desktop. Os
guardas de degraus foram atualizados junto.

### O toggle de estúdios

Duas fatias do mesmo lugar — o trabalho do toggle padrão. O card do
estúdio usa a **mesma gramática** do feed (masonry, cartaz, pé de duas
linhas), porque é o mesmo feed; o que muda é o sujeito, e as linhas do
pé respondem o que se pergunta de um **lugar**: cidade, cadeiras, desde
quando — e no hover, higiene medida e residentes. O card inteiro leva à
página do estúdio.

### Sabotagens desta parte

4. Cartaz removido do feed → acusou.
5. Loja herdando o cartaz → acusou: *"sumiu o contraste"*.
6. Quinto degrau de volta → acusou duas vezes.
7. Card de estúdio sem porta (as duas) → acusou.
8. Toggle sem a fatia de estúdios → acusou.

**11 roteiros, tudo verde por código de saída. 702 frases, nenhuma
perdida.**

---

## Terceira parte: o engessado tinha três camadas

> "a grade do feed continua engessada sem a ideia de visualização no
> modelo de grid do pinterest"

Antes de mexer, medi: uma simulação com as alturas reais mostrou que as
colunas **já** se desencontravam (mediana de 204px) — o engessado não
era a estrutura. Era percepção, e percepção tem causas físicas:

**1. Variação tímida de proporção.** Cinco proporções, vão de 1,0 a
1,67 — variações do mesmo card. Entrou o **pin alto** (9/16) e o médio
(5/7): vão de 1,78, que é o que dá ao Pinterest a cara de Pinterest.

**2. O topo era uma régua.** O primeiro par de cards nascia na mesma
linha — e o primeiro olhar decide se aquilo é grade ou fluxo. As
colunas pares descem um degrau (`--e6`): o desencontro começa na
primeira dobra, não depois de rolar.

**3. Toda foto tinha a mesma luz.** As texturas de demonstração usavam
cinco cinzas médios — o feed lia como bloco único mesmo com alturas
variando. Sete tons agora, do quase-preto ao quase-branco: foto de
verdade varia de luz, e a demonstração precisa variar junto.

E o aperto do Pinterest: vãos de 10px para 8px.

Guardas para as três camadas; sabotagens acusadas nas três.

*Se ainda ler como grade depois desta rodada, o próximo suspeito são as
próprias texturas procedurais (listras e círculos regulares demais) — e
aí vale um print do que você vê, porque é onde meu olho de máquina não
alcança.*
