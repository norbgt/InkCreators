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