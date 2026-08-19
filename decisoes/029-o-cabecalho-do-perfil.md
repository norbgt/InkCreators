# 029 — O cabeçalho do perfil

19 de agosto de 2026

## O pedido

> "melhore a distribuição e a arquitetura do header do perfil de cada
> tatuador"

## O defeito mais caro: quatro botões sem uma palavra

O cabeçalho tinha quatro caixas grandes com só um ícone dentro — um ✨
preto, um calendário, um balão e um tique. **Nenhuma palavra.**

Ícone sozinho só funciona com vocabulário universal: fechar, buscar,
voltar. *Pedir orçamento* não tem ícone universal — e era exatamente a
ação que sustenta o negócio, escondida atrás de uma estrelinha.

Havia `title=` e `aria-label=` nos quatro. Isso resolve para leitor de
tela e **não resolve para quem enxerga**: no toque não existe hover, e o
`title` nunca aparece.

## A ordem, agora

**quem é → o que dizem → o que fazer → sobre → onde atende**

| | antes | depois |
|---|---|---|
| estilos | depois dos selos, longe do nome | junto do nome, que é o que descrevem |
| linha da nota | `4.2 (12) · 2 anos · $$$$$ por hora` | `4.2 (12 avaliações) · 2 anos de ofício` |
| preço | solto, competindo com a nota | **dentro do botão de orçar** |
| selos | seis pastilhas em duas linhas | três + contador que leva à regra |
| ações | quatro ícones de peso igual | **uma principal + três com rótulo** |
| bio | `<details>` fechado | parágrafo sempre visível |

**O preço encostou na decisão.** Solto na linha da nota, ele competia
sem ajudar; dentro do botão, ele é a informação que a pessoa precisa no
momento exato em que vai clicar.

**Os selos estavam com mais peso visual que o nome.** Seis pastilhas
verdes em duas linhas. Três ficam; o resto vira `+3 e como se ganham ›`,
que leva à aba de Reputação — onde cada um aparece com a regra que o
produziu, porque selo sem regra visível é fé, não confiança.

**O `<details>` saiu.** Parágrafo de duas linhas atrás de um clique é
parágrafo que ninguém lê — e o triângulo era o único componente do
produto desenhado pelo sistema operacional, não por nós.

## Quatro roteiros usavam uma marca frágil

`convite-do-teste`, `visitante-no-teste`, `prontidao-do-teste` e o
`nada-se-perdeu` verificavam "o perfil abriu" procurando a frase
**"Sobre o tatuador"** — o resumo do `<details>`.

Ela morreu junto com o componente, e três testes que não tinham nada a
ver com o cabeçalho começaram a falhar. A marca passou a ser
`class="perfilnome"`, que não depende de nenhum componente sobreviver.

## O teste que nunca poderia acusar

Escrevi *"nenhuma ação do perfil é só ícone"* e ele passou verde na
sabotagem. **Dois defeitos empilhados no meu regex:**

1. A janela de 80 caracteres não alcançava um botão cujo ícone vira
   SVG no render — passa de 400. Esses botões nem eram encontrados.
2. A captura trazia os **atributos** junto. Depois de tirar as tags,
   sobrava o texto do `onclick` — e todo botão "tinha letras" por causa
   do próprio código.

Agora ele lê só o miolo. Sabotado, acusa: *"1 botão(ões) sem palavra
nenhuma"*.

Quarta vez nesta semana em que o verificador estava errado e parecia
que o verificado estava certo.

## Sabotagens

1. Botões voltando a ser só ícone → acusou.
2. Duas ações principais → acusou.
3. Oito selos no cabeçalho → acusou, e o contador denunciou a conta
   aberta.
4. Bio de volta ao `<details>` → acusou.

**11 roteiros, 0 falhas. 702 frases, nenhuma perdida.**
