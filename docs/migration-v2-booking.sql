-- ============================================================================
-- MIGRATION V2 : Système de réservation simplifié
-- ============================================================================
-- Exécuter ce script sur les bases existantes pour passer en v2
-- Les créneaux sont maintenant auto-générés depuis openingHours
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

-- 3. Rendre start_time et end_time NOT NULL (si pas déjà le cas)
-- Note: Peut échouer si des bookings existants ont des valeurs NULL
-- UPDATE public.bookings SET start_time = created_at WHERE start_time IS NULL;
-- UPDATE public.bookings SET end_time = created_at + interval '1 hour' WHERE end_time IS NULL;
ALTER TABLE public.bookings ALTER COLUMN start_time SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN end_time SET NOT NULL;

-- 4. Indexes pour les requêtes de disponibilité (si pas déjà présents)
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON public.bookings(start_time, end_time);

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Après migration, exécuter pour vérifier :
-- SELECT column_name, is_nullable FROM information_schema.columns
-- WHERE table_name = 'bookings' AND column_name IN ('slot_id', 'start_time', 'end_time');
--
-- Résultat attendu :
-- slot_id    | YES
-- start_time | NO
-- end_time   | NO
-- ============================================================================
