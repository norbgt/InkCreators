
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
