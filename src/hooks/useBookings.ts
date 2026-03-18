/**
 * useBookings - Hook for managing user bookings (v2)
 * Handles fetching, canceling, and updating bookings
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/constants';

interface UseBookingsOptions {
  userId?: string;
  autoFetch?: boolean;
}

interface UseBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: Error | null;
  fetchBookings: () => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updatePastBookings: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useBookings = (options: UseBookingsOptions = {}): UseBookingsReturn => {
  const { userId, autoFetch = false } = options;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Update past confirmed bookings to completed
   */
  const updatePastBookings = useCallback(async () => {
    if (!userId) return;

    const now = new Date().toISOString();

    try {
      // Fetch past confirmed bookings
      const { data: pastBookings, error: fetchError } = await supabase
        .from('bookings')
        .select('id, end_time')
        .eq('user_id', userId)
        .eq('status', BOOKING_STATUS.CONFIRMED)
        .lt('end_time', now);

      if (fetchError) throw fetchError;

      if (!pastBookings || pastBookings.length === 0) return;

      // Update to completed
      const bookingIds = pastBookings.map(b => b.id);
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: BOOKING_STATUS.COMPLETED })
        .in('id', bookingIds);

      if (updateError) throw updateError;

      console.log(`${pastBookings.length} past booking(s) marked as completed`);
    } catch (err) {
      console.error('Error updating past bookings:', err);
      setError(err as Error);
    }
  }, [userId]);

  /**
   * Fetch user bookings
   */
  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings((data as Booking[]) || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err as Error);
      toast.error('Impossible de charger les réservations');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Cancel a booking
   */
  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      // Update status to cancelled (instead of delete, to keep history)
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: BOOKING_STATUS.CANCELLED })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      toast.success('Réservation annulée');
      await fetchBookings();
    } catch (err) {
      console.error('Error canceling booking:', err);
      toast.error('Impossible d\'annuler la réservation');
    }
  }, [fetchBookings]);

  /**
   * Refetch bookings (alias for fetchBookings)
   */
  const refetch = fetchBookings;

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    cancelBooking,
    updatePastBookings,
    refetch,
  };
};
