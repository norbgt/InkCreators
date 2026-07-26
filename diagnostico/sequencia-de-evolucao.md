# Diagnóstico de fluxos e sequência de evolução

Data: 26 de julho de 2026
Reexecute o diagnóstico com: `node diagnostico/fluxos.js`

---

## O que o diagnóstico mostrou

Sete fluxos de produto, 32 etapas. **44% das etapas têm sustentação real** — e, mais importante: **nenhum fluxo atravessa do início ao fim sem quebrar.**

| Fluxo | Sustentado | Quebra em |
|---|---|---|
| Descobrir um tatuador | 70% | Ver avaliações |
| Virar tatuador e ser encontrado | 67% | Passar pelo onboarding |
| Pedir um orçamento | 58% | Enviar imagens de referência |
| Responder a um orçamento | 50% | Combinar detalhes por chat |
| Fazer curso ou ir a evento | 17% | Encontrar por proximidade |
| Comprar material ou arte | 0% | Navegar a loja |
| Assinar um plano | 0% | Ver os planos |

A leitura que importa não é a porcentagem — é **onde** cada fluxo para. Um fluxo com 70% que quebra na última etapa está quase pronto. Um com 58% que quebra na primeira não começou.

---

## O raciocínio da sequência

Três restrições determinam a ordem, e nenhuma delas é técnica.

**Primeira: é um mercado de dois lados com partida a frio.** Demanda sem oferta não vale nada. Um cliente que pede orçamento num catálogo vazio não recebe proposta nenhuma e não volta. Então a oferta — o tatuador conseguir existir de verdade na plataforma — precede tudo.

**Segunda: o que mantém a conversa dentro da plataforma define o modelo de negócio.** Se cliente e tatuador combinam por WhatsApp, a plataforma perde a visibilidade do que foi fechado. E sem enxergar o trabalho fechado, comissão por transação deixa de ser possível — sobra só assinatura, que é justamente a hipótese mais frágil. Chat não é conforto: é o que preserva a opção de receita.

**Terceira: dá para chegar longe sem tabela nova.** As duas primeiras ondas usam tabelas que já existem. Isso é raro e vale explorar antes de expandir o schema.

---

## Onda 1 — Fechar a oferta

**Objetivo:** um tatuador consegue se cadastrar, montar o perfil e aparecer no catálogo, sem intervenção manual.

**Por que primeiro:** sem tatuador publicado, o catálogo está vazio e nenhum outro fluxo faz sentido. E é a onda mais barata — não precisa de nenhuma tabela nova.

| | O que fazer |
|---|---|
| **Backend** | Nada novo. `artists`, `artist_styles`, `portfolio_items` e `artist_pricing` já existem com RLS testada. |
| **Frontend** | Ligar o wizard de onboarding ao banco. Implementar o envio de imagem para o bucket `portfolio`. Ligar a tabela de preços por estilo e tamanho. |

**Como saber que terminou:** você cria uma conta de tatuador do zero, sobe três fotos, define preços, publica — e o perfil aparece no catálogo público numa janela anônima.

---

## Onda 2 — Fechar o orçamento

**Objetivo:** o cliente envia referências, recebe uma estimativa de verdade e o pedido chega a tatuadores compatíveis.

**Por que segundo:** é o núcleo defensável do produto. Depende da onda 1 para ter a quem enviar.

| | O que fazer |
|---|---|
| **Backend** | Chave própria do Google AI Studio. Função de servidor que recebe as imagens e chama o modelo — a chave não pode ficar no navegador. Instrumentar custo por chamada. |
| **Frontend** | Upload real de referências para o bucket `quote-uploads`. Resultado da IA vindo do servidor. Aceitar e recusar proposta. |

**Como saber que terminou:** o pedido sai do cliente com imagens reais, a estimativa vem do modelo, o tatuador responde com valor, o cliente aceita — e você consegue dizer quanto custou aquele orçamento em reais.

**Efeito colateral valioso:** ao instrumentar o custo, aquela pergunta do modelo de negócio que está marcada como "mensurável" deixa de ser chute. O simulador de economia unitária passa a operar com número real.

---

## Onda 3 — Fechar a conversa

**Objetivo:** cliente e tatuador combinam os detalhes sem sair da plataforma.

**Por que terceiro:** é onde o fluxo "responder a um orçamento" quebra hoje. E, como dito acima, é o que sustenta a possibilidade de comissão.

| | O que fazer |
|---|---|
| **Backend** | Tabela de conversas e mensagens, com RLS restringindo às duas partes. Vínculo com o pedido de orçamento. Realtime do Supabase para entrega ao vivo. |
| **Frontend** | Substituir o chat fictício. As etiquetas de estágio já desenhadas viram estado real da negociação. |

**Como saber que terminou:** duas contas diferentes, em dois navegadores, conversam e veem as mensagens chegarem.

---

## Onda 4 — Fechar o ciclo

**Objetivo:** a sessão é agendada e, depois, avaliada.

| | O que fazer |
|---|---|
| **Backend** | Tabela de agendamentos ligada ao match aceito. Tabela de avaliações que alimenta `rating_avg` e `rating_count`, hoje decorativos. |
| **Frontend** | Agenda do tatuador com dado real. Avaliação após a sessão. |

**Por que só agora:** avaliação sem sessão realizada não existe. E é aqui que o primeiro fluxo — descobrir um tatuador — finalmente atravessa inteiro, porque as notas deixam de ser fictícias.

---

## Depois disso

Loja, cursos e eventos, e planos de assinatura. Os três estão em 0% ou perto disso, e nenhum é pré-requisito de nada.

A recomendação é adiar deliberadamente, e por dois motivos. Primeiro: cada um é um produto inteiro, com operação própria — logística no caso da loja, produção de conteúdo no caso dos cursos. Segundo, e mais importante: **a decisão de qual é o produto principal ainda está aberta.** Construir esses módulos antes de decidir é apostar em cinco frentes ao mesmo tempo com recurso de uma.

Se algum precisar sair antes, o critério não deve ser facilidade técnica, e sim qual gera evidência para o modelo de negócio.

---

## O que fazer com a interface enquanto isso

O protótipo hoje promete sete fluxos e entrega zero inteiros. Isso é normal num protótipo e vira problema no dia em que a primeira pessoa real criar conta.

Sugestão: à medida que cada onda fecha, os módulos ainda não sustentados saem da navegação principal — não são apagados, ficam atrás de um aviso claro de "em construção". O protótipo continua servindo como espaço de desenho; o produto mostra só o que cumpre.

O modo real, que já está no menu superior, ajuda nisso: ele já mostra a interface sem os enfeites, com as telas vazias dizendo por que estão vazias.
