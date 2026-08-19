# 017 — Cinco abas, e o botão que não cabia

19 de agosto de 2026

## Os dois pedidos

> "ambiente do tatuador com abas: visão geral, orçamentos, agenda,
> reputação, cursos e eventos. garanta que não temos redundâncias"
>
> "o qr code por sessão sumiu e não encontro na agenda"

## O QR não sumiu — ele não cabia

O botão estava lá, no HTML, com o índice certo. **A pessoa não conseguia
ver.**

`.lrow` é `display:flex` sem `flex-wrap`, e eu tinha posto dois botões
onde havia um. Num telefone de 393px a linha tem caixa de data, nome,
área, duração, preço, "Detalhes" e "Gerar QR" — o último é empurrado
para fora da vista.

**Sumir em silêncio é o pior jeito de sumir.** A pessoa não vê erro
nenhum; conclui que a função não existe.

Pior: o botão que roubava a largura era **"Detalhes", que nunca teve
`onclick`**. Não fazia nada desde que nasceu, e estava ocupando o espaço
do único botão daquela linha que funciona.

Três correções, cada uma com guarda própria:

- "Detalhes" saiu — botão morto não disputa largura
- `.lrow` ganhou `flex-wrap`, e abaixo de 460px a ação ocupa a linha
  inteira
- uma ação por sessão, verificado: dois botões competem, e o segundo é
  o que some

Sabotei tirando o `flex-wrap`: acusou.

## Cinco abas

| aba | seções |
|---|---|
| **Visão geral** | painel · dinheiro · lançamentos · quem eu tatuei |
| **Orçamentos** | recebidos · enviados |
| **Agenda** | o mês · check-in de agora · conexões |
| **Reputação** | avaliações · desempenho · onde eu tatuei |
| **Cursos e eventos** | que eu criei · que eu participo |

Orçamentos voltou a ter porta própria, e há uma razão além do seu
pedido: é **o único lugar da gestão com um fluxo de três passos dentro**
— mapa, pedido, proposta. Fluxo com passos não convive com página que
rola, porque a pessoa perde de vista em que passo está. Dinheiro fica
na Visão geral, porque é leitura.

## A auditoria de redundância

Medida, não olhada. Duas perguntas, feitas em código:

**Alguma frase aparece em duas abas?** Comparei o texto das cinco abas
par a par, frases acima de 30 caracteres. **Nenhuma.**

O mesmo *dado* aparecer em várias abas não é redundância: Helena Duarte
está em Visão geral, Orçamentos, Agenda e Reputação porque é uma cliente
com um orçamento, uma sessão e uma avaliação. É a mesma pessoa vista por
quatro lentes.

**Algum cartão do painel repete o que está logo abaixo?** Um: **"Sobrou
R$ 3.135"**, com a seção Dinheiro repetindo o mesmo número com as mesmas
palavras duzentos pixels adiante.

Cartão que repete o que está logo embaixo não resume nada — faz a pessoa
ler duas vezes e desconfiar de qual dos dois vale. Saiu, e a regra que
ficou é uma frase:

> **O painel só guarda cartão que leva para FORA desta página. O que
> mora aqui se lê rolando.**

## O medidor que acusou tudo

A primeira versão dessa verificação comparava os números soltos. Acusou
**oito repetições onde havia zero**: "2", "5", "1" aparecem em qualquer
lugar de uma página de gestão.

E a medição manual anterior tinha acusado "Avaliação 4.8" — que era
pedaço de "R$ 4.890".

As duas falhas têm a mesma causa: comparar fragmento em vez de unidade.
A verificação passou a procurar o **par rótulo+valor junto**, que é o
formato em que a repetição de verdade aparece. Sabotada devolvendo o
cartão: acusou *"Sobrou R$ 3.135"*, e só ele.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
