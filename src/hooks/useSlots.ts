/**
 * useSlots (v2 - Simplifié)
 * Fetch uniquement les bookings confirmés
 * Les créneaux sont générés depuis openingHours (pas de table slots)
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/constants';

interface UseSlotsOptions {
  autoFetch?: boolean;
}

interface UseSlotsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: Error | null;
  fetchBookings: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useSlots = (options: UseSlotsOptions = {}): UseSlotsReturn => {
  const { autoFetch = true } = options;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch toutes les réservations confirmées (pour vérifier les conflits)
   */
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', BOOKING_STATUS.CONFIRMED)
        .gte('end_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      setBookings((data as Booking[]) || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err as Error);
      toast.error('Impossible de charger les réservations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch) {
      fetchBookings();
    }
  }, [autoFetch, fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    refetch: fetchBookings,
  };
};
