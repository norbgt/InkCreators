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
