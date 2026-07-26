# Proposta: modelo de papéis cliente / tatuador

Traduz as decisões já validadas no protótipo interativo em uma mudança concreta de schema, autorização e telas. Escopo pensado para ser pequeno e reversível — não mexe em nada além do necessário para resolver a inconsistência identificada no diagnóstico inicial.

Decisões que este documento assume como fechadas:

- Pergunta "você também é tatuador(a)?" é obrigatória no primeiro momento da conta.
- Papéis não são excludentes: todo mundo é cliente; tatuador é uma capacidade adicional.
- Contas já existentes sem papel definido ficam de fora — nenhuma migração retroativa.
- Quem respondeu "não" pode virar tatuador depois, por um caminho de upgrade dentro da área de cliente.

## 1. O que já existe e pode ser reaproveitado

- `user_roles` (user_id, role, UNIQUE(user_id, role)) já é multi-valorado por natureza — comporta um usuário com `client` e `artist` ao mesmo tempo sem nenhuma alteração estrutural.
- `has_role(user_id, role)` já existe como função `SECURITY DEFINER` e pode ser reusada nas novas policies e nos guards de servidor.
- `handle_new_user()` (trigger em `auth.users`) já roda no signup e cria a linha em `profiles` — é o ponto natural para também semear `user_roles`.

## 2. Gaps que este documento resolve

1. **RLS de `user_roles` não permite o próprio usuário se atribuir um papel.** Hoje só existem policies de leitura do próprio papel e de gestão por admin (`FOR ALL USING has_role(admin)`). Não há `INSERT` para o dono. Sem isso, qualquer tentativa de gravar o papel escolhido no cadastro cai em RLS.
2. **`profiles.role` é uma coluna única (`app_role` com default `'client'`)** — modela papel como exclusivo, o que contradiz a decisão de papéis aditivos. Ela não pode continuar sendo a fonte de verdade para autorização.
3. **O guard de `/studio` hoje decide "é tatuador?" pela existência de uma linha em `artists`**, não por um papel explícito — é exatamente a inferência por convenção que motivou esta mudança.
4. **Cadastro por Google OAuth não tem como coletar a resposta obrigatória antes do redirect** — precisa de um passo pós-login separado do formulário de email/senha.

## 3. Migração de schema

Novo arquivo `supabase/migrations/<timestamp>_role_selection.sql`:

```sql
-- Registra de onde veio cada papel (cadastro por email, gate pós-OAuth,
-- upgrade posterior). Não bloqueia nada, é só rastro para produto/suporte.
ALTER TABLE public.user_roles ADD COLUMN source text;
COMMENT ON COLUMN public.user_roles.source IS
  'Origem da atribuição: signup_trigger | role_select_gate | upgrade';

-- Permite que o próprio usuário se atribua os papéis não-privilegiados
-- (client, artist). Papel 'admin' continua fora do alcance desta policy —
-- só é gerenciável pela policy "Admins manage roles" já existente.
CREATE POLICY "Users can self-assign client or artist role"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role IN ('client', 'artist')
  );

-- Semeia o papel de cliente (sempre) e o de tatuador (se indicado no
-- cadastro via user_metadata) no mesmo instante em que o profile é criado.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role, source)
  VALUES (NEW.id, 'client', 'signup_trigger')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF (NEW.raw_user_meta_data->>'wants_artist')::boolean IS TRUE THEN
    INSERT INTO public.user_roles (user_id, role, source)
    VALUES (NEW.id, 'artist', 'signup_trigger')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
```

`profiles.role` não é removida nesta etapa — fica como campo informativo ("como a pessoa se descreve"), mas deixa de ser consultada por qualquer guard ou policy nova. Uma limpeza futura (deprecar/derivar a coluna a partir de `user_roles`) fica fora de escopo aqui para manter o raio de mudança pequeno.

## 4. Por que um guard além do trigger

O trigger cobre o cadastro por email/senha, onde dá para anexar `wants_artist` em `user_metadata` antes de chamar `signUp()`. Ele não cobre:

- Login via Google OAuth, que não passa pelo formulário de cadastro.
- Qualquer falha silenciosa do trigger.

Por isso a regra real de obrigatoriedade não é o trigger — é um **guard global**: sempre que houver sessão autenticada e a pessoa não tiver nenhuma linha em `user_roles`, ela é redirecionada para uma tela de escolha obrigatória antes de acessar qualquer outra rota, incluindo `/`. O trigger é só uma otimização que evita esse redirect no caso comum (email/senha).

## 5. Server functions (novo arquivo `src/lib/roles.functions.ts`)

```ts
// getMyRoles — usado pelo guard global e pelo TopBar/studio para decidir
// o que mostrar, sem depender de profiles.role ou da existência de artists.
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return (data ?? []).map((r) => r.role);
  });

// completeRoleSelection — chamada pela tela obrigatória de escolha de papel
// (cobre o caminho OAuth e qualquer fallback do trigger). source fixo:
// esta função só existe nesse gate, então a origem já é conhecida.
export const completeRoleSelection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ wantsArtist: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: "client", source: "role_select_gate" },
      { onConflict: "user_id,role" },
    );
    if (data.wantsArtist) {
      await supabase.from("user_roles").upsert(
        { user_id: userId, role: "artist", source: "role_select_gate" },
        { onConflict: "user_id,role" },
      );
    }
    return { ok: true };
  });

// becomeArtist — usada pelo banner "Tornar-se tatuador" dentro de /me.
// Não precisa reconfirmar 'client': se a pessoa já está logada e passou
// pelo guard global, ela já tem esse papel. source='upgrade' é o que
// diferencia esse caminho do artist concedido no cadastro.
export const becomeArtist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("user_roles").upsert(
      { user_id: context.userId, role: "artist", source: "upgrade" },
      { onConflict: "user_id,role" },
    );
    return { ok: true };
  });
```

## 6. Mudanças de tela, arquivo por arquivo

| Arquivo | Mudança |
|---|---|
| `src/routes/auth.tsx` | No modo `signup`, adicionar o toggle obrigatório "Você também é tatuador(a)?", **sem opção pré-marcada** — nenhuma das duas fica selecionada por padrão. Submit desabilitado até um clique explícito em "Sim" ou "Não". Passar `wants_artist` em `options.data` do `supabase.auth.signUp`. |
| `src/routes/role-select.tsx` *(novo)* | Tela mínima, sem navegação de saída, mesmo toggle sem opção pré-marcada. Uma linha de texto acima das opções, sucinta: "Isso define se, além de cliente, você também terá um espaço de trabalho para tatuadores." Chama `completeRoleSelection` e só então libera o redirect para o destino original. É o destino do guard global e também o passo pós-login do fluxo Google. |
| `src/routes/__root.tsx` | Guard: se `user` autenticado e `getMyRoles()` retorna lista vazia, `redirect` para `/role-select` antes de renderizar qualquer outra rota. |
| `src/components/TopBar.tsx` | O ícone/pill de "Estúdio" só aparece se `'artist'` estiver entre os papéis (via `getMyRoles`), não mais pela existência de `artists`. |
| `src/routes/me.index.tsx` | Banner "Tornar-se tatuador" quando os papéis não incluem `artist`. Chama `becomeArtist`, depois navega para `/studio/onboarding`. |
| `src/routes/studio.tsx` | Guard atualizado: sem papel `artist` → redireciona para `/me` (não mais para onboarding, já que sem o papel a pessoa não deveria nem chegar perto do onboarding). Com papel `artist` mas sem linha em `artists` → mantém o redirect atual para `/studio/onboarding`. |
| `src/lib/studio.functions.ts` (`performSaveArtist`) | Reforço de defesa: antes de criar/atualizar a linha em `artists`, verificar `has_role(userId, 'artist')`; sem o papel, recusar. Fecha a brecha atual em que qualquer autenticado consegue publicar um perfil de tatuador só por acessar a URL certa. |

## 7. Fora de escopo nesta rodada

- Migrar ou apagar a coluna `profiles.role`.
- Qualquer tratamento para contas criadas antes desta mudança.
- Caminho de downgrade (remover o papel de tatuador de uma conta).
- Mudanças em `quote_matches`/`quote_requests` — o fluxo de orçamentos já funciona independente deste ajuste.

## 8. Decisões fechadas nesta rodada

- **Nenhuma opção pré-selecionada no toggle.** Tanto em `auth.tsx` quanto em `role-select.tsx`, "Sim" e "Não" começam neutros e o botão de continuar fica desabilitado até um clique explícito — igual ao comportamento já validado no protótipo.
- **`/role-select` explica o porquê em uma frase**, sem parágrafo longo: algo como "Isso define se, além de cliente, você também terá um espaço de trabalho para tatuadores." Só essa linha acima do toggle.
- **Origem do papel é registrada**, não descartada: coluna `source` em `user_roles` (`signup_trigger` | `role_select_gate` | `upgrade`), preenchida por todos os três caminhos de escrita (trigger, `completeRoleSelection`, `becomeArtist`). Sem CHECK constraint por enquanto — texto livre para não travar a migração caso surja uma quarta origem mais adiante.
