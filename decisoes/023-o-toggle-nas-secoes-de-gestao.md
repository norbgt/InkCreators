# 023 — O toggle nas seções de gestão

19 de agosto de 2026

## O pedido

> "adote o toggle que definimos para as subabas para tentar simplificar
> a disposição das seções parte de cada aba, de modo que a experiência
> seja menos vertical nas áreas de gestão"

## Isto desfaz a decisão 014, e o motivo importa

Na 014 as sub-abas viraram seções empilhadas, com este argumento:

> "num painel de gestão rolar é mais barato que esconder — e comparar
> duas coisas exige vê-las juntas, o que sub-aba impede por construção"

**O argumento continua verdadeiro. Ele só não escala.**

Com duas ou três seções, a página empilhada é melhor: você vê o
conjunto, compara sem clicar. Com sete — que foi onde a Visão geral do
tatuador chegou — ela vira uma parede de dois metros, e o custo de rolar
passa a ser maior que o de um clique.

Eu apliquei uma regra boa sem medir onde ela para de valer.

| aba | antes | depois |
|---|---|---|
| Visão geral | 18.348 caracteres | **8.182** |
| Agenda | ~10.000 | **4.221** |
| Cursos e eventos | ~6.400 | **4.581** |

## O que o toggle faz que a rolagem não fazia

**Ele diz quantas partes a aba tem.** Numa página que rola, você só
descobre o fim chegando nele — não há como saber, ao entrar, que Visão
geral tinha quatro assuntos. O trilho mostra os quatro de uma vez.

**Ele leva a qualquer parte sem percorrer as outras.**

E é o mesmo componente que você pediu de volta na decisão 020, pela
mesma razão: ele diz *"você continua aqui, vendo de outro jeito"* — que
é exatamente o que uma seção é.

## Duas pontes voltaram a fazer sentido

Com as seções empilhadas, eu tinha tirado a prévia dos "Últimos
lançamentos" do resumo do caixa: a tabela completa estava logo abaixo, e
a prévia era a mesma lista duas vezes.

Com o toggle, Lançamentos é **outra vista**. A prévia volta a ser o que
sempre foi: uma ponte, com "Ver todos →" levando à vista cheia.

O inverso também: agora a tabela de Lançamentos não repete o "De onde
veio" do resumo, e existe um teste para cada lado.

## Uma função que perdeu o trabalho, e ficou

`naPrimeiraSecao()` existia porque a página era renderizada uma vez por
seção, e o preâmbulo — banner de convite, aviso de área em estudo —
saía repetido. Com o toggle existe uma renderização por visita, e o
preâmbulo pertence à aba inteira: tem de aparecer em qualquer recorte.

Ela passou a devolver `true` sempre, e **as chamadas continuam onde
estão**. Se as seções voltarem a empilhar, o problema volta junto e é
ali que se resolve — apagar a função obrigaria a redescobrir o defeito.

## O que a montagem precisa garantir

**A escolha persiste**, e isso agora é o comportamento certo: quem
estava em Lançamentos e sai espera voltar em Lançamentos. Empilhado
isso não existia.

**Escolha inválida cai na primeira.** A arquitetura mudou várias vezes
esta semana; um valor guardado no `localStorage` que não é mais seção
daria tela vazia com o toggle sem nada marcado.

**A bandeira de montagem sempre volta.** `montandoSecoes` cala as barras
internas enquanto a página é montada — se ela ficar levantada porque uma
tela estourou, as barras somem do **produto inteiro**. Um erro numa aba
apagaria a navegação de todas.

## Um teste meu que sumiu na reescrita

A verificação da bandeira desapareceu quando reescrevi a seção de
arquitetura — o recorte que substituiu o bloco antigo levou junto uma
linha que ainda servia. Descobri porque a sabotagem 3 **passou**, e
sabotagem que passa é a única forma de saber que a guarda evaporou.

Reescrever verificação é tão perigoso quanto reescrever produto, e pela
mesma razão: o que se perde não faz barulho.

## Sabotagens

1. Seções voltando a empilhar → acusou nas quatro abas.
2. Escolha inválida sem correção → acusou a tela vazia.
3. Bandeira sem `finally` → passou na primeira vez; acusou depois de a
   guarda voltar.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
