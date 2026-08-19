# 021 — A grade precisava ser vista

19 de agosto de 2026

## O pedido

> "deixe as fotos do feed menores, não vi refletir a ideia de grade no
> feed, que sustenta mais de uma foto por vez como referência do
> pinterest"

## A grade existia — e eu tinha provado que existia

Os diagnósticos confirmavam: cards em grade no feed, quatro células,
nove células, filtro funcionando, estáveis entre repinturas. **Todos
verdes.**

E você não viu.

Porque nenhum deles perguntava a coisa certa. Eles mediam *existência*;
o que importava era *visibilidade*. Três causas, todas mensuráveis, e
nenhuma medida:

**1. Uma só no primeiro lote.** Grades a cada cinco cards, num lote de
oito — a primeira caía na posição 5, perdida no meio de uma coluna do
masonry.

**2. A primeira era a de quatro células**, que parece um card com quatro
fotos. A de nove é a que se lê como grade à primeira vista, e ela só
aparecia no segundo lote, depois de rolar.

**3. Sem etiqueta**, um mosaico de nove se confunde com nove cards
vizinhos. O masonry já é feito de fotos justapostas — um bloco de fotos
justapostas dentro dele não se distingue de nada.

## O que mudou

| | antes | depois |
|---|---|---|
| grades | a cada 5 cards | **a cada 3** |
| a primeira | 4 células | **9 células**, na posição 3 |
| etiqueta | só "+N" na de portfólio | **"N trabalhos"** nas duas |
| colunas | 1 / 2 / 3 / 4 | **2 / 3 / 4 / 5** |
| vão | 14px | **10px** |

**Duas colunas viraram o piso.** Havia um `column-count:1` abaixo de
400px: ali cada rolagem mostrava um trabalho e o feed virava uma fila —
o oposto de um feed de descoberta, onde o que conta é quantos trabalhos
diferentes a pessoa vê antes de decidir parar.

## As guardas que faltavam

Quatro verificações novas, escritas para o que você não viu — não para o
que eu tinha construído:

- **pelo menos duas grades no primeiro lote**
- **a primeira delas é a de nove células**
- **aparece cedo, não no fim do lote** (posição ≤ 5)
- **toda grade se anuncia como conjunto** (contagem de etiquetas ==
  contagem de grades)
- **o feed nunca cai para uma coluna**

Sabotadas uma a uma. A primeira acusa com a sequência desenhada:
`.....9...` — dá para ver o problema no relatório.

## A lição

Os testes anteriores estavam certos e inúteis ao mesmo tempo. *"Existe
uma grade no feed"* é verdade e não responde *"a pessoa encontra a
grade?"*.

É o segundo caso nesta semana em que uma verificação verde escondeu um
problema real — o primeiro foi o QR que existia mas não cabia na linha.
Os dois têm a mesma forma: **medi presença, e o defeito era de
posição, frequência ou tamanho.**

Presença é a mais fácil de medir e a menos parecida com o que a pessoa
vive.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
