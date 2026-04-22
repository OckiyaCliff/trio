-- Allow anonymous users to look up schools by their code
-- This is necessary for verifying school codes during sign-up
DROP POLICY IF EXISTS "Allow anonymous school lookup" ON public.schools;
CREATE POLICY "Allow anonymous school lookup"
  ON public.schools FOR SELECT
  TO anon
  USING (is_active = true);

-- Alternatively, more restrictive if you only want to allow code lookup:
-- USING (is_active = true AND (code IS NOT NULL));
