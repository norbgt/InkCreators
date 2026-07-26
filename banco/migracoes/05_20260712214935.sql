
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
