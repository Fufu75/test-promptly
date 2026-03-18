-- ============================================================================
-- Migration: Add exclusion constraint to prevent slot time conflicts
-- Description: Prevent two active slots from overlapping in time
-- Uses PostgreSQL EXCLUDE constraint with tstzrange (timestamp range type)
-- ============================================================================

-- The btree_gist extension is already enabled from previous migrations
-- But we ensure it's available just in case
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping active slots
-- This ensures that two slots cannot have overlapping time ranges
-- if they are both in 'active' status
ALTER TABLE public.slots
  ADD CONSTRAINT slots_no_time_overlap
  EXCLUDE USING gist (
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status = 'active');

-- Note: The '[)' means the range includes start_time but excludes end_time
-- This allows back-to-back slots: slot1 ends at 12:00, slot2 starts at 12:00
-- The constraint only applies to 'active' slots, allowing archived slots
-- to have overlapping times without causing conflicts
