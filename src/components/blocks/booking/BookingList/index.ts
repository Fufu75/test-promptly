/**
 * BookingList Block - Booking
 * Liste des réservations pour la page de réservation
 */

import { BookingListCardsStack } from './CardsStack';
import { BookingListTimelineVertical } from './TimelineVertical';
import { BookingListTableCompact } from './TableCompact';

export { BookingListCardsStack } from './CardsStack';
export { BookingListTimelineVertical } from './TimelineVertical';
export { BookingListTableCompact } from './TableCompact';
export type { BookingListProps } from './CardsStack';

/**
 * Map des variants disponibles pour BookingList
 */
export const BookingListVariants = {
  'cards-stack': BookingListCardsStack,
  'timeline-vertical': BookingListTimelineVertical,
  'table-compact': BookingListTableCompact,
} as const;

export type BookingListVariantKey = keyof typeof BookingListVariants;
