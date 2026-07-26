REVOKE ALL ON FUNCTION public.refresh_artist_derived(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_portfolio_refresh_derived() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Portfolio public read" ON storage.objects;