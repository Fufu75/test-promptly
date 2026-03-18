/**
 * TimePicker Block - Booking
 * Sélection de créneau horaire pour la page de réservation
 */

import { TimePickerWeekGrid } from './WeekGrid';
import { TimePickerCalendarSidebar } from './CalendarSidebar';

export { TimePickerWeekGrid } from './WeekGrid';
export { TimePickerCalendarSidebar } from './CalendarSidebar';
export type { TimePickerProps } from './WeekGrid';

/**
 * Map des variants disponibles pour TimePicker
 */
export const TimePickerVariants = {
  'week-grid': TimePickerWeekGrid,
  'calendar-sidebar': TimePickerCalendarSidebar,
} as const;

export type TimePickerVariantKey = keyof typeof TimePickerVariants;
