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
