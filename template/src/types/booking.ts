/**
 * Booking types - Client reservation
 * Centralized type definition to avoid duplication
 */

export interface Booking {
  id: string;
  slot_id?: string | null; // Optionnel depuis v2 (créneaux auto-générés)
  user_id: string;
  service_id: string;
  duration: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;

  // Relations (populated by Supabase joins)
  user?: {
    id?: string;
    full_name?: string;
    email?: string;
  };
  slot?: {
    id?: string;
    start_time?: string;
    end_time?: string;
  };
  slots?: {
    id?: string;
    start_time?: string;
    end_time?: string;
  };
  profiles?: {
    id?: string;
    full_name?: string;
    email?: string;
  };
}

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';
