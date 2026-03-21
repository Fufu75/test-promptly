-- ============================================================================
-- MIGRATION : Suppression policy legacy "Admins can delete bookings"
-- ============================================================================
-- Objectif : supprimer la policy admin DELETE trop permissive qui permettait
-- à n'importe quel admin de supprimer les bookings de tous les sites.
-- Elle est remplacée par "Site admins can delete bookings of their site"
-- (créée dans la migration 20260321000001).
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
