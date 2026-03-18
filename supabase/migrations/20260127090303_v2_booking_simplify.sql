-- ============================================================================
-- MIGRATION V2 : Système de réservation simplifié
-- ============================================================================
-- Les créneaux sont maintenant auto-générés depuis openingHours
-- slot_id devient optionnel dans la table bookings
-- ============================================================================

-- 1. Rendre slot_id optionnel
ALTER TABLE public.bookings ALTER COLUMN slot_id DROP NOT NULL;

-- 2. Changer ON DELETE CASCADE en ON DELETE SET NULL
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_slot_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_slot_id_fkey
  FOREIGN KEY (slot_id)
  REFERENCES public.slots(id)
  ON DELETE SET NULL;

-- 3. Index pour les performances (si pas déjà présent)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
