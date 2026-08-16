# Pendências

Itens que dependem de você — eu não consigo executar nenhum destes sozinha.
Ordenados por urgência.

---

## 🔴 P0 — Ligar o GitHub Pages e criar sua conta admin

Sem esses dois passos o teste não sai do lugar. Passo a passo em
`PUBLICAR.md`.

- [ ] Settings → Pages → Branch **main**, pasta **/ (root)**
- [ ] Criar sua conta pelo protótipo (menu → conexão com o banco)
- [ ] Me dizer qual e-mail usou, para eu dar o papel `admin`

Enquanto o papel não existir, o painel diz que a conta não é admin —
comportamento certo, não erro.

---

## 🟠 P1 — Definir a retenção dos dados do teste

Nome e e-mail de participantes são dado pessoal. O consentimento já é
obrigatório e a exclusão a pedido já funciona
(`select public.esquecer_participante('email')`). Falta decidir:

- [ ] Base legal declarada
- [ ] Quantos dias guardar depois de ler os resultados
- [ ] Apagar de fato quando esse prazo vencer

---

## 🔴 P0 — Existem dois projetos Supabase

Descoberto em 26/07: o projeto que você indicou como seu **não é** o mesmo que roda o protótipo hoje.

| Projeto | Identificador | O que tem dentro |
|---|---|---|
| Do Lovable | `xfiilquqnqgfjzmlasyx` | Schema aplicado e os dados existentes até hoje |
| **Seu** | `hdfigxygektppvlogaoj` | Presumivelmente vazio |

Isso é **boa notícia**: você já tem um projeto sob seu controle, e não depende de transferência de titularidade. Mas exige uma decisão.

### Decisão necessária: o que fazer com os dados do projeto antigo

**Se os dados do projeto Lovable não importam** (só testes seus durante o protótipo):
Aplicar `banco/esquema/00_esquema_inicial.sql` no seu projeto e seguir. Caminho mais limpo — o furo de segurança da tabela `profiles` nunca chega a existir no banco novo.

**Se houver dado real a preservar** (tatuadores cadastrados, portfólios, orçamentos):
1. `pg_dump` apenas dos dados do projeto antigo, sem schema
2. Aplicar `00_esquema_inicial.sql` no projeto novo
3. Importar os dados
4. Conferir que as políticas de RLS continuam se comportando

**Como decidir:** entre no painel do projeto `xfiilq…` e veja quantas linhas existem em `profiles`, `artists` e `quote_requests`. Se forem só contas suas de teste, o primeiro caminho serve.

- [ ] Verificar o volume de dados no projeto antigo
- [ ] Decidir entre recomeçar limpo ou migrar
- [ ] Aplicar o esquema inicial no projeto `hdfigxygektppvlogaoj`

---

## 🔴 P0 — Backup completo antes de qualquer mudança

Independente do resultado acima. Um backup datado transforma qualquer erro futuro em inconveniente em vez de perda.

- [ ] `pg_dump` do banco inteiro — schema e dados
- [ ] Download dos buckets de storage: avatares, portfólio, uploads de orçamento
- [ ] Guardar **fora deste repositório** — o `.gitignore` bloqueia `backups/` justamente porque esses arquivos contêm dados pessoais de usuários reais

---

## 🟠 P1 — Aplicar as correções de segurança

Os arquivos estão prontos em `banco/correcoes/`. Precisam ser executados contra o banco.

- [ ] `17_restringe_leitura_de_perfis.sql` — hoje qualquer pessoa com a chave pública lê nome, cidade e foto de todos os clientes
- [ ] Restringir a chave do Google Maps por referenciador HTTP no Google Cloud Console — sem isso, qualquer um usa e a fatura é sua
- [ ] Trocar as chaves que circularam dentro do zip compartilhado

---

## 🟠 P1 — Criar contas e chaves próprias

Pré-requisito para sair do Lovable. Vale ter em mãos antes de precisar.

- [ ] Google AI Studio → `GOOGLE_AI_API_KEY` (substitui o gateway de IA do Lovable)
- [ ] Google Cloud → chave do Maps para servidor e outra para navegador, com restrição de domínio
- [ ] Google Cloud → credenciais OAuth para o login com Google, configuradas no painel do Supabase

---

## 🟠 P1 — Fechar a integração com o Google Maps

A geolocalização do navegador já funciona de verdade no protótipo: pede
permissão, devolve as coordenadas do aparelho e recalcula a distância até
cada evento por haversine. Isso não precisa de chave nem de conta.

O que ainda falta, e depende de chave própria:

- [ ] **Geocodificação reversa** — transformar coordenada em endereço
      legível. Hoje mostra "sua localização atual" em vez do bairro.
- [ ] **Busca por endereço digitado** — a pessoa escrever "Pinheiros" e o
      mapa ir até lá.
- [ ] **Mapa de verdade** — hoje é uma grade simulada com pinos posicionados
      por percentual, não por coordenada real.

As três chamadas precisam passar por servidor, não pelo navegador, senão
a chave fica exposta. É o mesmo cuidado da chave de IA.

Nota: as coordenadas dos eventos são fictícias, mas plausíveis (pontos
reais de São Paulo). O cálculo de distância é real.

---

## 🟡 P2 — Decisões de produto em aberto

Não bloqueiam nada técnico, mas definem o que vale construir.

**Qual é o produto principal?** Hoje o projeto tenta ser cinco coisas: marketplace de descoberta, orçamentista por IA, gestão de estúdio, loja e plataforma de cursos. Sete módulos são interface sem backend. Escolher o núcleo — e rebaixar o resto a hipótese — é a decisão de maior impacto disponível.

**Quem paga, e por quê?** A landing desenha assinatura para o tatuador. Marketplaces costumam cobrar por transação, porque assinatura pesa justamente sobre quem ainda não faturou.

**Quanto custa um orçamento?** Cada análise envia até 8 imagens a um modelo de visão. Sem esse número, qualquer plano de preço é chute — inclusive o gratuito.

---

## 🟡 P2 — Tratamento de imagem corporal

O fluxo de orçamento coleta foto de parte do corpo. Sob a LGPD isso é dado pessoal, e a depender do que a imagem revela pode ser sensível.

Hoje o código **não persiste** essas imagens — o upload ficou para depois. É a melhor janela possível para definir as regras, antes de existir dado armazenado.

- [ ] Base legal para o tratamento
- [ ] Prazo de retenção e exclusão automática
- [ ] Quem pode ver, por quanto tempo
- [ ] Caminho de exclusão a pedido do titular
- [ ] Aviso de privacidade no momento do upload

Não sou advogada e isto não é orientação jurídica — é sinalização de um tema que precisa de quem seja.

---

## Sem prazo — dívidas conhecidas

- Cobertura de teste quase nula: 1 arquivo para 40+ políticas de RLS
- Ambiente único: toda mudança de schema acontece direto onde os usuários estariam
- `TopBar.tsx` e `me.tsx` escrevem o azul petróleo direto no JSX, com valor que nem bate com o token — e por isso ignoram o tema escuro


---

## Atualização — 28/07/2026, auditoria de desacoplamento

Auditoria feita no repositório e na conta Supabase (ver `DESACOPLAMENTO.md`):

- **Nenhuma dependência técnica do Lovable no que roda hoje.** Zero menções no código, sem build, sem npm.
- **O banco está na organização `norbgt`, sua.** O risco de titularidade levantado na decisão 002 não se materializou.
- **O projeto `xfiilquqnqgfjzmlasyx` não aparece na sua conta** — ou foi apagado, ou é de outra organização. Confirmar no Lovable e encerrar o assunto.
- **O projeto Supabase está PAUSADO (INACTIVE).** Retomar antes de qualquer teste com gente.
- **Continua sem backup.** É o maior risco aberto do projeto, maior que qualquer resquício de Lovable.


---

## Passo a passo de segurança — 16/08/2026

Rodei o verificador do Supabase e conferi o corpo de cada função
apontada. Nenhum apontamento é buraco aberto. A lista completa, com
explicação em português comum, está em `SEGURANCA.md`.

- [ ] **1.** Ligar proteção contra senha vazada (painel, 5 min) — hoje
- [x] **2.** `revoke execute` em `esquecer_participante` — **feito 16/08**, migração 25
- [x] **3.** `acrescentar_meu_papel` e `remover_meu_papel` ficam públicas — decisão registrada, cada uma se protege sozinha
- [ ] **4.** Baixar backup de `auth.users` (painel, 10 min) — antes do piloto
- [ ] **5.** SMTP próprio (30 min) — antes de convidar alguém · passo a passo pronto em `SMTP-PRONTO-PARA-COLAR.md`
- [ ] **6.** Ambiente separado do de produção — quando o backend crescer
- [ ] **7.** Restringir a chave do Maps — quando existir chave
