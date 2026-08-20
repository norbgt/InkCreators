# 039 — Conhecer, na gramática do portfólio

20 de agosto de 2026

## O pedido

> "se inspire na estrutura do meu portfolio (cases.html), considerando
> alinhamento à esquerda, espaçamento, correr horizontal dos cards.
> garanta consistência com a plataforma mas aqui podemos ter uma
> estrutura com interações próprias"

## O que veio do cases.html

Li a página publicada e trouxe a estrutura, não a aparência: cabeçalho
**à esquerda** (kicker → título grande → uma linha de contexto → ações),
seções tituladas com **contador 01 / 04**, e os cards **correndo na
horizontal** em vez de empilhar.

A leitura ganhou dois eixos com papéis distintos: **vertical troca de
assunto, horizontal explora um assunto**. Numa página editorial — e
Conhecer é vitrine, não ferramenta — isso encurta a rolagem sem
esconder nada.

## As decisões de desenho

**O trilho sangra até a borda.** Margem negativa do gutter, de
propósito: o card cortado no fim do quadro é o convite de rolagem que
dispensa seta.

**Snap por card, barra escondida, contador no lugar dela.** O `01 / 04`
atualiza no scroll — a mesma linguagem do seu portfólio — e é quem diz
onde você está.

**Consistência com a plataforma:** tudo em tokens (espaçamento, tipo,
raios, `--gutter`); o toggle de perfis é o padrão; os cards são os
mesmos `.card`. A interação própria é só o trilho — permitida aqui e
apenas aqui, como você definiu.

**O centrado morreu.** `.blococentro`, `.acoescentro` e
`.segmento.centrado` ficaram órfãos e saíram — CSS sem elemento é o
defeito que já cegou este produto uma vez (o feed de uma coluna). O
guarda inverteu: agora acusa se o centrado *voltar*.

## Nada se perdeu

Todas as frases da página — ecossistema, vantagens por perfil, passos,
cobranças, o que não é cobrado — continuam idênticas; mudou a
arquitetura, não o texto. `nada-se-perdeu` verde.

## Guardas novos

Cada trilho tem contador **com o total certo** (contador que promete 04
sobre um trilho de 3 é a mentira pequena que mina confiança — e o teste
compara card a card); o trilho corre na horizontal com snap; o
sangramento existe; a página alinha à esquerda; o `onscroll` está
ligado.

## Sabotagens

1. Trilho de volta a pilha → acusou.
2. Contador mentindo o total → acusou três vezes, com os números.
3. Scroll sem contar → acusou: *"interação prometida e não ligada"*.
4. Sangramento removido → acusou.

**11 roteiros, tudo verde por código de saída.**

---

## Adendo: o que o print dela consertou

> "elementos estão desalinhados, cards podem ser menores. verifique
> sobreposições, retire conteúdo redundante, deixe a arquitetura mais
> simples e verifique responsividade"

### O desalinhamento tinha nome: scroll-padding

O snap alinha o card à borda do **scrollport** — e o scrollport ignora
o padding visual do trilho. Sem `scroll-padding`, o snap puxava o
primeiro card para debaixo da borda da tela, desalinhado do próprio
título da seção. Uma linha resolve, e o guarda impede a volta.

### Os cards de 600px tinham nome: flex-basis com min()

`flex: 0 0 min(280px, 76vw)` falha em motores mais velhos — a função
dentro do shorthand não parseia, a base cai em `auto`, e o card estica
até o conteúdo. Era o cartão gigante do print. Largura agora vive em
`width`, e **menor**: 230px no telefone, 250 no desktop — o card
carrega três linhas, não um parágrafo.

### A redundância retirada

O CTA era um cartão inteiro repetindo o título que está dois blocos
acima ("O lugar de quem gosta de tatuagem" aparecia duas vezes na
mesma tela). Ficou só a ação. A pergunta "E para você…" virou etiqueta
da seção, e o toggle desceu para a própria linha — sem a disputa de
espaço do print.

### Sobreposições e responsividade

Varridas: nenhum elemento fixo entra nesta página (a classe do modal
tem guarda desde a 037), e o trilho mede 72vw no telefone, 250px fixos
de tablet para cima — app, tablet e desktop pelos mesmos pontos de
quebra do sistema.

### Sabotagens do adendo

5. scroll-padding removido → acusou: *"o print dela"*.
6. flex-basis com min() de volta → acusou.
7. Cartão redundante de volta → acusou: *"2 vezes"*.
