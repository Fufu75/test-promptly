/**
 * Slot types - Time slot created by admin
 * Centralized type definition to avoid duplication
 */

export interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status?: 'active' | 'archived';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export type SlotStatus = 'active' | 'archived';
