-- Restrict SECURITY DEFINER functions from being callable via the Data API
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Remove broad public SELECT on avatars/portfolio buckets (public CDN URLs still work
-- because the buckets are marked public; this only prevents listing via the API).
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;
