# 010 — O selo de estúdio, e a decisão que ficou aberta

28 de julho de 2026

Até aqui toda reputação era de pessoa. Um estúdio podia ter higiene ruim
com um tatuador excelente dentro, e o cliente não tinha como saber. O
dado já existia — o checkout pergunta sobre o estúdio em toda sessão —
mas não tinha onde morar, porque estúdio era texto livre em sete
lugares.

---

## O que muda no cadastro, e por que não é um quarto perfil

**Estúdio não entrou como quarto cartão no passo 2.** O passo 2 pergunta
"quem é você aqui", e cliente, tatuador e fornecedor são todos
*pessoas*. Lugar não cabe na mesma pergunta — é um erro de categoria.

E há uma razão prática mais forte: quase todo dono de estúdio também
tatua. Um quarto cartão criaria duas portas para o caso majoritário e
duplicaria cadastro, que é exatamente o que evitamos quando fornecedor
ganhou "também sou tatuador".

Ficou o mesmo padrão, na direção inversa: **uma caixa no passo 3 do
tatuador — "Também administro um estúdio"**. Três passos continuam três.

O custo dessa escolha, dito: um dono que **não** tatua precisa marcar-se
como tatuador para administrar o lugar. É uma imprecisão real. Aceitei
porque no Brasil o dono que não tatua é minoria, e porque criar um perfil
inteiro para a minoria custaria clareza para todo mundo.

## A porta de entrada é reivindicar, não cadastrar

O check-in escreve o nome do estúdio em toda sessão. Isso quer dizer que
**os lugares já existem nos dados antes de alguém se cadastrar**.

Então a tela abre pela lista do que já existe — "Studio Marina, 34
sessões com check-in, reivindicar" — e só depois oferece cadastrar do
zero. Um formulário em branco jogaria fora a única vantagem que temos
sobre um diretório qualquer.

Reivindicar exige e-mail confirmado. Afirmar propriedade sobre um
estabelecimento real não pode partir de uma conta que ninguém confirmou.

---

## Os selos de lugar

| Selo | Categoria | Como se ganha |
|---|---|---|
| 🧼 **Higiene verificada** | fato | Acima de 90% confirmaram estúdio limpo, em pelo menos 30 checkouts |
| 🏛 **Estúdio verificado** | fato | CNPJ, endereço e licença sanitária conferidos com o registro oficial |
| 👥 **Casa de guest** | fato | 10 ou mais tatuadores visitantes, confirmados por check-in feito ali |
| 🏪 **Enterprise** | contratado | Contrato de operação. Diz que há estrutura, não que o trabalho é melhor |

Ficam no mesmo catálogo dos selos de pessoa de propósito: as categorias
valem para os dois, e o cliente não deveria ter que aprender duas
gramáticas de selo.

### A separação que sustenta tudo

**Selo de lugar fica no lugar. Nunca soma aos números da pessoa.**

No perfil do tatuador o estúdio aparece num bloco próprio, com o nome do
lugar em cima e a frase "estes selos são do lugar, não de Marina". Nos
dois sentidos: um profissional excelente não herda a nota de um estúdio
ruim, e um estúdio impecável não empresta reputação a quem trabalha mal
dentro dele.

Sem essa separação, o selo de estúdio viraria punição coletiva — e o
tatuador que não tem controle sobre a limpeza do lugar pagaria por ela.

### E a mesma informação, virada do avesso

Na página do estúdio, quem está logado como tatuador vê **a higiene do
lugar antes de propor uma temporada de guest**. É o mesmo número que o
cliente lê antes de marcar.

Isso é o que impede o selo de ser só julgamento sobre o tatuador: passa
a ser ferramenta dele também.

---

## A decisão que ficou aberta

**Estúdio que aparece nas sessões mas nunca se cadastrou: mostra a nota
de higiene?**

O padrão implementado é **não**. Nome e número de sessões aparecem; nota,
não. A troca é uma constante única — `MOSTRAR_NOTA_DE_NAO_REIVINDICADO`
— com este documento referenciado ao lado dela. Está numa constante só
porque é decisão de negócio com consequência jurídica, não ajuste de
interface.

### Por que eu recomendo manter em `false`

**Não sou advogado e isto não é parecer jurídico.** É o raciocínio de
risco que eu levaria a um.

**1. Publicar número calculado não é hospedar conteúdo de terceiro.**
Esta é a distinção que decide quase tudo. A proteção do Marco Civil da
Internet existe para conteúdo que *outra pessoa* publicou. No momento em
que a plataforma **agrega, calcula e rotula** — "Higiene: 62%" —, há
argumento forte de que ela deixou de ser hospedeira e virou autora.
Nesse caso o regime de responsabilidade da plataforma por conteúdo de
usuário simplesmente não se aplica: a afirmação é nossa.

Vale registrar que o STF declarou o art. 19 parcialmente
inconstitucional em junho de 2025, com acórdão publicado em novembro,
criando regimes distintos conforme o tipo de conteúdo e exigindo canais
permanentes de atendimento. Mas isso muda o regime para conteúdo de
terceiros — **e o número agregado não é conteúdo de terceiro.**

**2. Sem direito de resposta, medição vira acusação.** Um estúdio que
nunca se cadastrou não tem canal para contestar, corrigir ou explicar.
Publicar contra quem não pode responder é o elemento que os tribunais
costumam olhar com mais severidade — e agora há exigência expressa de
canal de atendimento acessível.

**3. Risco de identificar o lugar errado.** Sem reivindicação, só temos
uma string digitada por tatuadores. Dois "Studio Marina" em cidades
diferentes viram um só. Publicar nota ruim contra o estabelecimento
errado é o pior desfecho possível, e o mais difícil de defender.

**4. LGPD, quando o estúdio é a pessoa.** "Studio Marina" muitas vezes
*é* a Marina. Aí o número deixa de ser sobre uma empresa e passa a ser
dado pessoal de indivíduo identificado — com direitos de acesso,
correção e oposição que uma publicação unilateral atropela.

**5. Proximidade com acusação sanitária.** "Higiene baixa" está muito
mais perto de imputar irregularidade sanitária do que "atendimento
ruim". A gravidade do que se afirma pesa na avaliação de dano.

### O que a gente ganha mantendo fechado

Quase toda a pressão de aquisição, sem quase nenhum risco. A página do
estúdio não reivindicado diz:

> 47 sessões tiveram check-in aqui. 19 clientes já responderam sobre
> este lugar — mas o estúdio não tem como ver nem responder.

Isso é um convite forte, e é honesto. Os tatuadores que trabalham ali
também veem, o que cria pressão de dentro. E o botão de convite fica com
quem tem a relação: **"se você tatua aqui, o convite feito por você
chega melhor que o nosso."**

### Se um dia você quiser abrir

Os três anteparos que eu construiria antes de virar a chave:

1. **Reivindicação com um clique e resposta imediata**, para que exista
   direito de resposta real, não teórico.
2. **Volume mínimo maior** para não reivindicado do que para
   reivindicado — hoje 30; eu iria a 100.
3. **Nunca nota agregada de um número só.** Publicar as respostas como
   distribuição ("14 de 19 clientes disseram que o estúdio estava
   limpo") mantém o cliente como autor da frase e a plataforma como
   veículo. É a diferença entre citar e sentenciar.

Antes de qualquer uma dessas, uma conversa de uma hora com advogado de
direito digital. É barato perto do que custa errar.

---

## O que isso pede do backend

- `studios` — nome, handle (mesmo espaço de nomes das pessoas), cidade,
  endereço, CNPJ, licença, estado de reivindicação.
- `studio_members` — vínculo com **estado e datas**: residente, guest,
  ex. Não é papel de conta; papel não expressa temporada de duas semanas.
- `studio_claims` — quem reivindicou, com quais documentos, aprovado por
  quem. Trilha de auditoria obrigatória: é aqui que mora a decisão de
  dar a alguém o controle sobre a reputação de um lugar.
- `sessions.studio_id` — a string vira chave estrangeira, **mas o campo
  de texto continua existindo**. A maioria dos estúdios nunca vai se
  cadastrar, e um tatuador precisa poder dizer onde trabalha mesmo
  assim.
- Nota de higiene como **view derivada** dos checkouts, jamais como
  contador gravável.
- `app_role` ganha `studio_admin`.
