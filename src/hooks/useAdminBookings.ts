/**
 * useAdminBookings - Hook for managing bookings (admin view)
 * Handles fetching bookings with user/slot details and canceling
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/constants';

interface UseAdminBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: Error | null;
  fetchBookings: () => Promise<void>;
  cancelBooking: (bookingId: string, slotId?: string) => Promise<void>;
  updatePastBookings: () => Promise<void>;
  getBookingsForSlot: (slotId: string) => Booking[];
  refetch: () => Promise<void>;
}

export const useAdminBookings = (): UseAdminBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Update past confirmed bookings to completed
   */
  const updatePastBookings = useCallback(async () => {
    const now = new Date().toISOString();

    try {
      // Fetch past confirmed bookings
      const { data: pastBookings, error: fetchError } = await supabase
        .from('bookings')
        .select('id, end_time')
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
  }, []);

  /**
   * Fetch all bookings with user and slot details
   */
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          slots(*),
          profiles(*)
        `)
        .in('status', [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED])
        .order('start_time', { ascending: false });

      if (fetchError) throw fetchError;

      // Map data to add user and slot aliases
      const mappedData = (data || []).map(booking => ({
        ...booking,
        user: booking.profiles,
        slot: booking.slots
      }));

      setBookings(mappedData as Booking[]);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err as Error);
      toast.error('Impossible de charger les réservations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancel a booking as admin
   */
  const cancelBooking = useCallback(async (bookingId: string, slotId?: string) => {
    try {
      // Delete booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Update slot availability if provided
      if (slotId) {
        const { error: slotError } = await supabase
          .from('slots')
          .update({ is_available: true })
          .eq('id', slotId);

        if (slotError) {
          console.error('Error updating slot availability:', slotError);
        }
      }

      toast.success('Réservation annulée avec succès');
      await fetchBookings();
    } catch (err) {
      console.error('Error canceling booking:', err);
      toast.error('Impossible d\'annuler la réservation');
    }
  }, [fetchBookings]);

  /**
   * Get bookings for a specific slot
   */
  const getBookingsForSlot = useCallback((slotId: string): Booking[] => {
    return bookings.filter(booking => booking.slot_id === slotId);
  }, [bookings]);

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
    getBookingsForSlot,
    refetch,
  };
};
