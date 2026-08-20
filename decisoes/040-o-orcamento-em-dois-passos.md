# 040 — O orçamento em dois passos

20 de agosto de 2026

## O pedido

> "o fluxo de orçamento tem 2 passos e começa sempre igual, com as
> informações mais básicas sobre a tatuagem; no segundo passo um campo
> de busca que filtra as recomendações de tatuadores abaixo, com
> informações adicionais e decisões sobre o tipo de orçamento; por fim
> a conclusão de que a solicitação foi enviada"

## Passo 1 — a tatuagem, e sempre a mesma pergunta

O padrão dos cinco campos (referência, estilo, tamanho, parte do corpo,
cidade) já existia; o que mudou é a **invariância**: o passo 1 é
idêntico venha a pessoa de onde vier. O banner "Orçar com Fulana" saiu
— o passo 1 pergunta sobre a *tatuagem*, e tatuagem não muda conforme a
porta de entrada. A cidade deixou de se pré-preencher com a do artista
pelo mesmo motivo.

O guarda disso é literal: renderiza o passo 1 com e sem artista de
origem e exige igualdade **bit a bit**.

## Passo 2 — para quem vai

Abre com **recomendações automáticas** — quem faz aquele estilo,
naquela cidade — cada uma com estilos, cidade, distância, nota,
avaliações e faixa de preço, e o botão de tirar/incluir de sempre.

Em cima, o campo **"Tem alguém em mente?"**: digitou, a lista filtra
por nome ou estúdio. Quem veio de um perfil chega com o nome
**pré-preenchido** — vê a pessoa que escolheu no topo e as alternativas
embaixo, em vez do beco de opção única que existia antes (o atalho que
restringia a lista a um só artista morreu). Busca sem dono explica e
ensina a sair: *"Apague a busca para ver as recomendações."*

E a decisão dela sobre o **tipo de orçamento**: valor fechado, por
hora, ou conversar antes — vai junto do pedido, para quem responde
saber o que a pessoa espera receber.

## Conclusão

"Pedido enviado para N tatuadores" — o N real, contado dos que
sobraram após busca e poda; para um só, o nome.

## Sabotagens

1. Banner do artista de volta ao passo 1 → acusou (igualdade bit a bit).
2. Perfil sem pré-preencher a busca → acusou.
3. Busca que não filtra → acusou duas vezes.
4. Decisão de tipo removida → acusou duas vezes.

**11 roteiros, tudo verde por código de saída.**

---

## Adendo: a porta que o dedo clica

> "o fluxo de orçamento segue sem refletir os ajustes… corrija esse
> erro de atualização de uma vez por todas"

O carimbo do seu print provou o que mudou de natureza no problema:
**v. 20/08 20:42 — você estava na versão nova.** Não era atualização;
era uma porta que eu nunca tinha redesenhado.

### O passo zero disfarçado

O botão **✨ Orçamentos** abria um *menu* de três opções ("Novo pedido /
Pool aberto / Para você") **antes** do passo 1. Menu antes do pedido é
um passo zero disfarçado — contra a sua definição de dois passos que
começam sempre igual.

Meus roteiros nunca o viram por um vício de método: **todos entravam
pela porta lateral** (`S.drawer='assist'` direto), nunca pela porta que
o seu dedo clica.

### O que mudou

- O ✨ (e o "Novo orçamento" de Meus orçamentos) abre **direto o passo
  1**, limpo.
- O menu morreu. As duas ideias boas dele — **Pool aberto** e **Para
  você** — não morreram: viraram conteúdo de "Meus orçamentos", onde
  são tela e não pedágio, com o texto palavra por palavra.

### O guarda que ataca a raiz

O novo teste **entra pela porta real**: extrai o `onclick` do botão
renderizado, executa exatamente o que o dedo executaria, e exige que o
que abre seja o passo 1 — sem menu no caminho. As duas portas são
testadas. É o mesmo princípio do carimbo: parar de supor o que a pessoa
vê, e medir.

*(E o extrator do botão caiu na pegadinha conhecida: o ✨ vira SVG no
render, então procurar "✨ Orçamentos" acha nada. Acha-se o fecho e
recua-se até a abertura — quinta vez que um extrator aprende isso.)*

### Sabotagens

5. O menu de volta na porta real → acusou.
6. Porta com destino trocado → acusou.
