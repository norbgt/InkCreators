# Análise completa da construção

19 de agosto de 2026 · medido sobre o protótipo do dia (7.794 linhas, 233 funções, 11 roteiros verdes)

Quatro perguntas suas, quatro partes. Tudo aqui foi **medido hoje**, não
lembrado — os números vêm de varreduras sobre o código como ele está.

---

## Parte 1 — Redundâncias

### O que já foi limpo, e está guardado por teste

A caça a redundância foi o motor das últimas vinte rodadas. O que já
caiu, com o guarda que impede a volta:

| redundância que existia | resolução | guarda |
|---|---|---|
| 9 abas do tatuador com conteúdo sobreposto | 6 abas, cada assunto numa casa | `gestao-do-estudio` conta e nomeia |
| check-in listando as mesmas sessões da agenda | QR abre na linha da sessão | sabotado e acusado |
| "Quem eu tatuei" repetido em Caixa e Histórico | uma casa (hoje, Agenda) | `nada-se-perdeu` rastreia o destino |
| card da loja parecido com o do feed | é o MESMO componente, `post prod` | acusa se perder a classe |
| "Onde você tatuou" (check-ins) ≈ "Onde eu tatuei" (histórico) | ficou uma, com decisão escrita | lista de saídas com motivo |
| cartão "Sobrou" repetindo a seção logo abaixo | regra: painel só aponta para fora | comparação rótulo+valor |
| aviso explicando o que a tela já mostrava (3 casos) | saíram a seu pedido | testes medem a coisa, não o texto |

### As redundâncias que restam — e o parecer sobre cada uma

**1. Dois componentes de linha de lista: `.lrow` (19 usos) e `.item` (13
usos).** Fazem o mesmo trabalho — avatar, texto, valor à direita. É a
maior redundância estrutural viva. O diagnóstico de consistência exige
que ambos existam, o que hoje **protege a duplicação em vez de
combatê-la**. Recomendo fundir em um na próxima rodada de fôlego; é
mecânico, mas toca ~30 lugares.

**2. Duas fontes para "sessões do cliente": `BOOK` (agenda do tatuador)
e `minhasSessoes()` (lado do cliente).** No produto real são a mesma
tabela lida por RLS de dois papéis. No protótipo são duas listas
escritas à mão que podem divergir em silêncio — a Marina pode ter uma
sessão dia 12 que o cliente não vê. Aceitável em mock, mas merece um
teste de reciprocidade como o do passaporte↔trajetória.

**3. `ST_ROTA_ANTIGA` acumula camadas.** Cada mudança de arquitetura
deixa uma tradução, e já há tradução de tradução (`studio-caixa` →
Financeiro, que nem existia quando a rota nasceu). Hoje funciona e tem
teste; o risco é daqui a cinco reorganizações. Quando o backend real
chegar, essas rotas antigas devem morrer de vez — nenhum usuário real
as terá visto.

**4. `.card` usado 92 vezes.** Não é redundância entre componentes, é o
componente-depósito: quase tudo vira card. Metade desses usos é moldura
legítima; a outra metade é hábito. Não recomendo mexer agora — custa
muito e rende pouco — mas toda tela nova deveria nascer perguntando "isto
precisa de moldura?", como o cabeçalho do perfil já respondeu que não.

**Veredicto da parte 1:** a arquitetura não tem mais redundância que o
usuário perceba. O que resta é interno (dois componentes de linha, duas
fontes de mock) e está mapeado.

---

## Parte 2 — Arquitetura e consistência

### O mapa como está

| papel | navegação | seções internas |
|---|---|---|
| **Cliente** | Visão geral · Passaporte · Formação | VG: resumo, minhas sessões, orçamentos, pagamentos |
| **Tatuador** | Visão geral · Orçamentos · Agenda · Financeiro · Reputação · Cursos e eventos | Agenda: agendado, quem tatuei, próximas · Financeiro: dinheiro, lançamentos · Reputação: avaliações, onde tatuei |
| **Fornecedor** | Painel · Recomendações · Embaixadores · Loja · Perfil | Loja: produtos, pedidos |

### Os padrões que hoje são lei (e têm teste)

- **Aba = outro destino; toggle = outra fatia do mesmo lugar.** Sua
  correção da decisão 012, hoje verificada por forma (sublinhado vs
  pílula).
- **Teto de 6 abas** por papel.
- **Toda aba tem número no painel** — a regra que nasceu do defeito de
  ontem.
- **Fluxo com passos nunca convive com página que rola** (Orçamentos
  recebidos).
- **Reciprocidade estrutural:** passaporte e trajetória saem da mesma
  função com o sujeito trocado; a mesma faixa de números nos dois lados.
- **Chave de estado descreve o que o rótulo diz** (`mes`→`agendado`).
- **Estado gravado nunca manda em arquitetura que não conhece**
  (`limparSubAntigo`).

### As inconsistências que restam — em ordem de importância

**1. O cliente e o tatuador usam arquiteturas diferentes para o mesmo
problema.** O tatuador tem Financeiro como **aba**; o cliente tem
Pagamentos como **seção** da Visão geral. O tatuador tem Agenda; as
sessões do cliente são seção. A assimetria tem defesa (o cliente usa
menos, empilhar é ok para pouco uso) — mas a mesma pessoa troca de papel,
e hoje ela precisa reaprender onde o dinheiro mora ao trocar. Vale uma
decisão explícita: ou se aceita a assimetria por escrito, ou o cliente
ganha as mesmas casas quando o uso crescer.

**2. Três níveis de navegação convivem no tatuador:** aba (subnav),
toggle (segmento) e chips internos (`chipsInternos` em Cursos e
eventos). O terceiro nível existe num lugar só. Ou ele é padrão — e
outros lugares com dois recortes deveriam usá-lo — ou é exceção
documentada. Hoje é exceção não documentada.

**3. Nomes de dinheiro:** a aba chama **Financeiro**, a seção dentro
chama **Dinheiro**, o cliente vê **Pagamentos**, o fornecedor vê
**Vendido**. Quatro palavras para o mesmo campo semântico. Não é grave —
cada uma está no seu contexto — mas num glossário de produto isso vira
regra: *Financeiro é o lugar, dinheiro é o assunto, pagamento é o ato.*

**4. 36 botões renderizados sem `onclick`.** A maioria é deliberada
(mock de área ainda não construída: "Exportar", "Divulgar", "Trocar
avatar") — mas "Detalhes" sem onclick já produziu um defeito real nesta
construção. Recomendo: todo botão morto ganha `tg("mock")` visível ou
`disabled`, para o teste de usuário não clicar no vazio três vezes.

---

## Parte 3 — Design system

### O que está sólido (e melhor que muito produto lançado)

- **Espaçamento:** 6 degraus (`--e1..--e6`), zero valores à mão no
  render — eram 708. Guardado por teste que conta.
- **Raios:** 3 (`2 · 4 · 999`), eram 15.
- **Traço:** `--hair` único; hierarquia por cor (`--border`/`--rule`),
  não por espessura.
- **Breakpoints:** conjunto fechado (400/460/560/699‑700/1100), escolhido
  nos vãos entre aparelhos, com o par 699/700 fechado dos dois lados.
- **Tipo:** 7 tokens fluidos com `clamp()`; números em `tabular-nums`
  onde a largura importa.
- **Toque:** `pointer:coarse` leva alvos a 44px; testado por componente.
- **Acento petróleo** com 7,8:1 nos dois sentidos — serve de texto e de
  fundo.
- **Movimento:** uma duração (200ms) + uma lenta (380ms), uma curva.

### O que ainda desvia das melhores práticas — medido

**1. A tipografia vazou dos tokens.** Existem **7 tokens** de tipo, mas
medi **~65 `font-size` em px no CSS** (21 valores distintos, de 9px a
36px) e **~59 inline no render**. É a mesma entropia que o espaçamento
tinha antes da régua — 11.5px, 12.5px, 13.5px convivendo. Nenhum teste
cobre isso hoje. É a **maior dívida do design system**, e a correção é a
mesma que funcionou no espaçamento: medir, definir a escala, normalizar,
e um guarda que conta.

**2. Fonte mínima de 9–9.5px.** Aparece em 6 lugares. Abaixo de 10px é
ilegível para uma parcela real de gente e falha WCAG na prática.
Deveriam subir para o token `--t-micro`.

**3. Cores fora dos tokens: 16 ocorrências hex no render.** Aqui o
parecer é **absolvição na maioria**: são as texturas procedurais
(`tex()`) e overlays sobre foto (`rgba(0,0,0,.55)`), que não devem
seguir o tema mesmo — foto não muda com dark mode. Só `#111` (3×) e
`#aaa` merecem virar token.

**4. Acessibilidade não é medida.** Contraste do acento foi calculado,
alvos de toque são testados — mas ninguém verifica `aria-label` de forma
sistemática, ordem de foco, ou navegação por teclado nas gavetas. Para
um teste com usuários reais isso não bloqueia; para lançar, bloqueia.

---

## Parte 4 — Diagnóstico dos fluxos: o que existe, o que falta, o que vem a seguir

### O estado, medido pelas etiquetas do próprio produto

O protótipo se auto-declara, tela a tela: **10 blocos `real`** (gravam
no Supabase), **27 `mock`** (só interface), **19 `novo`** (proposta de
produto ainda não validada).

**Real hoje:** cadastro/onboarding do tatuador (3 passos), portfólio,
tabela de preços, informações públicas, Instagram, pedido de orçamento
do cliente (grava `quote_requests` + `quote_matches`), telemetria do
teste. **13 tabelas no Supabase, todas com RLS.**

**Mock estruturante** (a espinha do produto, ainda sem backend): a
resposta ao orçamento pelo tatuador, agenda/sessões, check-in/checkout,
avaliações, caixa/lançamentos, chat, notificações, loja, eventos/cursos,
toda a área do fornecedor.

### O que recomendo construir a seguir — e o que recomendo NÃO construir

**Passo 0, antes de qualquer código: o teste com usuários.** Está tudo
pronto há semanas — link publicado, telemetria, painel — e **0 sessões, 0
convidados**. Cada fluxo construído antes do teste é aposta; cada um
construído depois é resposta. As pendências operacionais são suas e
continuam as mesmas: SMTP antes de convidar, os 37 commits para enviar
(`ENVIAR-E-TESTAR.command`), e Supabase Pro antes do piloto.

**Depois do teste, a ordem que defendo — pelo critério "o que fecha o
ciclo de valor com o menor backend":**

1. **A resposta ao orçamento (lado do tatuador).** O pedido do cliente
   já grava de verdade; a resposta é mock. É a metade que falta do único
   fluxo que já cruza os dois papéis — e é onde o modelo "cada um
   responde com o preço dele" vira realidade. Uma tabela
   (`quote_responses`), duas telas que já existem.
2. **Aceite + sessão marcada.** O cliente escolhe uma proposta, o
   tatuador confirma a data (a agenda é dele — decisão 030), nasce a
   linha em `sessions`. Alimenta "Minhas sessões", "Quem vem por aí" e
   "Agendado" com o mesmo dado — matando a redundância nº 2 da parte 1.
3. **Check-in/checkout reais.** O QR já tem todo o fluxo desenhado; a
   sessão real da etapa 2 dá a ele o que carimbar. É o que destrava
   passaporte, trajetória e avaliação — o triângulo de confiança que é a
   tese do produto.
4. **Chat.** Só depois dos três acima: conversa sem orçamento nem sessão
   por trás é o fluxo mais caro de moderar e o mais fácil de vazar para
   o WhatsApp.

**Não construir agora:** Google Agenda de verdade (a simulação já testa
a decisão — `GOOGLE-AGENDA.md` continua valendo), pagamentos/split (não
antes de existir sessão real e volume), loja com estoque real, e
qualquer coisa da área do fornecedor — ela é etiquetada `novo` porque é
**tese**, e tese se valida com o teste, não com backend.

---

## Resumo executivo

A construção está **consistente onde o usuário toca** e as regras que a
mantêm assim estão em teste, não em memória. As dívidas reais são três,
em escala decrescente: a tipografia fora dos tokens (a próxima
normalização), a fusão `.lrow`/`.item`, e a decisão explícita sobre a
assimetria cliente/tatuador. Nenhuma bloqueia o teste com usuários — e o
teste é, hoje, o único item do caminho crítico que não depende de mim.
