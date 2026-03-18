-- ============================================================================
-- Migration: Add exclusion constraint to prevent booking time conflicts
-- Description: Prevent two confirmed bookings from overlapping in time
-- Uses PostgreSQL EXCLUDE constraint with tstzrange (timestamp range type)
-- ============================================================================

-- Enable the btree_gist extension (required for EXCLUDE constraint)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping confirmed bookings
-- This ensures that two bookings cannot have overlapping time ranges
-- if they are both in 'confirmed' status
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_time_overlap
  EXCLUDE USING gist (
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status = 'confirmed');

-- Note: The '[)' means the range includes start_time but excludes end_time
-- This allows back-to-back bookings: booking1 ends at 11:20, booking2 starts at 11:20
-- The constraint only applies to 'confirmed' bookings, allowing cancelled/completed
-- bookings to have overlapping times without causing conflicts
