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