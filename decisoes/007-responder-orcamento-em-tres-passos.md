# 007 — Responder a um orçamento em três passos

27 de julho de 2026

## O que mudou

A aba **Orçamentos → Recebidos** era lista à esquerda e formulário à
direita, tudo visível ao mesmo tempo. Virou uma sequência de três
telas:

1. **Onde estão os pedidos** — mapa com um pino por pedido e a lista
   numerada logo abaixo, o mesmo par que eventos e cursos já usam.
2. **O pedido** — lido como um card do feed: referências em carrossel e
   o texto que o cliente escreveu.
3. **A proposta** — valor e mensagem, e nada mais na tela.

## Por quê

O campo "Sua proposta" ficava visível ao lado das miniaturas. Quem abre
a tela vê primeiro o campo que exige resposta, não o trabalho que a
resposta precifica — e precificar antes de olhar é exatamente o erro
que uma ferramenta de orçamento deveria impedir. Separar em passos não
é burocracia: é impedir que a tela ofereça a conclusão antes da
premissa.

As referências em carrossel não são só estética. Três miniaturas de
56px lado a lado não permitem julgar traço, densidade ou escala — e é
disso que sai o número. O tatuador já passa o dia lendo tatuagem em
carrossel; usar o mesmo componente do feed aproveita um hábito em vez
de ensinar outro.

O mapa entrou porque a distância muda a conversa. Quem está a 2 km
fecha numa tarde; quem está a 12 quer saber se vale a viagem antes de
falar de preço. Isso chegava como uma linha de texto no meio de outras
cinco.

## O que ficou de fora, e por quê

**Chat dentro do orçamento.** A proposta ainda termina numa mensagem só.
Conversa fiada antes do preço é o que faz o orçamento morrer no
WhatsApp; se o chat for necessário, ele vem depois da proposta enviada,
não antes.

**Sugestão automática de valor a partir da tabela de preços.** Hoje a
sugestão é 5% acima do piso que o cliente informou — um ponto de
partida para editar, não um cálculo. Ancorar no que o cliente disse que
podia pagar é uma escolha discutível: pode puxar o valor para baixo. O
texto abaixo do campo diz onde o número digitado cai em relação à
expectativa dele, que é a informação que decide se a proposta precisa
de explicação na mensagem.

## Consequência no backend

Nada aqui existe no banco ainda. Quando existir, a sequência pede:

- `quote_requests` com as imagens de referência acessíveis em ordem
  (hoje o protótipo gera textura a partir de um número)
- latitude/longitude ou cidade do cliente para o mapa
- `respondToQuote(quote_id, offer_cents, message)` — a única escrita
  nova, já nomeada no protótipo

## Junto com isto

**Visão geral** perdeu as listas de "pedidos recentes" e "próximas
sessões". Cada uma já tinha um número apontando para ela; repetir o
conteúdo da aba dentro do resumo era o que fazia a tela crescer sem
parar. Ficaram dez números, em cartões menores — dez cartões grandes
viravam três rolagens no celular, que é o oposto de um resumo.

**Altura do mapa** virou uma constante única (`ALT_MAPA`). Eventos usava
170px e cursos 210px: trocar de aba mexia o chão sob a lista.
