# Checkpoint 01 — maturidade, mercado e plano

28 de julho de 2026

Este documento fecha o ciclo de concepção e abre o de validação. Ele
responde às sete linhas que você levantou, e cada uma traz **dois
caminhos possíveis, os gaps do negócio e uma expectativa de ganho por
segmento**.

> **Ressalva:** não sou consultor financeiro nem advogado. Os números de
> mercado abaixo estão com fonte; as projeções são **modelos com
> premissas declaradas**, não previsões. Trate-os como estrutura de
> raciocínio, e leve as premissas para quem for te assessorar.

---

## O diagnóstico em uma frase

**Concepção madura, validação zero.**

| Dimensão | Estado | Evidência |
|---|---|---|
| Protótipo navegável | **Muito maduro** | 6.219 linhas, 9 diagnósticos automáticos, 0 falhas, cada guarda sabotado para provar que dispara |
| Decisões de produto | **Muito maduro** | 10 decisões documentadas com o porquê e o que ficou de fora |
| Backend | **Metade** | 50% das 32 etapas com sustentação real |
| Modelo de negócio | **Definido, não testado** | 3 linhas escolhidas; 2 delas com 0% de backend |
| Validação com gente | **Zero** | `teste_sessoes` = 0 linhas. Ninguém, nunca, abriu o link de teste |
| Receita | **Zero** | Nenhuma transação, nenhum contrato |

O desequilíbrio é o diagnóstico. Você tem semanas de design acumuladas
sobre **nenhuma observação de uso real**. Isso não é um erro — protótipo
antes de código é a ordem certa. Mas o custo de continuar desenhando sem
olhar sobe a cada rodada, porque cada decisão nova se apoia nas
anteriores, e nenhuma delas foi conferida contra uma pessoa.

**O fato mais importante deste documento:** o link de teste existe há
dias e nunca foi usado. É o item de menor custo e maior retorno da
lista inteira.

---

# 1. Mercado — quem já faz, e quem faz bem

## O que os dados dizem

**No Brasil.** São **22.568 estabelecimentos** de tatuagem e piercing,
sendo **21.093 MEI**, 1.384 ME e 91 EPP (SEBRAE). O setor cresce a uma
média de **25% ao ano** e a ABT projetava **R$ 2,5 bilhões** movimentados
em 2024. O salário médio do tatuador é **R$ 6.097/mês**, com dispersão
enorme — de R$ 1.000 a quase R$ 30.000.

Leia a composição de novo: **93% do mercado é MEI.** Isso decide preço,
canal e produto. Não existe venda enterprise para esse público; existe
autoatendimento barato, em português, que se paga na primeira semana.

**Lá fora.** Dois casos importam:

**Tattoodo** (Copenhague, 2013) é a referência de descoberta: mais de
**20 milhões de usuários mensais**, receita por taxa de reserva e
assinatura de artista. Treze anos e 20 milhões de pessoas depois, não
virou um negócio de reserva dominante — continua sendo, na prática, uma
plataforma de conteúdo e portfólio. **É o sinal mais importante do
mercado: descoberta, sozinha, não monetiza em tatuagem.**

**Booksy** (beleza) é a referência de dinheiro: **US$ 269 milhões**
levantados, **~US$ 115 milhões de receita anual**, rodada de **US$ 84,1
milhões em setembro de 2025**, com modelo **SaaS + marketplace**. O
dinheiro está no lado da oferta.

**Software de estúdio já existe** e cobra em dólar: Tattoo Studio Pro a
**US$ 29** (solo) e **US$ 79** (equipe); Porter a **US$ 35** por artista
e **US$ 200** por estúdio; a faixa geral do mercado vai de **US$ 29 a
250/mês**. Tudo em inglês, para EUA e Europa.

## A leitura estrutural que muda tudo

Tatuagem tem **frequência péssima para marketplace de consumo**: uma
pessoa tatua 1 a 3 vezes por ano. Beleza tem corte de cabelo a cada
quatro semanas — é por isso que Booksy funciona e Tattoodo não decolou
como reserva.

Consequência direta: **não dá para construir hábito no cliente.** O
hábito só existe do lado de quem trabalha — o tatuador abre a agenda
todo dia.

E daí sai a melhor notícia do documento: **o check-in é o canal de
aquisição do lado cliente.** O tatuador leva o cliente, fisicamente,
dentro do estúdio, no momento de maior confiança da relação. O CAC do
lado da demanda tende a zero — o que é exatamente o oposto do problema
que mata marketplaces de baixa frequência.

## Gaps do negócio nesta linha

- Você não sabe se tatuador brasileiro paga por software. Ninguém testou.
- Você não sabe se o cliente aceita escanear um QR no meio da sessão.
- Não existe nenhuma relação com estúdio real ainda — nem uma.

## Caminhos

**A) Entrar pelo lado da oferta, em português, barato.** Posicionar como
ferramenta do tatuador brasileiro, com preço de MEI. Concorrência real
quase inexistente no idioma e no preço.
**B) Entrar pela descoberta, como o Tattoodo.** Mais fácil de crescer,
comprovadamente difícil de monetizar. Só faz sentido se a receita vier
de destaque e publicidade, e isso exige escala que você não terá cedo.

**Recomendo A.** B é o caminho que já foi testado por outra pessoa, com
20 milhões de usuários, e não produziu o resultado.

## Expectativa de ganho por segmento

Premissas: preço BR de R$ 79/mês para tatuador solo (metade do
equivalente em dólar, calibrado para MEI); base de 22.568
estabelecimentos.

| Penetração | Estabelecimentos | MRR | Receita anual |
|---|---|---|---|
| 0,5% | 113 | R$ 8,9 mil | R$ 107 mil |
| 1% | 226 | R$ 17,8 mil | R$ 214 mil |
| 3% | 677 | R$ 53,5 mil | R$ 642 mil |
| 5% | 1.128 | R$ 89,1 mil | R$ 1,07 milhão |

O número que importa não é o de 5% — é o de **0,5%**. Cento e treze
estúdios pagantes é uma meta alcançável a pé, e já é R$ 107 mil por ano
com custo operacional próximo de zero.

---

# 2. Investimento inicial — quanto, e onde

## Quanto custa hoje, de verdade

Você opera de um computador, sozinha. O custo em dinheiro até a primeira
receita é pequeno; o custo em tempo é o real.

| Item | Custo | Quando |
|---|---|---|
| Supabase Pro | ~US$ 25/mês | quando sair do plano free |
| Domínio próprio | ~R$ 50/ano | antes do piloto |
| E-mail transacional (SMTP) | US$ 0–20/mês | **agora** — o limite de 2 e-mails/hora trava qualquer teste |
| Assessoria jurídica pontual | R$ 3–8 mil | antes do piloto na rua |
| Contas de desenvolvedor (se virar app) | US$ 99/ano + US$ 25 | só se for app nativo |
| Mídia paga | **R$ 0** | **não gaste ainda** |

**Total até o piloto: algo entre R$ 300 e R$ 500 por mês, mais um gasto
jurídico único.**

## Onde colocar o esforço, na ordem

1. **Uma hora de advogado de direito digital.** Termos, LGPD, e a questão
   da nota de estúdio não reivindicado (decisão 010). É o gasto com
   melhor relação risco/preço da lista.
2. **SMTP próprio.** Sem isso o cadastro real não funciona para mais de
   duas pessoas por hora.
3. **Fechar um fluxo de ponta a ponta no banco** — o do tatuador.
4. **Nada de mídia paga até ter retenção.** O dado de referência:
   marketplaces saudáveis recuperam CAC em **menos de 6 meses no lado da
   oferta e menos de 3 na demanda**; acima disso, mídia paga geralmente
   está mascarando ausência de loop orgânico. Você não tem loop ainda —
   comprar tráfego agora esconderia justamente o que precisa medir.

## Gaps do negócio nesta linha

- Não há CNPJ, conta ou meio de cobrança montado. Sem isso não existe receita, por melhor que seja o produto.
- Não há contrato, termo de uso nem política de privacidade publicados.
- Não há decisão sobre onde a plataforma fica no fluxo de dinheiro da sessão (você não intermedeia pagamento hoje — e talvez não deva).

## Caminhos

**A) Enxuto (recomendado).** R$ 300–500/mês, um gasto jurídico de R$ 3–5
mil, zero mídia. Primeira receita mirando 90–120 dias, vinda de
assinatura de tatuador, vendida a pé.
**B) Acelerado.** Contratar apoio de desenvolvimento para fechar o
backend em 6–8 semanas: R$ 25–60 mil dependendo do arranjo. Encurta o
piloto, aumenta o risco de construir a coisa errada — porque a hipótese
central ainda não foi testada com ninguém.

## Expectativa de ganho por segmento

Com o caminho A e a meta de 0,5% de penetração no primeiro ano:
receita ~R$ 107 mil/ano contra custo de infra ~R$ 6 mil/ano. A margem
bruta de marketplace/SaaS costuma ficar perto de **71%** — mas o gargalo
real não é margem, é **quanto tempo você consegue vender a pé**.

---

# 3. Gaps do produto — forte, fraco e novo

## Onde é mais forte

**A gestão do tatuador.** É a única jornada que atravessa inteira nos
diagnósticos: virar tatuador e ser encontrado, 100%. Orçamento em três
passos, caixa, histórico, agenda e check-in formam um produto coerente
que um profissional usaria todo dia.

**A honestidade como recurso.** Selo pago dito como pago, passaporte
privado por padrão, higiene como porta e não média, estúdio não
reivindicado sem nota. Isso não é firula ética — num mercado onde a
confiança é a moeda, é o diferencial de marca mais difícil de copiar,
porque copiar exige abrir mão de receita fácil.

## Onde é mais fraco

**Não existe comunicação.** Não há chat, não há notificação, não há
e-mail transacional. Um marketplace sem canal de aviso não retém
ninguém — e o fluxo "responder a um orçamento" quebra exatamente em
"combinar detalhes por chat" (50%).

**Não existe upload de referências.** O pedido de orçamento quebra em
"enviar imagens de referência" (58%) — que é o primeiro passo real do
fluxo mais importante do produto.

**Duas das três linhas de receita têm 0% de backend.** Loja, cursos e
eventos (comissão) e planos (enterprise) não existem no banco. Só
"destaque" está perto de ser cobrável.

**O cliente não tem por que voltar.** Entre uma tatuagem e outra passam
meses. O passaporte é bonito e não resolve isso.

## O que é genuinamente novo no mercado

Fui procurar e não encontrei equivalente:

1. **Check-in bilateral por QR gerando reputação verificada.** Nem
   Tattoodo nem Booksy nem os softwares de estúdio fazem. É o ativo mais
   defensável do produto: exige duas pessoas no mesmo lugar, e por isso
   não se falsifica.
2. **Duração medida por estilo.** Ninguém preenche formulário depois de
   seis horas tatuando. O relógio do check-in produz um dado que hoje
   não existe em lugar nenhum — e que é a base de uma inteligência de
   precificação.
3. **Selos com categoria declarada** (fato / pares / contratado). A
   transparência sobre o que foi pago é incomum e é ativo de marca.

O resto — descoberta, portfólio, orçamento, agenda, caixa — é mesa
posta. Existe em outros produtos, e não é por aí que você ganha.

## Caminhos

**A) Aprofundar o que é novo.** Levar o check-in a backend real e usar a
reputação verificada como argumento de venda para tatuador.
**B) Cobrir o que falta.** Chat, upload e notificação, para nenhuma
jornada quebrar.

**Recomendo A antes de B**, com uma exceção: **upload de referência é
pré-requisito**, porque sem ele o orçamento não existe de verdade. Chat
pode esperar — WhatsApp resolve no piloto, e insistir em substituí-lo
cedo demais é gastar mês em algo que a pessoa já tem.

## Expectativa de ganho por segmento

| Segmento | O que o produto já entrega | O que falta para pagar |
|---|---|---|
| Tatuador | quase tudo | banco real + cobrança |
| Cliente | descoberta e passaporte | upload e comunicação |
| Estúdio | reputação de lugar | reivindicação real |
| Fornecedor | 4 telas de proposta | 5 tabelas do zero |

---

# 4. Modelo de negócio — como ficar rentável

## O que está desenhado hoje

Três linhas: destaque no catálogo, comissão sobre loja/cursos/eventos, e
enterprise para estúdios. **Duas delas dependem de módulos que não
existem**, e a terceira (destaque) só vale dinheiro com audiência que
você não tem.

## O ajuste que eu proponho

Inverter a ordem. **Assinatura do tatuador vira a linha principal**, e
as outras três viram complemento.

Motivos:

1. É a única linha que não depende de escala prévia. Você vende para o
   primeiro tatuador no primeiro dia.
2. É o que o mercado já provou pagar — US$ 29 a 250/mês lá fora, e
   Booksy construiu US$ 115 milhões de receita nesse modelo.
3. Comissão sobre loja exige logística, estoque e parceiro de marca. É
   receita bonita no slide e cara de operar.
4. Destaque precisa de tráfego. Cobrar por posição num catálogo que
   ninguém visita é vender o que não se tem.

**Proposta de preço, calibrada para MEI brasileiro:**

| Plano | Preço | Para quem | O que abre |
|---|---|---|---|
| Grátis | R$ 0 | qualquer tatuador | perfil, portfólio, aparecer na busca, receber orçamento |
| Profissional | R$ 79/mês | quem vive disso | check-in ilimitado, caixa, histórico, desempenho por estilo, agenda Google |
| Estúdio | R$ 199/mês | 3+ cadeiras | tudo acima para a equipe, reputação do lugar, relatórios |

O grátis não é generosidade: é o que garante catálogo para o cliente
encontrar alguém. O que se cobra é **a operação do profissional**, não
o acesso ao cliente — cobrar pelo acesso ao cliente é o que faz
tatuador odiar plataforma.

## Gaps do negócio nesta linha

- Nenhum meio de cobrança integrado. Sem isso não há receita.
- Não está decidido se a plataforma intermedeia o pagamento da sessão. **Minha recomendação: não intermediar no começo** — traz obrigação regulatória, risco de chargeback e atrito com o tatuador, em troca de uma comissão que ele vai contornar combinando por fora.
- Não há política de reembolso, cancelamento ou disputa.

## Caminhos

**A) Assinatura como linha principal** (recomendado), com destaque e
comissão como complemento futuro.
**B) Manter as três linhas em paralelo.** Mais receita potencial, e
significa construir três backends antes de faturar o primeiro real.

## Expectativa de ganho por segmento

Premissa: mistura de 80% Profissional e 20% Estúdio.

| Assinantes | Receita mensal | Anual |
|---|---|---|
| 25 | R$ 2,6 mil | R$ 31 mil |
| 100 | R$ 10,3 mil | R$ 124 mil |
| 250 | R$ 25,8 mil | R$ 310 mil |
| 500 | R$ 51,5 mil | R$ 618 mil |

Complementos, quando existirem: comissão de pós-sessão a ~12% sobre um
kit de R$ 100, com 20% de conversão, sobre 6.800 sessões/mês, dá cerca
de **R$ 16 mil/mês** — comparável à assinatura, mas exigindo parceiro de
marca, estoque e logística. É a segunda linha, não a primeira.

---

# 5. Do protótipo à rua — a sequência

## Onde você está

Etapa zero. O protótipo está pronto e **nunca foi visto por ninguém**.

## A sequência que eu recomendo

**Etapa 1 — Teste do protótipo · 2 semanas · R$ 0**
Mandar o link `?teste=1` para 15–25 pessoas: metade tatuadores, metade
quem já tatuou. A telemetria já está pronta e não coleta nada indevido.
*Critério para seguir:* pelo menos 60% dos tatuadores dizem, sem
indução, que usariam o check-in. Se não, o produto muda antes de virar
código.

**Etapa 2 — Backend de uma ponta · 6–8 semanas · ~R$ 400/mês**
Só o essencial: sessão, check-in, upload de referência, notificação por
e-mail. Sem loja, sem cursos, sem planos.

**Etapa 3 — Piloto controlado · 8 semanas · 3 a 5 estúdios**
Estúdios que você conheça, na sua cidade. Grátis, em troca de conversa
semanal. *Critério:* 50% das sessões com check-in feito. Se o tatuador
não abre o check-in, todo o resto do produto perde a base.

**Etapa 4 — Piloto na rua · 12 semanas · 30 a 50 tatuadores**
Aqui entra cobrança. Preço cheio, com desconto de fundador.
*Critério:* retenção de 70% no terceiro mês e alguém pagando sem você
ligar.

**Etapa 5 — Escala**
Só depois de CAC pago em menos de 6 meses no lado da oferta.

## Gaps do negócio nesta linha

- Não existe lista de estúdios ou tatuadores para convidar. **Essa lista é o ativo mais barato de construir e você não começou.**
- Não existe roteiro de entrevista para o piloto.
- Não existe critério escrito de "deu certo" — sem ele, qualquer resultado vira confirmação do que você já queria acreditar.

## Caminhos

**A) Sequência inteira, ~7 meses até receita.** Mais lento, cada etapa
com critério de parada.
**B) Pular a etapa 1** e ir direto ao backend, porque você "já sabe" o
que as pessoas vão dizer. Economiza duas semanas e arrisca oito.

**Recomendo A, com a etapa 1 limitada a duas semanas** para não virar
desculpa de adiamento.

## Expectativa de ganho por segmento

Ao fim da etapa 4, um cenário conservador: 30 tatuadores em piloto, 40%
convertendo em pagante = 12 assinantes = **R$ 1,2 mil/mês**. Não é
negócio ainda. É a **prova de que existe negócio** — e é isso que
autoriza gastar dinheiro na etapa 5.

---

# 6. Engajamento — o que já está bom, e o que falta

## O que você já faz bem

**O check-in é o melhor mecanismo de engajamento do produto.** É diário
para o tatuador, acontece no momento de maior confiança, e produz dado
que ninguém mais tem. Poucos produtos têm um gancho tão natural.

**Os selos criam progressão sem cobrança.** O tatuador vê o que falta
para o Recomendado; o cliente nunca vê cobrança nenhuma. A assimetria
está certa: cobrar profissional é legítimo, cobrar tatuagem de alguém
não é.

**Orçamentos recebidos e enviados dão motivo diário de abrir.** É o que
sustenta hábito no lado da oferta.

## O que falta, em ordem de impacto

**1. Notificação. Não existe nenhuma.** Nem push, nem e-mail. Um pedido
de orçamento que chega e ninguém avisa é um pedido perdido. É o maior
buraco de engajamento do produto, e o mais barato de tapar.

**2. A janela de cicatrização.** Esta é a ideia que eu mais quero te
propor. O cliente tatua 1 a 3 vezes por ano — mas nos **14 dias após a
sessão** ele pensa naquilo todo dia: pode molhar? está normal ficar
vermelho? quando descasca?

Um acompanhamento diário de cicatrização transforma o usuário de menor
frequência do produto em **14 dias seguidos de uso**, exatamente uma vez
por tatuagem. E ele resolve três coisas de uma vez:

- é o momento certo do produto de pós-tatuagem (a linha do fornecedor);
- alimenta o dado de higiene e orientação que sustenta o selo Recomendado;
- é genuinamente útil e cuida da saúde de quem acabou de furar a pele.

Nenhum concorrente faz isso. É a segunda coisa mais nova que o produto
poderia ter, depois do check-in.

**3. Motivo de voltar entre tatuagens.** Cursos, eventos e a galeria de
arte existem para isso, mas estão a 17% e 0% de backend.

## Caminhos

**A) Notificação + cicatrização.** Duas semanas de trabalho, e é o par
com maior efeito sobre retenção nos dois lados.
**B) Conteúdo e comunidade** — feed editorial, flash days, seguir
tatuadores. Aumenta tempo de tela e não aumenta receita, e é onde o
Tattoodo já está há treze anos.

## Expectativa de ganho por segmento

| Segmento | Frequência hoje | Com cicatrização + notificação |
|---|---|---|
| Cliente | 1–3 aberturas/ano | ~14 aberturas por tatuagem |
| Tatuador | diária (se avisado) | diária, com motivo |
| Fornecedor | — | ganha o momento de venda com contexto |

---

# 7. Gaps de front e backend

## Backend — 50% das 32 etapas

| Jornada | Sustentação | Quebra em |
|---|---|---|
| Virar tatuador e ser encontrado | 100% | — |
| Descobrir um tatuador | 70% | ver avaliações |
| Pedir um orçamento | 58% | enviar imagens de referência |
| Responder a um orçamento | 50% | combinar detalhes por chat |
| Fazer curso ou ir a evento | 17% | encontrar por proximidade |
| Comprar material ou arte | 0% | navegar a loja |
| Assinar um plano | 0% | ver os planos |

**Tudo desta última rodada — check-in, passaporte, selos, estúdio,
fornecedor — está a 0% de banco.** É protótipo. Um carimbo "verificado"
que mora só no navegador é decoração.

**Ordem que eu faria:**

1. `sessions` + `checkin_codes` com expiração — sem expiração, código vazado carimba passaporte alheio
2. Upload de referências no orçamento
3. E-mail transacional (SMTP próprio)
4. `session_visibility`, fechado por padrão **no schema**, não só na tela
5. Reputação como **view derivada**, nunca contador gravável
6. Só então: `studios`, `studio_members`, `studio_claims`

## Front

O protótipo é **um arquivo de 6.219 linhas**. Isso foi uma escolha certa
para prototipar — muda rápido, não tem build, abre em qualquer lugar. E
é insustentável como produto: sem componentes, sem rotas reais, sem
testes de unidade, sem tipagem.

**Minha recomendação: não migre ainda.** O protótipo é mais barato de
mudar do que qualquer front "de verdade", e você ainda vai mudá-lo
bastante. A migração se justifica quando o backend estiver de pé e as
telas pararem de mudar toda semana — provavelmente entre as etapas 3 e 4.

**O que precisa de atenção antes disso:**

- **PWA para o check-in.** O QR pede câmera. Um app instalável resolve sem loja de aplicativos, com limitações conhecidas no iOS.
- **Nenhum estado de erro de rede.** Hoje o protótipo assume que tudo dá certo.
- **Nenhum estado vazio real.** Catálogo com zero tatuadores mostra tela em branco.

## Gaps do negócio nesta linha

- Não há backup do banco configurado.
- A chave do Google Maps não está restrita por referenciador.
- Não há ambiente de homologação separado da produção.

## Caminhos

**A) Backend fino de uma ponta** (itens 1 a 3), mantendo o protótipo como
front. Seis a oito semanas, e dá para pilotar.
**B) Reescrever o front agora** em React com o backend completo. Três a
quatro meses, e você chega ao piloto sem ter falado com ninguém.

**Recomendo A**, com folga.

---

# Os dois próximos passos, escolhendo um

## Caminho 1 — Validar antes de construir *(recomendado)*

**Duas semanas. R$ 0. Nenhuma linha de código nova.**

1. Montar uma lista de 25 pessoas — 12 tatuadores, 13 que já tataram
2. Publicar o que está pronto (são ~80 commits que nunca subiram)
3. Mandar o link `?teste=1` sem explicar o produto
4. Ler o painel e conversar com 5 delas

**O que você compra:** saber se o check-in faz sentido para tatuador
antes de gastar dois meses construindo o banco dele.
**O que você arrisca:** duas semanas.

## Caminho 2 — Fechar uma ponta e pilotar

**Oito semanas. ~R$ 400/mês + jurídico.**

1. `sessions`, `checkin_codes`, upload, SMTP
2. Três a cinco estúdios conhecidos, de graça, com conversa semanal
3. Medir uma coisa só: **percentual de sessões com check-in feito**

**O que você compra:** a resposta de verdade, com uso real.
**O que você arrisca:** oito semanas construindo sobre uma hipótese que
ninguém confirmou.

## O que eu faria

**Os dois, nessa ordem, com prazo duro na primeira.** O caminho 1 custa
duas semanas e pode economizar oito. E se ele confirmar a hipótese, você
entra no caminho 2 com convicção em vez de esperança.

O risco real do caminho 1 não é o resultado — é ele virar desculpa para
continuar desenhando. Por isso: **data marcada para acabar.**

---

## Fontes

- SEBRAE / ABT — número de estabelecimentos, composição MEI e projeção de faturamento do setor no Brasil
- Glassdoor — salário médio do tatuador no Brasil
- Tattoodo, Booksy — modelos e números públicos de plataformas comparáveis
- Tattoo Studio Pro, Porter, TattooPro — preços praticados em software de estúdio
- Benchmarks de CAC e take rate de marketplace, 2025–2026
