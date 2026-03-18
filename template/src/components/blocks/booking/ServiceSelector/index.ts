/**
 * ServiceSelector Block - Booking
 * Sélection de service pour la page de réservation
 */

import { ServiceSelectorCardsGrid } from './CardsGrid';
import { ServiceSelectorListCompact } from './ListCompact';
import { ServiceSelectorPillsHorizontal } from './PillsHorizontal';

export { ServiceSelectorCardsGrid } from './CardsGrid';
export { ServiceSelectorListCompact } from './ListCompact';
export { ServiceSelectorPillsHorizontal } from './PillsHorizontal';
export type { ServiceSelectorProps } from './CardsGrid';

/**
 * Map des variants disponibles pour ServiceSelector
 */
export const ServiceSelectorVariants = {
  'cards-grid': ServiceSelectorCardsGrid,
  'list-compact': ServiceSelectorListCompact,
  'pills-horizontal': ServiceSelectorPillsHorizontal,
} as const;

export type ServiceSelectorVariantKey = keyof typeof ServiceSelectorVariants;
