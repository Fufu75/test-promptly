-- ============================================================================
-- Migration: Add start_time and end_time to bookings
-- Description: Store exact booking time within a slot
-- ============================================================================

-- Add start_time and end_time to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON public.bookings(start_time, end_time);

-- Add constraint to ensure end_time > start_time
ALTER TABLE public.bookings
  ADD CONSTRAINT valid_booking_time_range CHECK (end_time > start_time);
