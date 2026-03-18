-- ============================================================================
-- Migration: Remove UNIQUE constraint on slot_id in bookings table
-- Description: Allow multiple bookings within the same slot (time range)
-- Reason: A slot is a large time range (e.g., 11h-15h) that should contain
--         multiple bookings at different specific times (11h00, 11h20, etc.)
-- ============================================================================

-- Drop the incorrect UNIQUE constraint on slot_id
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_slot_id_key;
  
