# A segurança do banco, explicada

16 de agosto de 2026 · retrato tirado do banco **em funcionamento**

Este documento tem duas metades. A primeira explica os conceitos em
português comum, porque daqui a um ano você vai precisar dele e não vai
lembrar do jargão. A segunda é o passo a passo do que ainda falta.

---

# Parte 1 — Entendendo o que está montado

## Por que "tirado do banco em funcionamento" importa

Existem duas formas de saber como um banco está configurado.

Uma é ler os arquivos de **migração** — o histórico de comandos que
foram enviados ao banco ao longo do tempo. A outra é **perguntar ao
banco, agora**, o que ele tem.

Não são a mesma coisa. Migração diz *o que você mandou fazer*; o banco
diz *o que está valendo*. Se um comando falhou pela metade, se alguém
mexeu direto pelo painel, se uma regra foi criada e depois substituída —
o histórico não conta isso.

Foi por isso que eu perguntei ao banco. É por isso que este arquivo vale
mais do que a soma das migrações em `banco/`.

## O que é RLS

RLS é sigla de *Row Level Security* — segurança em nível de linha. É um
recurso do Postgres que decide, **linha por linha**, quem pode ver e
quem pode alterar.

Sem RLS, uma tabela é tudo ou nada: quem consegue consultar, consulta
tudo. Com RLS, a mesma consulta devolve resultados diferentes conforme
quem pergunta.

É isso que permite o protótipo falar direto com o banco a partir do
navegador, sem servidor no meio, sem virar um vazamento. A chave que
aparece no código é pública de propósito — ela sozinha não abre nada,
porque quem protege é a regra que está dentro do banco.

**Estado: 13 de 13 tabelas com RLS ligado.** O número importa mais do
que parece. Uma única tabela desprotegida num banco assim é uma porta
aberta, e é o erro mais comum nesse tipo de arquitetura.

## Por que existe um esquema chamado `private`

Regras de permissão precisam de funções auxiliares. `has_role(pessoa,
papel)` responde "essa pessoa é admin?". `email_confirmado()` responde
"essa pessoa confirmou o e-mail?".

O detalhe que muda tudo: **o Supabase publica automaticamente, como
endereço de internet, tudo que está no esquema `public`.** Se essas
funções morassem lá, cada uma viraria um endereço que qualquer pessoa
poderia chamar de fora — inclusive as funções que existem justamente
para decidir quem tem permissão.

As nove estão no esquema `private`, que não é publicado. Funcionam
dentro do banco e não existem para o mundo.

Essa correção foi feita depois que o próprio verificador do Supabase
apontou o problema. Vale registrar: **o erro aconteceu, foi detectado e
foi corrigido** — é assim que deve funcionar.

## O e-mail não confirmado

Você definiu uma regra de produto: conta sem e-mail confirmado navega,
mas não produz conteúdo nem se comunica.

O que o retrato mostra é que essa regra **não está só na tela** — está
escrita dentro do banco. Toda permissão de escrita exige
`email_confirmado()`: criar perfil de tatuador, publicar portfólio,
definir preço, pedir orçamento, responder proposta.

A diferença é grande. Regra que mora só na interface se contorna — basta
chamar o banco direto, pulando a tela. Regra que mora no banco não tem
como contornar.

## A telemetria, e por que ela é invertida

As duas tabelas do teste com usuários têm um desenho ao contrário do
normal: **qualquer pessoa escreve, e só admin lê.**

Faz sentido porque quem participa do teste não tem login. Precisa poder
registrar o que fez sem se identificar. Mas não pode, de jeito nenhum,
ler o que outro participante registrou.

Escrita aberta e leitura fechada é exatamente essa combinação. Há ainda
duas travas: o registro só entra com data de consentimento, e um evento
só é aceito se a sessão dele existir.

## Os buckets

Buckets são as pastas de arquivo. Existem três.

| Bucket | Público | Por quê |
|---|---|---|
| `avatars` | sim | a graça é aparecer |
| `portfolio` | sim | idem |
| `quote-uploads` | **não** | são as imagens que o cliente manda para pedir orçamento — muitas vezes fotos do próprio corpo, da parte que vai ser tatuada |

Público no terceiro seria falha séria. Está fechado.

---

# Parte 2 — O retrato de hoje

| | |
|---|---|
| Tabelas | 13 |
| Tabelas com RLS ligado | **13 de 13** |
| Políticas de RLS | 43 |
| Funções `SECURITY DEFINER` em `private` | 9 |
| Buckets | 3 |
| Contas | 1 |

## Políticas por tabela

| Tabela | Quem lê | Quem escreve |
|---|---|---|
| `profiles` | dono, admin, tatuador publicado, e o tatuador que atende o requerente | só o dono |
| `user_roles` | dono e admin | o próprio, limitado a `client`/`artist`; admin em tudo |
| `artists` | publicados, qualquer um; não publicados, só o dono | dono com e-mail confirmado |
| `artist_styles` | todos | dono com e-mail confirmado |
| `artist_pricing` | público, só de artista publicado | dono com e-mail confirmado |
| `portfolio_items` | todos | dono com e-mail confirmado |
| `artist_instagram_oauth` | só o dono | só o dono |
| `quote_requests` | requerente, tatuador vinculado, admin | requerente com e-mail confirmado |
| `quote_matches` | requerente e tatuador da proposta | os dois, com e-mail confirmado |
| `tattoo_styles` | **todos** | só admin |
| `handles_reservados` | **todos** | ninguém pela API |
| `teste_sessoes` | **só admin** | qualquer um, com consentimento datado |
| `teste_eventos` | **só admin** | só se a sessão existir |

## Funções em `private`

```
artista_atende_requerente(profile_id, user_id) → boolean
artista_vinculado_ao_pedido(quote_id, user_id) → boolean
dono_do_pedido(quote_id, user_id)              → boolean
dono_do_perfil_de_artista(artist_id, user_id)  → boolean
email_confirmado()                             → boolean
handle_permitido()                             → gatilho
has_role(user_id, role)                        → boolean
limita_eventos_do_teste()                      → gatilho
sessao_de_teste_existe(id)                     → boolean
```

---

# Parte 3 — O que falta, passo a passo

Rodei o verificador de segurança do Supabase e conferi o corpo de cada
função apontada. **Nenhum dos apontamentos é um buraco aberto** — mas
três merecem ação, e dois deles levam dois minutos.

## Passo 1 · Ligar a proteção contra senha vazada
**5 minutos · no painel · faça hoje**

Hoje está desligada. Com ela ligada, o Supabase compara toda senha nova
com a base do Have I Been Pwned e recusa senhas que já vazaram em outros
serviços.

Importa mais aqui do que em muitos produtos: a plataforma vai guardar
histórico de onde a pessoa tatuou e em que parte do corpo. Conta
invadida por senha reciclada exporia isso.

> **Supabase → Authentication → Policies → Password Security →**
> ativar *Leaked password protection*

## Passo 2 · Tirar `esquecer_participante` da API pública
**5 minutos · no SQL Editor**

Esta é a única correção de arquitetura da lista.

A função apaga os dados de um participante do teste, a pedido dele —
é o botão de "esqueça-me" da LGPD. Ela **já tem guarda interna**: a
primeira linha do corpo recusa quem não é admin.

O problema não é hoje, é depois. Ela mora no esquema `public`, então
está publicada como endereço de internet, e qualquer conta logada
consegue chamá-la. A guarda segura — mas é a única camada. Se um dia
alguém editar a função e esquecer da guarda, não há segunda barreira.

Como ela é chamada por você, à mão, no SQL Editor, ela não precisa estar
publicada:

```sql
-- Tira a função da API sem mudar o que ela faz.
revoke execute on function public.esquecer_participante(text)
  from anon, authenticated;

-- Confirma: deve voltar sem linhas de anon/authenticated
select grantee, privilege_type
from information_schema.role_routine_grants
where routine_name = 'esquecer_participante';
```

Você continua usando normalmente pelo SQL Editor, que roda com
privilégio de dono.

## Passo 3 · Deixar as outras duas como estão
**0 minutos · decisão registrada**

O verificador também apontou `acrescentar_meu_papel` e
`remover_meu_papel`. **As duas devem continuar públicas** — é assim que
um cliente vira tatuador pelo botão da tela, sem passar por você.

Cada uma se protege sozinha, e eu conferi o corpo das duas:

- `acrescentar_meu_papel` **recusa o papel `admin`**. Sem isso, qualquer
  conta viraria administradora do próprio banco com uma chamada.
- `remover_meu_papel` **recusa remover `client` e `admin`**. Cliente é o
  piso: toda conta pode se tatuar, e tirar isso deixaria a pessoa sem
  algo que ela não pediu para perder.
- As duas exigem estar autenticado, e a primeira é idempotente — clicar
  duas vezes não duplica papel.

Isto está aqui para que o apontamento não assuste daqui a seis meses.
**Ele é esperado.** O verificador vê que a função é chamável; não vê o
que tem dentro dela.

## Passo 4 · Baixar o backup das contas
**10 minutos · no painel · antes do piloto**

O dump que eu gerei (`dados-2026-08-16.sql`) tem as tabelas do seu
esquema, mas **não tem `auth.users`** — as contas de login pertencem ao
sistema de autenticação do Supabase e só saem pelo backup dele.

Sem elas, `profiles` e `user_roles` ficam órfãos na restauração: os
registros existem, mas apontam para contas que não existem mais.

Hoje é uma conta, a sua. É por isso que o momento de aprender isso é
agora, e não com trinta tatuadores dentro.

> **Supabase → Database → Backups → baixar o backup lógico**
> Guarde junto do `.zip`, fora deste computador.

## Passo 5 · SMTP próprio
**30 minutos · antes de convidar alguém**

O envio de e-mail embutido do Supabase manda **2 mensagens por hora no
projeto inteiro**. Não é limite por usuário — é o total.

Na prática: a terceira pessoa que tentar criar conta no seu piloto não
recebe o e-mail de confirmação. E como conta não confirmada é
read-only por regra sua, ela fica travada sem entender por quê.

Não é exatamente segurança, mas está aqui porque **derruba a regra de
e-mail confirmado na prática** — e é uma das travas de segurança do
produto.

Resend ou Postmark resolvem no plano gratuito. O passo a passo está em
`CONFIRMAR-EMAIL.md`.

## Passo 6 · Ambiente separado para testar
**algumas horas · quando o backend começar a crescer**

Hoje existe um banco só. Quando você for construir as tabelas de
check-in, vai testar migração em cima do banco que os tatuadores estão
usando.

Enquanto há uma conta, isso é aceitável. Quando houver piloto, não é: um
comando errado apaga dado de gente real.

O Supabase tem *branches* de banco justamente para isso, no plano pago.

## Passo 7 · Chave do Google Maps
**quando existir**

Está em `decisoes/pendencias.md` e continua válido, com uma boa notícia:
**hoje não existe nenhuma chave do Google no código.** O item vira real
no dia em que o mapa deixar de ser simulado.

Quando chegar lá: restringir a chave por referenciador HTTP, para que só
funcione a partir do seu domínio. Chave de Maps sem restrição é a forma
mais comum de alguém receber uma fatura inesperada.

---

## Resumo da ordem

| | Ação | Tempo | Quando |
|---|---|---|---|
| 1 | Proteção contra senha vazada | 5 min | hoje |
| 2 | `revoke execute` em `esquecer_participante` | 5 min | hoje |
| 3 | Deixar os outros dois avisos como estão | — | decisão registrada |
| 4 | Backup das contas de login | 10 min | antes do piloto |
| 5 | SMTP próprio | 30 min | antes de convidar alguém |
| 6 | Ambiente separado | horas | quando o backend crescer |
| 7 | Restringir a chave do Maps | — | quando existir chave |

Os passos 1 e 2 fecham tudo o que o verificador aponta hoje. Os demais
são preparação para ter gente dentro.

---

## O que este documento não cobre

- **Configurações do painel** — provedores de login, URLs de
  redirecionamento, SMTP. Não vêm em dump de banco. Estão descritas em
  `CONFIRMAR-EMAIL.md`.
- **Os arquivos dos buckets.** Hoje vazios.
- **Segurança do lado do navegador.** O protótipo é HTML servido
  estaticamente, sem dado sensível embutido — mas isso muda no dia em
  que houver upload de imagem de referência.
