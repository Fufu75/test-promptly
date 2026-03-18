-- ============================================================================
-- ADD 'completed' STATUS TO BOOKINGS
-- ============================================================================
-- Description: Allow bookings to have a 'completed' status for past appointments
-- This enables automatic cleanup of past bookings and proper booking limits

-- Drop existing constraint
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add new constraint with 'completed' status
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('confirmed', 'cancelled', 'completed'));

-- Update any past bookings to 'completed' status
UPDATE public.bookings
SET status = 'completed'
WHERE status = 'confirmed'
  AND end_time < NOW();
 