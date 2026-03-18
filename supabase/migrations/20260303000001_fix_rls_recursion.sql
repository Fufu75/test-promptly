-- ============================================================================
-- MIGRATION : Fix récursion RLS sur profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Admins can view profiles of their site" ON public.profiles;

CREATE POLICY "Admins can view profiles of their site"
  ON public.profiles FOR SELECT
  USING (
    public.is_admin()
    AND (
      client_id IS NULL
      OR client_id = public.get_my_client_id()
    )
  );
