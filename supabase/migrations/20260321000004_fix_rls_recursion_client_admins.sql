-- ============================================================================
-- MIGRATION : Fix récursion RLS client_admins + bookings
-- ============================================================================
-- Problème : nos policies bookings queryaient client_admins directement,
-- et client_admins avait déjà une policy auto-référentielle → boucle infinie.
-- Solution : fonctions SECURITY DEFINER qui bypassent le RLS.
-- ============================================================================

-- Fonction pour vérifier si l'utilisateur est admin d'un site donné
-- SECURITY DEFINER = bypass RLS, pas de récursion possible
CREATE OR REPLACE FUNCTION public.is_client_admin_of(p_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_admins
    WHERE client_id = p_client_id
      AND user_id = auth.uid()
  );
$$;

-- Fonction pour vérifier si l'utilisateur est owner d'un site donné
CREATE OR REPLACE FUNCTION public.is_owner_of_client(p_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_admins
    WHERE client_id = p_client_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$;

-- Réécrire les policies bookings sans subquery directe sur client_admins
DROP POLICY IF EXISTS "Site admins can view bookings of their site" ON public.bookings;
DROP POLICY IF EXISTS "Site admins can delete bookings of their site" ON public.bookings;

CREATE POLICY "Site admins can view bookings of their site"
  ON public.bookings FOR SELECT
  USING (
    public.is_client_admin_of(client_id)
    OR public.is_super_admin()
  );

CREATE POLICY "Site admins can delete bookings of their site"
  ON public.bookings FOR DELETE
  USING (
    public.is_client_admin_of(client_id)
    OR public.is_super_admin()
  );

-- Fixer la policy récursive sur client_admins
DROP POLICY IF EXISTS "Owners can manage client admins" ON public.client_admins;

CREATE POLICY "Owners can manage client admins"
  ON public.client_admins FOR ALL
  USING (public.is_owner_of_client(client_id));
