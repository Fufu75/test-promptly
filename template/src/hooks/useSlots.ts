/**
 * useSlots (v2)
 * Fetch uniquement les bookings confirmés futurs filtrés par client_id.
 * Les créneaux disponibles sont générés à la volée depuis openingHours (pas de table slots).
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/constants';

interface UseSlotsReturn {
  bookings: Booking[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const useSlots = (): UseSlotsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', BOOKING_STATUS.CONFIRMED)
        .eq('client_id', import.meta.env.VITE_CLIENT_ID)
        .gte('end_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setBookings((data as Booking[]) || []);
    } catch (err) {
      console.error('[useSlots] Error fetching bookings:', err);
      toast.error('Impossible de charger les disponibilités');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, refetch: fetchBookings };
};
