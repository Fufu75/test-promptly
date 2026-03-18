/**
 * Status constants for bookings and slots
 * Use these instead of magic strings to avoid typos and enable refactoring
 */

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SLOT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

// Type helpers
export type BookingStatusValue = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
export type SlotStatusValue = typeof SLOT_STATUS[keyof typeof SLOT_STATUS];
