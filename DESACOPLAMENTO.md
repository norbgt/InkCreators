# Diagnóstico de desacoplamento do Lovable

16 de agosto de 2026 · auditoria feita no repositório e na conta Supabase,
não de memória

## Veredito

**Você está desacoplada.** Não existe nenhuma dependência técnica do
Lovable no que roda hoje. Sobraram três pendências, e nenhuma delas
bloqueia escalar — uma é operacional e urgente, uma é de dado antigo, e
uma é de crédito de origem.

---

## O que a auditoria encontrou

### Código: zero acoplamento

| Verificação | Resultado |
|---|---|
| Menções a Lovable no código | **0** |
| Menções a Lovable na documentação | 49, todas descrevendo *como sair* |
| `package.json`, `node_modules`, `vite.config` | **não existem** |
| `@lovable.dev/vite-tanstack-config` | não existe |
| `componentTagger`, `window.__lovableEvents` | não existem |
| Dependências externas em tempo de execução | **duas**: `supabase.co` (seu) e `esm.sh` (CDN público) |
| Chaves de terceiros no código | **nenhuma** |

O protótipo é um arquivo HTML sem build, sem empacotador e sem
dependência de npm. Isso é o oposto de acoplamento: **não há
configuração escondida para alguém reconstruir.** Era esse o risco
principal apontado na decisão 002 — "quebrar sutilmente na migração do
build" — e ele desapareceu porque o build deixou de existir.

### Banco: na sua organização

| Verificação | Resultado |
|---|---|
| Organizações na sua conta | uma: **norbgt** |
| Projetos | um: **Ink Creators** (`hdfigxygektppvlogaoj`), criado em 26/07/2026, dentro da sua organização |
| Projeto do Lovable (`xfiilquqnqgfjzmlasyx`) | **não aparece na sua conta** |
| Edge Functions | nenhuma — nada de código de servidor de terceiro |
| Região | ca-central-1 |

O banco em uso é **seu**, criado por você, dentro da sua organização.
Não é um projeto provisionado pelo Lovable Cloud. Aquele risco de
titularidade que a decisão 002 levantou não se materializou.

### Hospedagem e repositório: seus

- Repositório: `github.com/norbgt/InkCreators`, 92 commits
- Publicação: GitHub Pages, no seu repositório
- Nada em `*.lovable.app`

### O que veio do Lovable e ficou

Três coisas, todas em pastas próprias e **nenhuma delas executada por
nada**:

- **`banco/`** — o esquema inicial e 16 migrações do período Lovable.
  São SQL puro, padrão Postgres. Não têm nada de proprietário: é o seu
  modelo de dados, e reaproveitá-lo foi economia, não dependência.
- **`dominio/`** — seis arquivos TypeScript com prompts, vocabulário de
  portfólio, catálogo de estilos e a lógica de matching. Auditei: **nada
  importa esses arquivos**. Ficaram como acervo. O `ia-provedor.ts` já
  vem com o acoplamento isolado num ponto só, e o comentário no topo
  explica que o gateway proprietário foi trocado por chamada direta ao
  Google AI Studio.
- **`documentos/`** — os diagnósticos originais. Só leitura.

Nada disso roda. É biblioteca, não dependência.

---

## As três pendências

### 1. O banco está PAUSADO — e isso é urgente

O projeto `Ink Creators` está com status **INACTIVE**. O Supabase pausa
projetos do plano gratuito depois de um período sem uso.

**Consequência prática:** o modo "banco real" no endereço publicado não
funciona agora. Se você mandar o link de teste hoje, o catálogo fictício
continua navegável (é o modo demo), mas qualquer coisa que dependa do
banco falha.

**O que fazer:** entrar no painel do Supabase e retomar o projeto. Leva
um clique e alguns minutos. E, antes do piloto, considerar o plano pago
— justamente para não pausar sozinho no meio de um teste com gente.

Isso não tem nada a ver com Lovable. É o item mais urgente da lista
mesmo assim.

### 2. O projeto antigo do Lovable não está ao seu alcance

O `xfiilquqnqgfjzmlasyx`, citado em `decisoes/pendencias.md`, **não
aparece na sua conta**. Ou foi apagado, ou pertence a uma organização
que não é sua.

Se pertence ao Lovable, você não consegue exportar o que estiver lá.

**O quanto isso importa:** provavelmente nada. Aquele projeto guardava
testes seus do período de protótipo. Vale dez minutos para confirmar:
entrar no Lovable e ver se o projeto ainda existe, e se há dado que você
queira. Se não houver, marque como resolvido e siga.

**O que eu não recomendo:** deixar essa dúvida em aberto por meses. Se
um dia houver dado que importe, o acesso pode já ter expirado.

### 3. Crédito de origem

`decisoes/002-saida-do-lovable.md` e `documentos/05-saida-do-lovable.md`
registram a história. Isso é bom — decisão sem histórico se repete.

Mas se o projeto virar produto com investidor ou sócio, vale ter claro
que **o código atual não é derivado do código do Lovable**: o protótipo
foi reescrito do zero, e o que sobrou daquela fase é esquema de banco e
prompts, escritos por você com apoio de ferramenta. Se isso virar
pergunta formal um dia, é conversa de advogado — mas a resposta técnica
é confortável, e este documento serve de registro dela.

---

## O que sobrou de dependência de terceiro, e é normal

Toda plataforma depende de alguém. O que importa é se a troca é cara.

| Fornecedor | Para quê | Custo de trocar |
|---|---|---|
| Supabase | banco, auth, storage | **Médio.** Postgres padrão, exportável com `pg_dump`. O que prende é a autenticação, e é migrável. |
| GitHub Pages | publicação | **Baixo.** São arquivos estáticos. Netlify, Vercel ou Cloudflare servem em minutos. |
| esm.sh | carrega a biblioteca do Supabase no navegador | **Baixo.** Um arquivo local resolve, se um dia importar. |
| Google (Maps, AI, OAuth) | integrações futuras | **Nenhum ainda** — não existem no código atual. |

Nenhuma dessas é armadilha. A única que exige plano é o Supabase, e é
exatamente a que você quer manter enquanto o produto for pequeno.

---

## O que fazer, em ordem

1. **Retomar o projeto no Supabase.** Hoje. É um clique e destrava o
   teste.
2. **Fazer um backup do banco** (`pg_dump`). Não existe backup nenhum
   hoje, e isso é um risco maior que qualquer resquício de Lovable.
3. **Conferir o projeto antigo no Lovable** — dez minutos para saber se
   há dado a resgatar. Depois, encerrar o assunto.
4. **Enviar os 13 commits pendentes**, para o endereço online refletir o
   que existe.

Os itens 1 e 2 são de operação, não de desacoplamento — mas ficam nesta
lista porque a pergunta que você fez, no fundo, é "posso escalar sem
depender de ninguém?", e a resposta honesta inclui **"sim, e o que te
ameaça agora é não ter backup, não é o Lovable".**


---

## Resolvido em 16/08/2026

**1. Ping diário.** `.github/workflows/manter-banco-acordado.yml` faz uma
consulta ao catálogo de estilos todo dia às 6h de Brasília, na
infraestrutura do GitHub. Não depende do seu computador. É remendo: a
garantia contra pausa é o plano Pro, e antes do piloto vale trocar — um
teste que morre porque o banco dormiu custa mais que a mensalidade.

**2. Lovable separado.** A análise de saída foi para `lovable.backup/`,
com um `LEIA.md` que registra a auditoria e a pendência de dez minutos
(conferir se o projeto antigo ainda existe). Ficaram fora da pasta, de
propósito: a decisão 002 (log de decisões com buraco deixa de ser log),
`banco/` (documentação viva do banco atual) e `dominio/` (ativo seu).

**3. Backup v0.** `fazer-backup.command` empacota o projeto e consolida
o esquema. A versão `v0-2026-08-16` está em `backups/`, com tag `v0` no
git.

### Fechado em 16/08, com o banco ativo

Você retomou o projeto e deu para concluir o que estava bloqueado.

**Estado confirmado:** `ACTIVE_HEALTHY`, Postgres 17.6, ca-central-1.

**O ping foi verificado, não presumido.** Confirmei no banco que a
política `Styles are viewable by everyone` deixa o papel anônimo ler
`tattoo_styles` — ou seja, a chamada do workflow retorna conteúdo de
verdade. Aproveitei para endurecer a checagem: além de exigir HTTP 200,
ela falha se a resposta vier vazia. Uma lista vazia com 200 significaria
banco acordado mas catálogo deixando de ser público — e o feed de
descoberta ficaria em branco para quem não fez login. Sem essa
verificação, o alarme só tocaria quando alguém reclamasse.

**O backup agora tem os dados.** `backups/v0-2026-08-16/` guarda quatro
arquivos:

| Arquivo | O que é |
|---|---|
| `InkCreators-v0-2026-08-16.zip` | o projeto inteiro, 98 arquivos, 1,6 MB |
| `esquema-consolidado.sql` | as 17 migrações num arquivo só |
| `dados-2026-08-16.sql` | o conteúdo do banco, pronto para reinserir |
| `seguranca-2026-08-16.md` | o retrato de RLS, funções e buckets |

**O que o banco tinha:** 13 tabelas, todas com RLS ligado, 43 políticas,
9 funções `SECURITY DEFINER` em `private`, 3 buckets, 1 conta. Só quatro
tabelas com conteúdo — 17 estilos, 13 nomes reservados, 1 perfil e 3
papéis. Nove tabelas vazias, inclusive as duas de telemetria.

Vale olhar esse retrato de frente: **é um banco bem construído e sem
uso.** A segurança está madura — funções de autorização fora do alcance
da API, e-mail não confirmado sem poder criar conteúdo, telemetria que
qualquer um escreve e só admin lê. E não há uma única sessão de teste.

O `seguranca-2026-08-16.md` é a peça que eu mais recomendo guardar: ele
foi tirado do banco em funcionamento, não das migrações, então descreve
o que **está** no ar e não o que se pretendeu.

### O que ficou dependendo de você


- **Tirar o `.zip` deste computador.** É o único item que continua
  aberto e o único que importa de verdade. Backup no mesmo disco do
  original não é backup.
- **As contas de `auth.users` não estão no dump.** São do Supabase Auth
  e só saem pelo backup lógico do painel. Hoje é uma conta — a sua — mas
  vale saber antes de precisar restaurar.
- **Enviar os commits pendentes**, para o endereço online refletir o que
  existe.
- **Tirar o `.zip` deste computador.** Backup no mesmo disco do original
  não é backup.
