-- ═══════════════════════════════════════════════════════════════════
-- MODELO DE PAPÉIS — cliente e tatuador
--
-- Implementa a decisão registrada em decisoes/001-papeis-cliente-tatuador.md
--
-- Regras acordadas:
--   • A pergunta "você também é tatuador?" é obrigatória no cadastro.
--   • Papéis NÃO são excludentes: todo mundo é cliente; tatuador é uma
--     capacidade adicional. Um tatuador continua podendo se tatuar,
--     comprar na loja e ir a eventos.
--   • Quem respondeu "não" pode virar tatuador depois, sem perder nada.
--   • Contas anteriores a esta mudança ficam fora — sem migração retroativa.
--
-- PROBLEMA QUE RESOLVE
-- Hoje o sistema decide se alguém é tatuador pela existência de uma linha
-- na tabela `artists`. Isso significa que qualquer usuário autenticado
-- vira tatuador só de acessar /studio, sem escolha explícita em lugar
-- nenhum. O enum app_role e a tabela user_roles existem desde a primeira
-- migração, mas são usados apenas nas políticas de admin.
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- Origem da atribuição do papel. Não bloqueia nada — é rastro para
-- produto e suporte entenderem por qual caminho a pessoa virou tatuadora.
-- Texto livre de propósito: uma quarta origem não deve exigir migração.
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS source text;
COMMENT ON COLUMN public.user_roles.source IS
  'Origem da atribuição: signup_trigger | role_select_gate | upgrade';

-- Permite que o próprio usuário se atribua os papéis não-privilegiados.
-- 'admin' continua fora do alcance: só a política "Admins manage roles",
-- criada na migração 01, concede esse papel.
DROP POLICY IF EXISTS "Usuario atribui a si papel de cliente ou tatuador" ON public.user_roles;
CREATE POLICY "Usuario atribui a si papel de cliente ou tatuador"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role IN ('client', 'artist')
  );

GRANT INSERT ON public.user_roles TO authenticated;

-- Semeia os papéis no mesmo instante em que o profile é criado.
-- Cliente sempre; tatuador quando indicado no cadastro via user_metadata.
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
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
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

COMMIT;

-- ── NOTA SOBRE profiles.role ───────────────────────────────────────
-- A coluna profiles.role (enum app_role, default 'client') modela papel
-- como exclusivo, o que contradiz a decisão de papéis aditivos. Ela NÃO
-- é removida aqui, para manter o raio de mudança pequeno — mas deixa de
-- ser consultada por qualquer guard ou política. Fonte de verdade de
-- autorização passa a ser user_roles.

-- ── O QUE O TRIGGER NÃO COBRE ──────────────────────────────────────
-- Login via Google não passa pelo formulário de cadastro, então não tem
-- como carregar wants_artist em user_metadata. A obrigatoriedade real da
-- escolha precisa de um guard na aplicação: sessão autenticada sem
-- nenhuma linha em user_roles é redirecionada para a tela de escolha
-- antes de acessar qualquer rota. O trigger é só a otimização que evita
-- esse desvio no caminho comum.
