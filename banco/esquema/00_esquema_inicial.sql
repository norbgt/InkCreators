-- ═══════════════════════════════════════════════════════════════════
-- INK CREATORS — ESQUEMA INICIAL
--
-- Arquivo único para aplicar em um projeto Supabase novo e vazio.
--
-- COMO FOI GERADO
-- Concatenação, na ordem, das 16 migrações originais (banco/migracoes/)
-- seguidas das 2 correções (banco/correcoes/). Nada foi reescrito à mão:
-- a concatenação evita risco de erro de transcrição, e o estado final é
-- idêntico ao de aplicar cada arquivo em sequência.
--
-- POR QUE UM ARQUIVO SÓ
-- O projeto Supabase de destino é novo. Não há histórico a preservar
-- nele, e um arquivo único é mais simples de aplicar e de auditar.
-- As migrações individuais seguem versionadas como registro histórico.
--
-- O QUE JÁ VEM CORRIGIDO
-- A correção 17 remove a leitura irrestrita da tabela profiles, que no
-- projeto original expunha nome, cidade e foto de todos os clientes a
-- qualquer portador da chave pública. Aqui essa política é criada e
-- removida dentro do mesmo arquivo — ou seja, o furo nunca existe de
-- fato neste banco. É a vantagem de começar limpo.
--
-- A correção 18 implementa o modelo de papéis cliente/tatuador aditivos
-- decidido em decisoes/001-papeis-cliente-tatuador.md.
--
-- COMO APLICAR
-- Painel do Supabase → SQL Editor → colar este arquivo → Run.
-- Ou via MCP do Supabase, uma vez conectado.
--
-- DEPOIS DE APLICAR, VALIDAR
--   select tablename from pg_tables where schemaname='public';
--     → esperado: 10 tabelas
--   select count(*) from pg_policies where schemaname='public';
--     → esperado: 60+ políticas
--   set role anon; select id, display_name from profiles;
--     → esperado: só perfis de tatuadores publicados (vazio em banco novo)
-- ═══════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/01_20260531205851.sql
-- ─────────────────────────────────────────────────────────────
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'artist', 'client');
CREATE TYPE public.quote_status AS ENUM ('open', 'matched', 'closed');

-- =========================
-- UTILITY: updated_at trigger
-- =========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  handle TEXT UNIQUE,
  avatar_url TEXT,
  city TEXT,
  state TEXT,
  bio TEXT,
  role public.app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- USER_ROLES + has_role
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- TATTOO_STYLES
-- =========================
CREATE TABLE public.tattoo_styles (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  complexity SMALLINT NOT NULL CHECK (complexity BETWEEN 1 AND 4),
  min_hourly_cents INT NOT NULL,
  max_hourly_cents INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tattoo_styles TO anon, authenticated;
GRANT ALL ON public.tattoo_styles TO service_role;

ALTER TABLE public.tattoo_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Styles are viewable by everyone"
  ON public.tattoo_styles FOR SELECT USING (true);
CREATE POLICY "Admins manage styles"
  ON public.tattoo_styles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- ARTISTS
-- =========================
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_name TEXT,
  years_experience INT,
  min_hourly_cents INT,
  max_hourly_cents INT,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  portfolio_cover_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.artists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artists TO authenticated;
GRANT ALL ON public.artists TO service_role;

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published artists viewable by everyone"
  ON public.artists FOR SELECT
  USING (is_published = true OR auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can insert own artist"
  ON public.artists FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Owners can update own artist"
  ON public.artists FOR UPDATE USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can delete own artist"
  ON public.artists FOR DELETE USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER artists_set_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_artists_published ON public.artists(is_published) WHERE is_published = true;

-- =========================
-- ARTIST_STYLES
-- =========================
CREATE TABLE public.artist_styles (
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  style_slug TEXT NOT NULL REFERENCES public.tattoo_styles(slug) ON DELETE CASCADE,
  PRIMARY KEY (artist_id, style_slug)
);

GRANT SELECT ON public.artist_styles TO anon, authenticated;
GRANT INSERT, DELETE ON public.artist_styles TO authenticated;
GRANT ALL ON public.artist_styles TO service_role;

ALTER TABLE public.artist_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artist styles viewable by everyone"
  ON public.artist_styles FOR SELECT USING (true);
CREATE POLICY "Artist owner manages styles"
  ON public.artist_styles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.artists a WHERE a.id = artist_id AND (a.profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.artists a WHERE a.id = artist_id AND (a.profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- =========================
-- PORTFOLIO_ITEMS
-- =========================
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  style_slug TEXT REFERENCES public.tattoo_styles(slug) ON DELETE SET NULL,
  caption TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portfolio_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT ALL ON public.portfolio_items TO service_role;

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio items viewable by everyone"
  ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Artist owner manages portfolio"
  ON public.portfolio_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.artists a WHERE a.id = artist_id AND (a.profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.artists a WHERE a.id = artist_id AND (a.profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE INDEX idx_portfolio_artist ON public.portfolio_items(artist_id);

-- =========================
-- QUOTE_REQUESTS (table first, policies after quote_matches exists)
-- =========================
CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reference_image_urls TEXT[] NOT NULL DEFAULT '{}',
  body_area_image_url TEXT,
  body_area_label TEXT,
  city TEXT,
  state TEXT,
  budget_max_hourly_cents INT,
  ai_suggested_styles TEXT[] NOT NULL DEFAULT '{}',
  ai_complexity SMALLINT CHECK (ai_complexity BETWEEN 1 AND 4),
  ai_min_cents INT,
  ai_max_cents INT,
  ai_rationale TEXT,
  status public.quote_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT INSERT ON public.quote_requests TO anon;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER quotes_set_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_quotes_requester ON public.quote_requests(requester_id);

-- =========================
-- QUOTE_MATCHES
-- =========================
CREATE TABLE public.quote_matches (
  quote_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  score NUMERIC(4,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (quote_id, artist_id)
);

GRANT SELECT ON public.quote_matches TO authenticated;
GRANT ALL ON public.quote_matches TO service_role;

ALTER TABLE public.quote_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requester or artist views matches"
  ON public.quote_matches FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.quote_requests q WHERE q.id = quote_id AND q.requester_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.artists a WHERE a.id = artist_id AND a.profile_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Now policies on quote_requests that reference quote_matches
CREATE POLICY "Anyone can create a quote request"
  ON public.quote_requests FOR INSERT
  WITH CHECK (requester_id IS NULL OR auth.uid() = requester_id);

CREATE POLICY "Requester views own quotes"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() = requester_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Matched artists view related quotes"
  ON public.quote_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quote_matches m
      JOIN public.artists a ON a.id = m.artist_id
      WHERE m.quote_id = quote_requests.id AND a.profile_id = auth.uid()
    )
  );

CREATE POLICY "Requester updates own quotes"
  ON public.quote_requests FOR UPDATE
  USING (auth.uid() = requester_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Requester deletes own quotes"
  ON public.quote_requests FOR DELETE
  USING (auth.uid() = requester_id OR public.has_role(auth.uid(), 'admin'));

-- =========================
-- STORAGE BUCKETS + POLICIES
-- =========================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png','image/jpeg','image/webp']),
  ('portfolio', 'portfolio', true, 5242880, ARRAY['image/png','image/jpeg','image/webp']),
  ('quote-uploads', 'quote-uploads', false, 5242880, ARRAY['image/png','image/jpeg','image/webp']);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Portfolio images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Users upload own portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own portfolio"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own portfolio"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own quote uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quote-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own quote uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'quote-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own quote uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'quote-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/02_20260531205922.sql
-- ─────────────────────────────────────────────────────────────
-- Restrict SECURITY DEFINER functions from being callable via the Data API
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Remove broad public SELECT on avatars/portfolio buckets (public CDN URLs still work
-- because the buckets are marked public; this only prevents listing via the API).
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/03_20260531224522.sql
-- ─────────────────────────────────────────────────────────────

-- 1) Profiles: hide sensitive `role` column from public/anon and authenticated direct reads.
-- has_role() uses public.user_roles, not profiles.role, so revoking is safe.
REVOKE SELECT (role) ON public.profiles FROM anon, authenticated;

-- 2) Quote requests: require authenticated requester (no anonymous submissions)
DROP POLICY IF EXISTS "Anyone can create a quote request" ON public.quote_requests;
CREATE POLICY "Authenticated users create own quote requests"
ON public.quote_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

-- 3) Lock down SECURITY DEFINER helper: not executable by anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/04_20260601002455.sql
-- ─────────────────────────────────────────────────────────────
-- Fase 1: campos visíveis no perfil público do tatuador
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS use_instagram_for_feed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_selected_media JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Validação leve: handle só com caracteres válidos do Instagram, sem @
ALTER TABLE public.artists
  ADD CONSTRAINT artists_instagram_handle_format
  CHECK (
    instagram_handle IS NULL
    OR instagram_handle ~ '^[A-Za-z0-9_.]{1,30}$'
  );

-- Validação: instagram_selected_media é array de no máximo 6 items
CREATE OR REPLACE FUNCTION public.validate_instagram_selected_media()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.instagram_selected_media IS NULL THEN
    NEW.instagram_selected_media := '[]'::jsonb;
  END IF;

  IF jsonb_typeof(NEW.instagram_selected_media) <> 'array' THEN
    RAISE EXCEPTION 'instagram_selected_media deve ser um array JSON';
  END IF;

  IF jsonb_array_length(NEW.instagram_selected_media) > 6 THEN
    RAISE EXCEPTION 'instagram_selected_media não pode ter mais de 6 itens';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_instagram_selected_media_trg ON public.artists;
CREATE TRIGGER validate_instagram_selected_media_trg
BEFORE INSERT OR UPDATE OF instagram_selected_media ON public.artists
FOR EACH ROW
EXECUTE FUNCTION public.validate_instagram_selected_media();

-- Fase 2: tabela isolada para credenciais OAuth do Instagram (Graph API)
-- Mantida separada de artists para que tokens nunca sejam expostos via Data API pública.
CREATE TABLE IF NOT EXISTS public.artist_instagram_oauth (
  artist_id UUID NOT NULL PRIMARY KEY REFERENCES public.artists(id) ON DELETE CASCADE,
  instagram_user_id TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  sync_enabled BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GRANTs: nenhum acesso para anon; authenticated pode ler/escrever apenas a própria linha (via RLS).
-- service_role tem acesso total (usado por server functions na Fase 2).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artist_instagram_oauth TO authenticated;
GRANT ALL ON public.artist_instagram_oauth TO service_role;

ALTER TABLE public.artist_instagram_oauth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artist owner reads own instagram oauth"
ON public.artist_instagram_oauth
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = artist_instagram_oauth.artist_id
      AND (a.profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Artist owner inserts own instagram oauth"
ON public.artist_instagram_oauth
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = artist_instagram_oauth.artist_id
      AND a.profile_id = auth.uid()
  )
);

CREATE POLICY "Artist owner updates own instagram oauth"
ON public.artist_instagram_oauth
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = artist_instagram_oauth.artist_id
      AND (a.profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Artist owner deletes own instagram oauth"
ON public.artist_instagram_oauth
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = artist_instagram_oauth.artist_id
      AND (a.profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Trigger de updated_at (reusa a função set_updated_at existente)
DROP TRIGGER IF EXISTS artist_instagram_oauth_updated_at ON public.artist_instagram_oauth;
CREATE TRIGGER artist_instagram_oauth_updated_at
BEFORE UPDATE ON public.artist_instagram_oauth
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/05_20260712214935.sql
-- ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.pricing_size AS ENUM ('pequeno','medio','grande','sessao_dia');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.artist_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  style_slug text NOT NULL REFERENCES public.tattoo_styles(slug) ON DELETE CASCADE,
  size_bucket public.pricing_size NOT NULL,
  min_cents integer NOT NULL CHECK (min_cents >= 0),
  max_cents integer NOT NULL CHECK (max_cents >= min_cents),
  hours_estimate numeric(4,1),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artist_id, style_slug, size_bucket)
);

GRANT SELECT ON public.artist_pricing TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artist_pricing TO authenticated;
GRANT ALL ON public.artist_pricing TO service_role;

ALTER TABLE public.artist_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view pricing of published artists"
  ON public.artist_pricing FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = artist_pricing.artist_id AND a.is_published = true
  ));

CREATE POLICY "Artists manage own pricing"
  ON public.artist_pricing FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = artist_pricing.artist_id AND a.profile_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.artists a
    WHERE a.id = artist_pricing.artist_id AND a.profile_id = auth.uid()
  ));

CREATE POLICY "Admins manage all pricing"
  ON public.artist_pricing FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER artist_pricing_set_updated_at
  BEFORE UPDATE ON public.artist_pricing
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX artist_pricing_artist_idx ON public.artist_pricing(artist_id);


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/06_20260725223801.sql
-- ─────────────────────────────────────────────────────────────
-- 1) Extend portfolio_items
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS styles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS body_parts text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS technique text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS size_bucket text,
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb,
  ADD COLUMN IF NOT EXISTS ai_confidence numeric(3,2),
  ADD COLUMN IF NOT EXISTS dominant_color text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS analyzed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_portfolio_styles ON public.portfolio_items USING GIN (styles);
CREATE INDEX IF NOT EXISTS idx_portfolio_body_parts ON public.portfolio_items USING GIN (body_parts);
CREATE INDEX IF NOT EXISTS idx_portfolio_tags ON public.portfolio_items USING GIN (tags);

DROP TRIGGER IF EXISTS trg_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER trg_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Extend artists with derived attributes
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS derived_styles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS derived_body_parts text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS derived_color_profile text,
  ADD COLUMN IF NOT EXISTS signature_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS styles_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS derived_updated_at timestamptz;

-- 3) refresh_artist_derived function
CREATE OR REPLACE FUNCTION public.refresh_artist_derived(_artist_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_styles text[];
  v_parts text[];
  v_tags text[];
  v_color_profile text;
  v_black_count int;
  v_color_count int;
  v_total int;
BEGIN
  -- recent items window
  WITH recent AS (
    SELECT styles, body_parts, tags, colors
    FROM public.portfolio_items
    WHERE artist_id = _artist_id
    ORDER BY created_at DESC
    LIMIT 30
  ),
  styles_agg AS (
    SELECT unnest(styles) AS v FROM recent
  ),
  parts_agg AS (
    SELECT unnest(body_parts) AS v FROM recent
  ),
  tags_agg AS (
    SELECT unnest(tags) AS v FROM recent
  ),
  colors_agg AS (
    SELECT unnest(colors) AS v FROM recent
  )
  SELECT
    (SELECT array_agg(v ORDER BY cnt DESC) FROM (
      SELECT v, count(*) cnt FROM styles_agg GROUP BY v ORDER BY cnt DESC LIMIT 6
    ) s),
    (SELECT array_agg(v ORDER BY cnt DESC) FROM (
      SELECT v, count(*) cnt FROM parts_agg GROUP BY v ORDER BY cnt DESC LIMIT 8
    ) p),
    (SELECT array_agg(v ORDER BY cnt DESC) FROM (
      SELECT v, count(*) cnt FROM tags_agg GROUP BY v ORDER BY cnt DESC LIMIT 10
    ) t)
  INTO v_styles, v_parts, v_tags;

  SELECT count(*) FILTER (WHERE v IN ('preto', 'preto e cinza', 'blackwork', 'black')),
         count(*) FILTER (WHERE v NOT IN ('preto', 'preto e cinza', 'blackwork', 'black')),
         count(*)
  INTO v_black_count, v_color_count, v_total
  FROM (SELECT unnest(colors) AS v FROM public.portfolio_items WHERE artist_id = _artist_id ORDER BY created_at DESC LIMIT 30) c;

  v_color_profile := CASE
    WHEN v_total = 0 THEN NULL
    WHEN v_color_count = 0 THEN 'preto e cinza'
    WHEN v_black_count = 0 THEN 'colorido'
    ELSE 'misto'
  END;

  UPDATE public.artists
  SET derived_styles = COALESCE(v_styles, '{}'),
      derived_body_parts = COALESCE(v_parts, '{}'),
      signature_tags = COALESCE(v_tags, '{}'),
      derived_color_profile = v_color_profile,
      derived_updated_at = now()
  WHERE id = _artist_id;
END;
$$;

-- 4) Trigger to refresh on portfolio changes
CREATE OR REPLACE FUNCTION public.trg_portfolio_refresh_derived()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_artist_derived(OLD.artist_id);
    RETURN OLD;
  ELSE
    PERFORM public.refresh_artist_derived(NEW.artist_id);
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_portfolio_refresh_derived ON public.portfolio_items;
CREATE TRIGGER trg_portfolio_refresh_derived
AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_items
FOR EACH ROW EXECUTE FUNCTION public.trg_portfolio_refresh_derived();

-- 5) Storage policies for the 'portfolio' bucket
-- Public read (bucket is public but keep explicit policy)
DROP POLICY IF EXISTS "Portfolio public read" ON storage.objects;
CREATE POLICY "Portfolio public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Portfolio owner insert" ON storage.objects;
CREATE POLICY "Portfolio owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Portfolio owner update" ON storage.objects;
CREATE POLICY "Portfolio owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Portfolio owner delete" ON storage.objects;
CREATE POLICY "Portfolio owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/07_20260725223820.sql
-- ─────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.refresh_artist_derived(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_portfolio_refresh_derived() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Portfolio public read" ON storage.objects;

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/08_20260725225738.sql
-- ─────────────────────────────────────────────────────────────

-- 1. Extend enum
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'declined';
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'expired';

-- 2. quote_requests new cols
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS est_hours_min numeric(5,1),
  ADD COLUMN IF NOT EXISTS est_hours_max numeric(5,1),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 3. quote_matches new cols
ALTER TABLE public.quote_matches
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS offer_cents integer,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

-- 4. Grants for quote_matches
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_matches TO authenticated;
GRANT ALL ON public.quote_matches TO service_role;

-- 5. Policies for quote_matches: artist owns their match rows
DROP POLICY IF EXISTS "Artists insert own matches" ON public.quote_matches;
CREATE POLICY "Artists insert own matches" ON public.quote_matches
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.artists a WHERE a.id = quote_matches.artist_id AND a.profile_id = auth.uid()));

DROP POLICY IF EXISTS "Artists or requester update matches" ON public.quote_matches;
CREATE POLICY "Artists or requester update matches" ON public.quote_matches
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.artists a WHERE a.id = quote_matches.artist_id AND a.profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.quote_requests q WHERE q.id = quote_matches.quote_id AND q.requester_id = auth.uid())
  );

-- 6. Allow the requester (owner) to insert initial matches for their own quote request
DROP POLICY IF EXISTS "Requester creates initial matches" ON public.quote_matches;
CREATE POLICY "Requester creates initial matches" ON public.quote_matches
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.quote_requests q WHERE q.id = quote_matches.quote_id AND q.requester_id = auth.uid()));


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/09_20260725230043.sql
-- ─────────────────────────────────────────────────────────────

-- Artists can view quote_requests where they have a match
CREATE POLICY "Matched artists view quotes"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.quote_matches m
    JOIN public.artists a ON a.id = m.artist_id
    WHERE m.quote_id = quote_requests.id
      AND a.profile_id = auth.uid()
  )
);

-- Artists can view profile (name/avatar) of requesters who matched them
CREATE POLICY "Matched artists view requester profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.quote_requests qr
    JOIN public.quote_matches m ON m.quote_id = qr.id
    JOIN public.artists a ON a.id = m.artist_id
    WHERE qr.requester_id = profiles.id
      AND a.profile_id = auth.uid()
  )
);


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/10_20260726140159.sql
-- ─────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.objects TO service_role;
GRANT SELECT ON storage.buckets TO authenticated, anon;
GRANT ALL ON storage.buckets TO service_role;

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/11_20260726140303.sql
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Avatar owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;

CREATE POLICY "Avatar owner insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Public read portfolio" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'portfolio');

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/12_20260726140345.sql
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/13_20260726141709.sql
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Published artists viewable by everyone" ON public.artists;

CREATE POLICY "Anon views published artists"
ON public.artists FOR SELECT TO anon
USING (is_published = true);

CREATE POLICY "Authenticated views published or own artists"
ON public.artists FOR SELECT TO authenticated
USING (is_published = true OR auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/14_20260726142858.sql
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Avatar owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio owner update" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Users update own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own portfolio" ON storage.objects;

CREATE POLICY "Avatar owner insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar owner update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar owner delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Portfolio owner insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Portfolio owner update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
);

CREATE POLICY "Portfolio owner delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio'
  AND owner_id = (storage.foldername(name))[1]
);

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/15_20260726143938.sql
-- ─────────────────────────────────────────────────────────────
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/migracoes/16_20260726144103.sql
-- ─────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_artist_derived(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_portfolio_refresh_derived() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/correcoes/17_restringe_leitura_de_perfis.sql
-- ─────────────────────────────────────────────────────────────
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


-- ─────────────────────────────────────────────────────────────
-- ORIGEM: banco/correcoes/18_modelo_de_papeis.sql
-- ─────────────────────────────────────────────────────────────
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

