-- ═══════════════════════════════════════════════════════════════════
-- CORREÇÃO DE SEGURANÇA — leitura irrestrita da tabela profiles
--
-- PROBLEMA
-- A política criada na migração 01 é `FOR SELECT USING (true)`: leitura
-- aberta para qualquer portador da chave pública, incluindo anônimos.
-- Ela nunca foi revogada nas 16 migrações seguintes.
--
-- Consequência: nome, cidade, estado, bio e foto de QUALQUER usuário
-- ficam legíveis publicamente — inclusive de clientes que só pediram um
-- orçamento e nunca quiseram aparecer em lugar nenhum.
--
-- Sinal de que passou despercebido: a migração 14 criou a política
-- "Matched artists view requester profile" justamente para dar ao
-- tatuador acesso ao perfil de quem o acionou. Ela é redundante enquanto
-- a política aberta existir — ninguém precisa de permissão especial para
-- ler o que já é público.
--
-- CORREÇÃO
-- Substituir a leitura irrestrita por leitura do que é de fato público:
-- o perfil de quem tem artista publicado. Os demais caminhos de acesso
-- legítimo já existem e continuam valendo.
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 1) Perfil de tatuador publicado é público — é o que sustenta o
--    catálogo de descoberta e as páginas de perfil.
CREATE POLICY "Perfil de tatuador publicado e publico"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artists a
      WHERE a.profile_id = profiles.id
        AND a.is_published = true
    )
  );

-- 2) Cada usuário lê o próprio perfil.
CREATE POLICY "Usuario le o proprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 3) Administradores leem tudo.
CREATE POLICY "Admin le todos os perfis"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- A política "Matched artists view requester profile" (migração 14)
-- permanece: é ela que dá ao tatuador acesso ao perfil do cliente que
-- pediu orçamento a ele. Agora ela tem propósito real.

COMMIT;

-- ── VALIDAÇÃO ──────────────────────────────────────────────────────
-- Rodar com a chave anônima, autenticado como ninguém:
--
--   select id, display_name from profiles;
--
-- Esperado: retorna apenas perfis com artista publicado. Antes desta
-- correção retornava todos, inclusive de clientes.
--
-- Este é exatamente o tipo de verificação que deveria virar teste
-- automatizado — ver decisoes/pendencias.md.
