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
