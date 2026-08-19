# 024 — Consistência, medida

19 de agosto de 2026

## O pedido

> "garanta consistência entre todo o site. garanta componentes, conteúdo
> e espaçamentos considerando as melhores práticas de UX/UI e a
> responsividade entre app/tablet/desktop"

## "Garantir" por inspeção não existe

Ninguém relê seis mil linhas procurando um 11px que devia ser 12.
Consistência se garante contando — e contando de novo depois, senão ela
se desfaz sozinha.

Então medi antes de tocar em qualquer coisa.

## O que a medição achou

### Espaçamento: 25 valores, 708 lugares

```
margin-top     564 ocorrências, 25 valores
  2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 22 24 26 34 40 44
gap            103 ocorrências, 11 valores
padding         31 ocorrências, 11 valores
margin-bottom   10 ocorrências,  7 valores
```

**A diferença entre 11 e 12px não é perceptível e não foi
intencional.** Nenhum desses valores foi decidido: cada um foi escolhido
sozinho, no dia em que aquele bloco nasceu.

O que isso produz não é feiura, é ruído. Dois blocos que deveriam
parecer irmãos parecem **quase** irmãos — e "quase" é o que faz uma tela
parecer torta sem que ninguém consiga apontar onde.

**Seis degraus agora:** `4 · 8 · 12 · 16 · 24 · 40`, e nada entre eles.
708 valores mapeados nos seis. Zero px escrito à mão no render.

### Pontos de quebra: dois sistemas convivendo

Os pontos foram escolhidos nos **vãos entre larguras de aparelho**, para
que nenhuma quebra caia no meio de um modelo comum: 400, 460, 560,
699/700, 1100.

E eu mesmo furei isso ao mexer no feed, criando **820 e 1080** ao lado
deles. Dois sistemas, sem que ninguém tivesse decidido. Corrigido para o
conjunto existente.

O par **699/700** é um ponto só escrito dos dois lados — `max-width:699`
para baixo, `min-width:700` para cima. Sem ele, um aparelho de
exatamente 700px cai nas duas regras ou em nenhuma. Existe um teste
para o par.

### O que já estava consistente

Duas coisas que a medição confirmou em vez de acusar:

**As duas setas têm trabalhos distintos.** `›` entra num item de lista
("ver perfil ›", "participar ›"); `→` sai para outra vista ("Ver todos
→", "Continuar →"). Não mexi.

**O alvo de toque.** `@media(pointer:coarse)` já levava os componentes
a 44px — o mínimo da Apple, e perto dos 48dp do Google.

## O roteiro novo

`diagnostico/consistencia.js` conta cinco coisas:

1. **espaçamento** — nenhum px à mão, escala com exatamente seis degraus
2. **pontos de quebra** — nenhum fora do conjunto, e o par 699/700 nos
   dois sentidos
3. **alvo de toque** — a regra existe e chega a 44px
4. **componente por trabalho** — aba e aba iguais entre si, toggle
   diferente de aba, um cartão de número, uma linha de lista, nenhum
   raio inventado
5. **moldura** — uma largura máxima, uma margem lateral fluida

**Cada número foi medido antes de virar limite.** Nenhum é arbitrário:
são o estado real do produto no dia em que a entropia foi cortada.

## Duas sabotagens que passaram

**Um sétimo degrau.** Meu regex procurava `--e[1-6]`, então `--e7:64px`
escapava e a escala crescia sem ninguém notar. O teste media **o que eu
esperava, não o que existe**.

**Um px à mão.** Sabotei o primeiro `margin-top:var(--e3)` do arquivo, e
ele estava no CSS — que o teste não varre de propósito, porque ali os
valores são declarações de componente. A sabotagem tinha que ser dentro
do render, e foi.

As duas viraram correção. Cinco sabotagens no total, cinco acusações.

**11 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
