DROP POLICY IF EXISTS "Published artists viewable by everyone" ON public.artists;

CREATE POLICY "Anon views published artists"
ON public.artists FOR SELECT TO anon
USING (is_published = true);

CREATE POLICY "Authenticated views published or own artists"
ON public.artists FOR SELECT TO authenticated
USING (is_published = true OR auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'::app_role));