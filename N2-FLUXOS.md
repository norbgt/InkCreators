# N2 — Os fluxos que nascem da navegação global

20 de agosto de 2026 · medido sobre o protótipo do dia (11 roteiros verdes, `fluxos.js` atualizado)

**Definições combinadas:** N1 é a navegação global — barra superior,
abas da home, navegações das três áreas. N2 é todo fluxo que se inicia
por botão ou hyperlink da N1.

**Como ler a maturidade:** três camadas por fluxo. **Interface** (a
tela existe e as interações vivem?), **sustentação** (% de etapas com
backend real, medido pelo `fluxos.js`), **guarda** (existe teste que
acusa regressão?). **Relevância** é o peso para a tese do produto
(confiança entre cliente e tatuador), para a receita escolhida e para o
teste com usuários que está começando.

---

## Os 18 fluxos N2, porta a porta

### Do topo (toda sessão)

| # | fluxo | porta | interface | sustentação | guarda | relevância |
|---|---|---|---|---|---|---|
| 1 | **Pedir orçamento** (2 passos + pool) | ✨ Orçamentos · card do feed · perfil | completa, recém-refeita por você | 67% — quebra no envio de imagem | forte (porta real testada) | **altíssima** — é a tese |
| 2 | **Entrar / criar conta** (3 passos, senha ou Google) | Entrar | completa | real; Google aguarda provedor (dec. 041) | forte | **altíssima** — condiciona tudo |
| 3 | **Conhecer → criar conta** | ✨ Conhecer | completa (trilhos novos) | landing é conteúdo; CTA leva ao nº 2 | forte | alta para o teste |
| 4 | **Busca global** | campo ⌕ do topo | parcial — busca dentro da aba ativa | só front | fraca | média |
| 5 | **Carrinho → checkout** | 🛒 | telas completas; "Finalizar" é maquete declarada | 0% | média | média — receita, mas depois |
| 6 | **Notificações** | 🔔 | gaveta completa, filtros | mock | fraca | baixa agora |
| 7 | **Chat** | 💬 | gaveta completa, conversa simulada | mock (sem tabela) | fraca | alta na tese, **cedo no tempo** — chat sem orçamento/sessão atrás vaza para o WhatsApp |

### Da home (descoberta)

| # | fluxo | porta | interface | sustentação | guarda | relevância |
|---|---|---|---|---|---|---|
| 8 | **Descobrir tatuador → perfil → orçar/conversar/seguir** | aba Tatuadores | completa (masonry novo) | 70% — quebra nas avaliações | forte | **altíssima** |
| 9 | **Descobrir estúdio → página do estúdio** | toggle Estúdios | completa, recém-nascida | mock | média | média-alta — diferencial |
| 10 | **Comprar na loja** | aba Lojas | completa (grade/lista novas) | 0% | forte na UI | média — receita depois do teste |
| 11 | **Eventos e cursos → inscrever** | aba Eventos | lista/mapa completos; inscrever é maquete | 17% | fraca | média |
| 12 | **Publicar / Vender / Divulgar** | botões da home | portas para nº 14 e maquete honesta | — | média | baixa |

### Da área do cliente

| # | fluxo | porta | interface | sustentação | guarda | relevância |
|---|---|---|---|---|---|---|
| 13 | **Acompanhar orçamentos → aceitar/recusar** | Visão geral · Meus orçamentos | completa | acompanhar é real; **aceitar é a metade que falta** | média | **altíssima — o próximo elo** |
| 14 | **Passaporte / check-in (escanear QR)** | Passaporte | completa e desenhada ponta a ponta | mock | forte | alta na tese; depende de sessão real |
| 15 | **Formação (trilha cliente→tatuador)** | Formação | completa | proposta (`novo`) | fraca | baixa agora — é tese a validar |

### Da área do tatuador

| # | fluxo | porta | interface | sustentação | guarda | relevância |
|---|---|---|---|---|---|---|
| 16 | **Responder orçamento** (mapa → pedido → proposta) | Orçamentos | completa, 3 passos | 50% — proposta grava; para no chat/agenda | forte | **altíssima — o outro lado do nº 13** |
| 17 | **Agenda: QR da sessão, check-in/checkout, quem tatuei** | Agenda | completa | mock | forte | alta; vira real com a sessão |
| 18 | **Montar presença: perfil, portfólio, preços, Instagram** | Meu perfil (e Publicar) | completa | **100% real** | forte | **altíssima para o teste de tatuadores** |

*(Financeiro/lançar, Reputação/responder, Cursos/criar e a área do
fornecedor são N2 de manutenção — telas completas, tudo mock, maquete
honesta onde não age; relevância baixa até existirem sessões reais.)*

---

## Leitura executiva

**O que já sustenta um teste de verdade:** nº 18 (onboarding e presença
do tatuador, 100% real), nº 2 (conta), nº 1 e nº 8 (pedir e descobrir).
É exatamente o funil do seu foco atual — tatuadores primeiro.

**O elo partido do ciclo de valor** está entre nº 16 e nº 13: o
tatuador **responde de verdade** (`responderOrcamento` grava), mas o
cliente **ainda não aceita** — a função de aceite não existe, e sem ela
o ciclo não fecha nem no piloto. É o mesmo diagnóstico da análise da
construção, agora visto pelas portas.

**Recomendação de ordem (depois de publicar e rodar o teste):**

1. **Aceite da proposta** (nº 13) — uma função e um botão que já
   existe na tela; fecha o primeiro ciclo completo da plataforma.
2. **Sessão marcada** a partir do aceite — destrava nº 14 e nº 17, que
   já estão desenhados e guardados.
3. **Upload real de referência** no orçamento (nº 1) — o bucket
   existe; é onde o fluxo mais maduro quebra hoje.
4. **Chat** (nº 7) só depois — com orçamento e sessão atrás, ele nasce
   com assunto e sem vazamento.

**Dois fluxos N2 sem dono claro:** a busca global (nº 4) busca só
dentro da aba ativa — ou vira busca de verdade, ou o campo promete
demais; e as notificações (nº 6) não têm fonte real — candidatas a
maquete honesta até segunda ordem.
