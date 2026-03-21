-- ============================================================================
-- MIGRATION : Nettoyage des policies dupliquées sur bookings
-- ============================================================================
-- Objectif : supprimer les policies redondantes créées par les migrations
-- successives. Aucune opération n'est laissée sans couverture.
--
-- Couverture après nettoyage :
--   SELECT  → "Users can view their own bookings"
--             "Authenticated users can view confirmed bookings for availability"
--             "Site admins can view bookings of their site"
--   INSERT  → "Users can create their own bookings"
--   UPDATE  → "Users can update their own bookings"
--   DELETE  → "Users can delete their own bookings"
--             "Site admins can delete bookings of their site"
-- ============================================================================

-- Doublons SELECT
DROP POLICY IF EXISTS "Admins can view all confirmed bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;

-- Doublons INSERT
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;

-- Doublons UPDATE
DROP POLICY IF EXISTS "Users can cancel own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
