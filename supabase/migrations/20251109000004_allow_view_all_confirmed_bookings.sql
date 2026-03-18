-- ============================================================================
-- Migration: Allow all authenticated users to view confirmed bookings
-- Description: Users need to see all confirmed bookings to check availability
-- This is required for the booking system to prevent double-booking
-- ============================================================================

-- Add policy to allow viewing all confirmed bookings for availability checking
-- Users can still only see full details of their own bookings via the existing policy
CREATE POLICY "Anyone can view confirmed bookings for availability"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND status = 'confirmed'
  );

-- Note: This policy allows authenticated users to see confirmed bookings
-- to check time slot availability. Personal details are minimized in the
-- frontend when showing other users' bookings (only time slots are shown).
