
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
