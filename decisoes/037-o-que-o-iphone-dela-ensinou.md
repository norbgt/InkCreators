# 037 — O que o iPhone dela ensinou

20 de agosto de 2026

Cinco defeitos vistos em prints reais de navegação no celular. Cada um
corrigido, cada um com guarda para não voltar, e cada um varrido no
resto do produto.

## 1. A sobreposição — uma classe, dois trabalhos

O mais sério, e o mais invisível no código. Dois botões do painel
("Falta reivindicar o seu estúdio" e o convite do check-in) usavam a
classe `.convitecx` — que é o **modal de tela cheia** do teste, com
`position:fixed; inset:0; z-index:901`.

Os botões herdavam o fixed: o texto deles flutuava **por cima do
cabeçalho da página inteira**, exatamente como nos seus prints. No
desktop o acaso do layout disfarçava; no telefone, não.

Nasceu `.convitecard` — o cartão-convite de dentro da página, com cara
própria. O modal continua `.convitecx`. **Uma classe, um trabalho** — e
o guarda agora proíbe qualquer botão de vestir a classe do modal.

Varredura no resto: nenhuma outra classe de posição fixa
(`.qrjanela`, `.drawer`, `.scrim`, `.convitebarra`) é usada fora do seu
papel.

## 2. A lista da loja sem separação

Quando o card do produto virou o componente do feed (decisão 032), ele
perdeu a moldura — certo para a grade, onde a foto separa. Em lista não
sobra foto grande, e as linhas **encostavam umas nas outras**.

O que separa lista neste produto é o fio, e agora a lista da loja o
tem: `padding` vertical e `border-bottom` de um traço, como toda lista.

## 3. "Entrar ou criar conta" → "Entrar"

O botão preto comia metade do cabeçalho do telefone. "Entrar" diz o
mesmo — quem não tem conta descobre na tela seguinte, que oferece as
duas portas.

## 4. Os cartões de número em uma linha

`minmax(145px)` punha dois por linha no telefone e o terceiro caía
sozinho na segunda, com o vão à direita que você apontou. Mínimo agora
é 100px — os três cabem em 393px — e o cartão perde um pouco de
gordura interna no telefone. Vale para as **seis** telas que usam a
faixa de números, não só para "Quem eu tatuei".

## 5. As seções do perfil no toggle padrão

"Informações · Portfólio · Tabela de preços · Instagram" eram chips
soltos — o componente de **filtro** — fazendo papel de seção. Quatro
fatias do mesmo lugar é exatamente o trabalho do toggle, e o padrão da
decisão 012 vale aqui como em toda parte. Ele rola na horizontal
quando as quatro não couberem.

## O sexto pedido é de outro repositório

Os prints do "Cash-out experience" são do seu **portfólio pessoal**
(norbgt.github.io, raiz) — outro repositório, que não está nesta pasta.
Não tenho como mexer nele daqui. Dois caminhos: você adiciona a pasta
do portfólio a esta área de trabalho e eu faço (status e empresa abaixo
de tipo/ano em cinza; espaçamento do bloco de results), ou te passo o
CSS pronto para colar.

## Sabotagens

1. Botão vestindo o modal de novo → acusou.
2. Fio da lista removido → acusou.
3. Rótulo crescendo → acusou.
4. Stats de volta a 145px → acusou com o número.
5. Perfil de volta a chips → acusou.

**11 roteiros, 0 falhas.**
