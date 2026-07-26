
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
