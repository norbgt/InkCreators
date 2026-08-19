# 020 — Aba e toggle são coisas diferentes

19 de agosto de 2026

## O pedido

> "perdemos o componente de toggle que usávamos pra navegar entre as
> subabas e ficou ruim. volte com ele em todo o site"

## Eu tinha achatado uma distinção

Na decisão 012 eu converti o controle segmentado em sublinhado com um
argumento que parecia bom: *"existem três controles de aba no produto e
três espessuras diferentes inventam hierarquia entre perguntas iguais."*

Só que as perguntas **não eram iguais**.

| | o que promete |
|---|---|
| **aba** | outro destino. Você sai daqui e vai para lá. |
| **toggle** | o mesmo lugar, outro recorte. Você continua aqui. |

Quando os dois viraram sublinhado, essa diferença sumiu da tela. Um
controle que só recorta passou a parecer que levava embora — foi
exatamente o caso de *"Cliente · Galeria de arte · Tatuador"*: três
leituras da mesma página, com cara de três páginas.

Uniformizar não é o mesmo que simplificar. Eu apaguei um sinal
achando que estava tirando ruído.

## O que voltou, e o que não

**Voltou:** o trilho com fundo próprio, a peça ativa preenchida e
recortada dele, o raio de pílula. É o que faz um segmentado dizer "você
está aqui" sem sombra empilhada.

**Não voltou:** o vidro. Desfoque de 18px com saturação em 170% custa
GPU, travava a rolagem em telefone antigo e não tinha nada atrás para
desfocar — atrás de uma aba não passa foto. A guarda que impede o vidro
de voltar continua no lugar, e foi sabotada de novo para confirmar.

A peça ativa se marca por preenchimento e um traço, que é a gramática do
resto do produto.

## A regra, agora protegida nos dois sentidos

O diagnóstico antigo dizia "os três controles usam o mesmo traço". O
novo diz o contrário, e diz mais:

- **o toggle é pílula, não sublinhado** — se virar aba, deixa de dizer
  que você continua na mesma tela
- **a aba é sublinhado, não pílula** — se virar toggle, deixa de dizer
  que leva a outro lugar
- **`.subnav` e `.aba` continuam iguais entre si** — essas duas *são* a
  mesma pergunta
- **o trilho tem fundo próprio** — sem ele a peça ativa flutua sozinha e
  o conjunto volta a parecer aba

Três sabotagens: achatar o toggle, arredondar a aba, devolver o vidro.
As três acusaram.

## O que fica de lição

A guarda anterior estava *correta sobre o código e errada sobre o
produto*: ela media que três componentes eram iguais, e o que precisava
ser medido era que dois deles são diferentes de propósito.

Verificação que congela a decisão errada é pior que verificação
nenhuma — ela defende o erro.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
