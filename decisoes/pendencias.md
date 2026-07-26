# Pendências

Itens que dependem de você — eu não consigo executar nenhum destes sozinha.
Ordenados por urgência.

---

## 🔴 P0 — Titularidade do projeto Supabase

**Por que é prioridade zero:** é o único ponto do desacoplamento com risco real de perda de dado. Todo o resto é trabalho; este é risco.

O Lovable Cloud provisiona projetos Supabase, e dependendo de como o seu foi criado, o dono da organização pode ser o Lovable, não você.

**Como verificar:** entre em `supabase.com/dashboard` e procure o projeto cujo identificador começa com `xfiilq`. Veja se ele aparece na sua conta e em qual organização.

| Resultado | O que significa | Ação |
|---|---|---|
| Aparece na sua organização | O banco já é seu | Nada a fazer. Seguir para P1. |
| Aparece em organização do Lovable | Você usa mas não é dona | Solicitar transferência da organização ao suporte do Lovable |
| Não aparece | Você não tem acesso direto | Idem — e é o cenário mais urgente |

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
