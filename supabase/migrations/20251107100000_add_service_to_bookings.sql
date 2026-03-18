-- ============================================================================
-- Migration: Add Service Support to Bookings
-- Description: Add service_id and duration to bookings table
-- ============================================================================

-- Add service_id (référence l'id du service dans config.json)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_id TEXT;

-- Add duration (stocke la durée en minutes au moment de la réservation)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
