# 033 — Financeiro vira aba, e "Quem eu tatuei" vai para a agenda

19 de agosto de 2026

## O pedido

> "na area do tatuador, visão geral se mantem, mas as subabas dinheiros
> e lançamentos viram uma aba 'financeiro' e quem tatuei vai para agenda
>
> agenda fica com as subabas agendado, quem tatuei e proximas sessões"

## O que mudou

| antes | depois |
|---|---|
| **Visão geral** com 4 seções: painel, Dinheiro, Lançamentos, Quem eu tatuei | **Visão geral**: só o painel, sem toggle |
| — | **Financeiro**: Dinheiro · Lançamentos |
| **Agenda**: Próximas sessões · O mês e o Google | **Agenda**: Agendado · Quem eu tatuei · Próximas sessões |

Cinco abas viraram seis, que é o teto que você mesma pôs.

## Por que as duas mudanças fazem sentido juntas

**Dinheiro é uma pergunta inteira, não um pedaço da primeira tela.** A
Visão geral carregava quatro assuntos — o que precisa de você hoje, o
caixa, o extrato e as pessoas. Quem abre a gestão de manhã quer a
primeira; quem abre para conferir o mês quer a segunda, e não pela mesma
porta.

**Quem já sentou na sua cadeira e quem vai sentar são a mesma matéria,
lida em duas direções.** É a mesma lógica que já governa o passaporte e
a trajetória. Na Visão geral, "Quem eu tatuei" estava ao lado do caixa
porque a lista tem valores — mas o que ela responde é *quem*, não
*quanto*.

## A chave que mudou de nome

`mes` virou `agendado`. Chave que descreve uma coisa e rótulo que
descreve outra é onde nasce o próximo engano: daqui a dez rodadas
alguém lê `S.sub.ag === "mes"` e conclui que ali mora um calendário
mensal.

## A inversão que registro de propósito

A ordem que você pediu agora — **agendado, quem eu tatuei, próximas
sessões** — inverte a que você tinha pedido antes:

> "em agenda deixe proximas sessões primeiro, depois o calendário"

Registro porque decisão que troca de sinal sem registro vira "sempre foi
assim", e a próxima pessoa a mexer não sabe que houve escolha. Se a
ordem anterior fizer falta no teste com usuários, o histórico está aqui.

## O defeito que apareceu no caminho

Rearrumar arquitetura sempre revela ligação podre, e revelou uma.

`studio-checkin` é uma rota antiga que ainda precisa chegar em algum
lugar. Ela apontava para `["studio", "vg", "checkin"]` — e **as duas
metades do destino estavam mortas**:

- a chave `vg` sumiu quando a Visão geral deixou de ter seções
- `checkin` já não era seção desde que o QR passou a abrir dentro da
  linha da sessão

Quem entrasse por essa rota caía na Visão geral com **o corpo vazio** —
só o cabeçalho de navegação.

Nada acusava, e por dois motivos:

**Primeiro:** tradução de rota não é texto nem componente. É **ligação**
— a quinta vez neste projeto que o defeito mora na ligação e os testes
medem as pontas.

**Segundo, e pior:** o teste que existia para isso conferia que
`studio-checkin` chegava em `"studio"` — que era o destino **errado
escrito na própria tradução**. Ele media a promessa contra ela mesma.

Havia um piso de 1500 caracteres que deveria ter pegado a tela vazia.
Não pegou: o cabeçalho de navegação sozinho passa de 2800. O piso agora
mede o **miolo**, não a página.

## Guardas novos

- A Visão geral **não pode** voltar a ter toggle — trilho de uma peça só
  é um botão que não leva a lugar nenhum.
- A agenda tem exatamente as três peças, **nesta ordem**.
- Nenhum cartão do painel aponta para aba que não existe: os destinos
  são conferidos contra `ST_NAV` e as rotas antigas. Esse é o defeito
  silencioso de toda mudança de arquitetura — o número continua bonito e
  o clique não vai a lugar nenhum.
- Rota antiga tem de chegar com miolo, não com casca.

## Sabotagens

1. Rota antiga de volta ao destino vazio → acusou: *"foi para studio com
   31 caracteres de miolo"*.
2. Financeiro fora da barra → acusou.
3. Agenda sem "Quem eu tatuei" → acusou seis vezes, em três roteiros.
4. Visão geral com seções de novo → acusou nos dois roteiros.
5. Cartão do painel apontando para `studio-caixinha` → acusou pelo nome.

**11 roteiros, 0 falhas. 702 frases, nenhuma perdida.**

---

## Adendo: a justificativa com prazo de validade

> "visão geral perdeu os numeros que consolidavam a visão do todo para
> o tatuador"

Você está certa, e o defeito é meu — nasceu na mudança acima.

### O que aconteceu

"Sobrou", "Entrou" e "Saiu" tinham saído do painel numa rodada
anterior, com um motivo que era **bom na época**:

> *"a seção Dinheiro está nesta mesma página, uma rolagem abaixo,
> dizendo o mesmo número com as mesmas palavras. Cartão que repete o
> que está logo embaixo não resume nada."*

Aí Dinheiro virou a aba Financeiro. **A justificativa morreu, e o
cartão não voltou sozinho.** O painel ficou com nove números e nenhum
deles era dinheiro — que é a primeira coisa que alguém que trabalha por
conta própria quer ver de manhã.

### A classe de defeito

Chamo de **justificativa com prazo de validade**: uma remoção
justificada por *"isto sai porque está logo abaixo"* deixa de valer no
dia em que o que estava abaixo muda de casa. E nada avisa, porque a
justificativa vive num comentário e a mudança acontece noutro arquivo.

É parente do que já aconteceu duas vezes aqui — testes que descreviam
comportamento antigo — mas pior, porque um teste que quebra ao menos
grita. Uma justificativa envelhecida fica em silêncio.

### O painel agora

Treze números, em três faixas:

| faixa | o que responde |
|---|---|
| **Precisa de você** | o que trava se você não mexer hoje |
| **Como vai o mês** | Sobrou · Entrou · Saiu · Sessões marcadas · Propostas que fecharam |
| **O que você construiu** | pessoas, estúdios, obras, cursos, avaliação |

**Sobrou vem primeiro** na faixa do mês: entrou e saiu são o caminho,
sobrou é a resposta.

E **Cursos e eventos ganhou um número** — era a única aba sem nenhum, e
aba sem número no painel é aba que a pessoa esquece que tem.

### O guarda que faltava

Os testes olhavam para o que **está** no painel e nunca para o que
**deveria** estar. Contavam nove cartões, e nove continuava sendo nove
depois que o dinheiro saiu.

A regra nova é estrutural: **toda aba da barra precisa de pelo menos um
número no painel**. Ela teria pegado este defeito no dia em que
Financeiro nasceu.

*(E a primeira versão dela varria a página inteira em busca de
`go('...')` — encontrava todas as abas sempre, porque a própria barra
de navegação as repete. Teste que nunca falha. Agora lê só o `onclick`
dos cartões.)*

### Sabotagens

6. O dinheiro sai do painel de novo → acusou quatro vezes, uma delas
   nomeando `studio-financeiro`.
7. "Sobrou" vai para o fim da faixa → acusou.
8. Cursos e eventos perde o número → acusou, nomeando a aba órfã.

**11 roteiros, 0 falhas.**
