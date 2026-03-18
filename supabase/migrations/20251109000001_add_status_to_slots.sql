-- ============================================================================
-- ADD STATUS TO SLOTS TABLE
-- ============================================================================
-- Description: Add status column to slots for tracking active vs archived slots
-- This enables historical data retention and analytics

-- Add status column to slots table
ALTER TABLE public.slots
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'));

-- Mark all past slots as archived
UPDATE public.slots
SET status = 'archived'
WHERE end_time < NOW();

-- Create index for faster filtering by status
CREATE INDEX idx_slots_status ON public.slots(status);
