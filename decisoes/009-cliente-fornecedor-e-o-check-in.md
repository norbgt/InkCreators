# 009 — Cliente, fornecedor e o check-in que liga os dois

28 de julho de 2026 · **início do refinamento de cliente e fornecedor**

Até aqui o produto estava maduro de um lado só. Tatuador tinha gestão,
orçamento, caixa e histórico; cliente e fornecedor tinham telas. Esta é
a rodada em que os outros dois lados ganham proposta de valor própria.

---

## A peça central: check-in por QR

Na hora em que a pessoa senta, o tatuador abre um check-in e mostra um
QR. Ela escaneia — ou digita seis letras, porque câmera falha. A partir
daí a sessão existe para os dois.

Isso não é um recurso a mais. **É a única fonte de dado de sessão que
nasce confiável**, porque exige duas pessoas no mesmo lugar ao mesmo
tempo. Tudo o mais nesta rodada pendura nele:

| Para quem | O que o check-in produz |
|---|---|
| Cliente | Carimbo verificado no passaporte — a diferença entre dizer que tatuou com alguém e ter isso confirmado |
| Tatuador | Reputação que não se compra, e um relógio honesto: quanto tempo aquele estilo leva de verdade |
| Plataforma | Registro de sessão que não depende de ninguém preencher formulário depois |

A duração medida é o dado mais subestimado dos três. Ninguém preenche
formulário depois de seis horas tatuando — e sem duração real, o preço
por hora continua sendo chute. Com algumas dezenas de sessões, a média
por estilo passa a valer mais que a estimativa do próprio tatuador.

**O código de seis letras não usa I, O, 0 nem 1.** São os caracteres que
viram engano quando alguém dita em voz alta, num estúdio barulhento.

---

## Cliente

### Confiança antes do orçamento

O card de cada tatuador mostra, **antes do botão de orçar**, a avaliação,
o número de sessões verificadas e a distância. A ordem é o argumento: se
a ação vem primeiro, a tela convida a pedir preço a quem a pessoa ainda
não avaliou.

Avaliação e sessão verificada dizem coisas diferentes, e as duas são
necessárias. Avaliação diz o que acharam. Sessão verificada diz que
aconteceu. Perfil compra elogio; não compra duas pessoas presentes.

### O passaporte, e a linha que eu não vou cruzar

Você pediu gamificação e eu levantei o risco: tatuagem é permanente, e
recompensar coleção empurra alguém a tatuar por ponto. Você respondeu
que não é competição entre clientes — é histórico. Foi o que construí, e
levei a sério:

- Marcos aparecem **depois** de acontecer, com a data da sessão que os
  produziu. Não existe "faltam dois estilos", não existe barra de
  progresso, não existe nível, não existe ranking.
- Sem comparação com outros clientes, em lugar nenhum.
- A tela diz isso em voz alta: *"Nenhum marco cobra o próximo."*

Isso está protegido por teste. `diagnostico/cliente-e-fornecedor.js`
varre o HTML renderizado procurando oito padrões de linguagem de meta —
"faltam", "pontos", "desbloquear", "próximo nível", "complete", ranking,
comparação — e falha se qualquer um aparecer. Sabotei os oito para
confirmar que disparam.

É a diferença entre um álbum e uma cartela de bingo.

### Privado por padrão

O passaporte nasce fechado. Parte do corpo, estúdio e cidade dizem muito
sobre uma pessoa, e o padrão aberto não é defensável para esses três
campos juntos.

Uma consequência que vale registrar: **a sessão criada pelo check-in
também nasce privada**. Seria tentador abri-la ali, no calor do momento
— mas esse é justamente o instante em que a pessoa está menos disponível
para decidir sobre exposição. Ela acabou de levar quatro horas de
agulha. Consentimento pedido nessa hora não é consentimento.

### Trilha de capacitação

Cursos concluídos viram histórico de formação no perfil. A trilha
desemboca em virar tatuador **na mesma conta** — hoje quem se capacita
teria que abrir cadastro novo, jogando fora justamente o histórico que
prova a capacitação.

---

## Fornecedor

As quatro frentes que você listou não são quatro produtos. São uma
cadeia, e a ordem importa:

```
recomendação → embaixador → loja → cliente no pós-sessão
```

Material de tatuagem não se vende por anúncio; vende porque um tatuador
falou bem. Uma marca que começa comprando embaixador está comprando
alcance, não confiança — e o cliente percebe. Por isso:

- **Recomendações vêm antes de Embaixadores na navegação.**
- A tela de pedir recomendação **só lista tatuadores que já compraram
  da marca**. Pedir a quem nunca usou é encomendar propaganda, e é o que
  corrói a confiança que a tela existe para construir.
- O botão "convidar embaixador" leva para as recomendações, de
  propósito: é lá que estão os candidatos legítimos.
- Convite recusado fica registrado como recusado, com "não insistir" na
  interface.

A venda acontece no **pós-sessão** — a pessoa acabou de sair do estúdio e
não sabe o que comprar. É a hora em que ela mais precisa e menos sabe
escolher, e a única em que uma marca certa vale mais que um preço menor.
A tela de pedidos separa a origem por isso: "pós-sessão" é a venda que a
plataforma criou, e é sobre ela que faz sentido cobrar comissão maior.

---

## O que isso pede do backend, quando chegar a hora

Nada disto grava no banco ainda — o combinado continua valendo. Mas o
check-in é o primeiro item desta rodada que **precisa** de backend para
significar alguma coisa: um carimbo verificado que mora só no navegador
não é verificado, é decorativo.

Quando for a hora:

- `sessions` — artista, cliente, estúdio, cidade, país, estilo, parte do
  corpo, início, fim. Escrita só pela função de check-in, nunca direta.
- `checkin_codes` — código de vida curta, ligado a um agendamento, com
  expiração. Sem expiração, um código vazado carimba passaporte alheio.
- `session_visibility` — a exposição por sessão, do lado do cliente.
  Fechado por padrão no schema, não só na interface.
- Reputação verificada do artista como **view derivada**, nunca como
  contador que alguém possa escrever.
- Fornecedor não tem nada: `brands`, `brand_products`, `brand_orders`,
  `endorsements`, `ambassadors` — cinco tabelas do zero. E duas das três
  linhas de receita escolhidas dependem delas.

---

## O que ficou de fora, e por quê

**Check-in por geolocalização.** Seria mais forte contra fraude, mas
falha em porão de estúdio e obriga a pedir permissão de localização no
pior momento possível. O QR resolve 95% e não pede nada.

**Selo público de "cliente verificado".** Combina com passaporte
privado? Não. Ficou de fora até existir um caso de uso que justifique.

**Marketplace de fornecedor para tatuador (B2B).** Existe na proposta
antiga e continua fazendo sentido, mas esta rodada é sobre a venda ao
cliente final — que é a que a plataforma cria e a que ninguém mais tem.
