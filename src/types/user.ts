/**
 * User and Profile types
 * Supabase auth + profiles table
 */

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'admin' | 'client';
