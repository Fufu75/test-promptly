-- ============================================================================
-- MIGRATION : Fix RLS bookings — isolation par site via client_admins
-- ============================================================================
-- Objectif : remplacer les policies admin trop permissives sur bookings.
-- Avant : is_admin() → tous les admins voient/suppriment les bookings de tous les sites.
-- Après : un admin ne peut accéder qu'aux bookings des sites dont il est dans client_admins.
--
-- Super admins gardent l'accès total.
-- ============================================================================

-- Supprimer les policies trop permissives
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete any booking" ON public.bookings;

-- Un admin ne voit que les bookings de ses sites
CREATE POLICY "Site admins can view bookings of their site"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_admins
      WHERE client_id = bookings.client_id
        AND user_id = auth.uid()
    )
    OR public.is_super_admin()
  );

-- Un admin ne peut supprimer que les bookings de ses sites
CREATE POLICY "Site admins can delete bookings of their site"
  ON public.bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.client_admins
      WHERE client_id = bookings.client_id
        AND user_id = auth.uid()
    )
    OR public.is_super_admin()
  );
