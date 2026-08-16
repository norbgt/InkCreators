# Sair do Lovable sem perder dado nem qualidade

Plano de desacoplamento para passar a gerir o Ink Creators entre Claude e GitHub, com hospedagem e provedores próprios.

## Veredito

**Seus dados não estão presos.** O banco é um projeto Supabase padrão (`*.supabase.co`), não infraestrutura proprietária do Lovable. Schema, dados, políticas de RLS, storage e as 16 migrações são todos portáveis por meios normais do Postgres. O código também já está na sua mão.

**O que está preso é a camada de execução**: build, login com Google, chamadas de IA, geocodificação e hospedagem passam por serviços do Lovable. Nada disso é insubstituível, mas exige trabalho e contas próprias nos provedores.

**O risco real não é perder dado — é quebrar sutilmente na migração do build.** A configuração do Vite está escondida dentro de um pacote do Lovable. Reconstruí-la errado produz falhas difíceis de diagnosticar (SSR, duplicação de React, injeção de variáveis), e não erros óbvios.

---

## A pergunta que precisa ser respondida antes de tudo

**O projeto Supabase está na sua organização ou na do Lovable?**

O Lovable Cloud provisiona projetos Supabase, e dependendo de como foi criado, o dono da organização pode ser o Lovable, não você. Isso muda completamente o esforço:

- **Se for sua**: nada a fazer, o banco já é seu. Você troca as chaves e segue.
- **Se for do Lovable**: é preciso transferir a organização ou migrar para um projeto novo com `pg_dump` e recriação de storage. Factível, mas é o item mais delicado do plano e precisa ser resolvido primeiro.

Como verificar: entre em `supabase.com/dashboard`, veja se o projeto `xfiilq…` aparece na sua conta e em qual organização. Se não aparecer, ele não é seu ainda.

Este é o único ponto do plano onde existe risco real de perda. Todo o resto é trabalho.

---

## Inventário de acoplamento

| Acoplamento | Onde vive | Esforço | Substituto |
|---|---|---|---|
| Login com Google | `integrations/lovable/index.ts`, `routes/auth.tsx` | Baixo | `supabase.auth.signInWithOAuth` nativo + credenciais Google próprias |
| Análise de orçamento por IA | `lib/quote.functions.ts` | Baixo | Chave direta do Google AI Studio — mesmo modelo Gemini |
| Análise de portfólio por IA | `lib/portfolio.functions.ts` | Baixo | Idem |
| Geocodificação | `lib/geocode.functions.ts` | Baixo | API do Google Maps direto, com chave própria |
| Mapa no navegador | `.env`, `EventsSection.tsx` | Baixo | Chave própria, restrita por domínio |
| Relatório de erros | `lib/lovable-error-reporting.ts`, `__root.tsx` | Baixo | Remover, ou trocar por Sentry |
| **Configuração de build** | `vite.config.ts` | **Alto** | Reescrever com os plugins explícitos |
| Hospedagem | `*.lovable.app` | Médio | Cloudflare Workers — já é o alvo do nitro |
| Metadados | `.lovable/` | Nenhum | Descartar |
| Banco de dados | Supabase | **Depende da resposta acima** | Já é padrão |

---

## Fase 0 — Blindagem (fazer imediatamente)

Barata, reversível, e elimina o risco de perda. Faça isso antes de decidir qualquer outra coisa, mesmo que resolva ficar no Lovable.

1. **Confirmar a titularidade do projeto Supabase** (ver acima). Se não for sua, resolver isso é a prioridade zero.
2. **Backup completo e datado**:
   - `pg_dump` do banco inteiro (schema + dados)
   - Download dos buckets de storage (avatares, portfólio, uploads de orçamento)
   - As 16 migrações já estão no código — versionar
3. **Repositório próprio no GitHub**, com `.env` no `.gitignore` desde o primeiro commit.
4. **Chaves próprias criadas** (ainda sem trocar no código): Google Cloud para Maps, Google AI Studio para Gemini. Ter as chaves na mão antes de precisar delas.

Ao fim da Fase 0 você pode sair do Lovable a qualquer momento sem perder nada — mesmo que o desacoplamento leve meses.

---

## Fase 1 — Trocar os serviços (gradual, reversível)

Cada item é independente e pode ser feito e testado isoladamente. Se algo der errado, reverte só aquele.

### Login com Google

O Supabase já faz OAuth nativo. O arquivo do Lovable existe só para intermediar.

```ts
// substitui lovable.auth.signInWithOAuth em routes/auth.tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: window.location.origin + "/auth" },
});
```

Depois: configurar o provedor Google no painel do Supabase (Authentication → Providers) com client ID e secret próprios, e apagar `src/integrations/lovable/`.

### Chamadas de IA

O código usa `createOpenAICompatible`, que já abstrai o provedor. Só muda a URL base e o cabeçalho:

```ts
// lib/ai-gateway.server.ts — trocar o corpo da função
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createAiProvider() {
  return createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
}
```

Os modelos em uso são `gemini-3.6-flash` e `gemini-3-flash-preview` — ambos disponíveis direto no Google AI Studio. Trocar `LOVABLE_API_KEY` por `GOOGLE_AI_API_KEY` nos três arquivos que a usam.

**Ganho colateral relevante**: hoje o custo por orçamento passa por um intermediário cujo preço você não controla. Com chave própria, o custo fica visível e negociável — o que era justamente uma pergunta em aberto do modelo de negócio.

### Geocodificação e mapa

`geocode.functions.ts` chama `connector-gateway.lovable.dev/google_maps`. Trocar pela API do Google direto (`maps.googleapis.com/maps/api/geocode/json`) com a chave própria. E no navegador, substituir `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` por chave sua **com restrição de referenciador HTTP** — o que também resolve o achado de segurança anterior.

### Relatório de erros

`window.__lovableEvents` é opcional e degrada sozinho. Remover é seguro. Se quiser observabilidade, Sentry cobre o mesmo com um pacote.

---

## Fase 2 — Reconstruir o build (o ponto delicado)

`@lovable.dev/vite-tanstack-config` empacota, segundo o próprio comentário no arquivo: `tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`, `nitro` (alvo Cloudflare), `componentTagger` (só dev), injeção de variáveis `VITE_*`, alias `@`, deduplicação de React e TanStack, plugins de log de erro e detecção de sandbox.

A boa notícia: **todos esses plugins são públicos e já estão no `package.json`**. Reconstruir é escrever explicitamente o que hoje está implícito:

```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    react(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
});
```

O que perde: `componentTagger` (ferramenta de desenvolvimento do Lovable, irrelevante fora dele) e a detecção de sandbox.

**Como validar que não quebrou** — esta é a parte que não pode ser pulada:

- `npm run dev` sobe e navega sem erro de hidratação
- `npm run build` completa
- SSR funciona: desabilite o JavaScript no navegador e confira se o HTML chega renderizado
- Variáveis `VITE_*` chegam ao cliente
- Não há aviso de múltiplas instâncias de React no console

Faça esta fase em um branch separado, com o Lovable ainda funcionando como rede de segurança.

---

## Fase 3 — Hospedagem própria

O nitro já compila para Cloudflare Workers por padrão, então esse é o caminho de menor atrito. Vercel e Netlify também funcionam, mas exigem trocar o preset.

O que precisa existir no destino:
- Variáveis de ambiente do servidor: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `GOOGLE_AI_API_KEY`, `GOOGLE_MAPS_API_KEY`
- Variáveis públicas `VITE_*` no build
- Domínio próprio e certificado

Recomendo publicar em domínio de teste primeiro, rodar os dois em paralelo por alguns dias, e só então apontar o domínio definitivo.

---

## O que você ganha e o que você perde

**Perde:**
- Preview e deploy de um clique
- O ambiente sandbox do Lovable
- A rede de segurança de "o Lovable conserta"
- Ferramentas de desenvolvimento próprias deles

**Ganha:**
- Controle das chaves e visibilidade real do custo de IA — hoje o núcleo do seu produto roda por infraestrutura de terceiro cujo preço você não define
- Ambientes de verdade, separando desenvolvimento de produção
- Histórico, revisão e reversão via GitHub
- Eu passo a trabalhar direto no código versionado, com testes, em vez de receber zip

**Não perde**: código, dados, migrações, RLS, storage, nem o desenho do produto.

---

## Recomendação de sequência

Não faça isso de uma vez. E, com honestidade: desacoplar é trabalho de infraestrutura que não avança nem o produto nem o modelo de negócio. Vale porque o custo de sair cresce com o tempo — e porque hoje o pedaço mais defensável do seu produto depende de um gateway que não é seu.

O que eu faria:

1. **Fase 0 agora**, sem discussão — é barata e elimina o risco de perda.
2. **Fase 1 em seguida**, item por item, com o Lovable ainda no ar. Cada troca é isolada e testável.
3. **Fase 2 em branch**, sem pressa, validando a lista acima.
4. **Fase 3 por último**, com período de operação em paralelo.

Enquanto isso, as ondas do plano de maturidade seguem: os dois achados de segurança e o modelo de papéis não dependem de sair do Lovable e valem mais para o produto.
