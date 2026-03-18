-- Allow authenticated users (clients) to update is_available field on slots
-- This is needed when a client books a slot, the slot should be marked as unavailable

CREATE POLICY "Authenticated users can update slot availability"
  ON public.slots FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
