/**
 * OpeningHours Block - Homepage
 * Section affichant les horaires d'ouverture
 */

import { OpeningHoursGridCards } from './GridCards';
import { OpeningHoursListSimple } from './ListSimple';
import { OpeningHoursListDotted } from './ListDotted';

export { OpeningHoursGridCards } from './GridCards';
export { OpeningHoursListSimple } from './ListSimple';
export { OpeningHoursListDotted } from './ListDotted';
export type { OpeningHoursProps, OpeningHoursData } from './GridCards';

/**
 * Map des variants disponibles pour OpeningHours
 * Noms descriptifs du layout, pas du style
 */
export const OpeningHoursVariants = {
  'grid-cards': OpeningHoursGridCards,
  'list-simple': OpeningHoursListSimple,
  'list-dotted': OpeningHoursListDotted,
} as const;

export type OpeningHoursVariantKey = keyof typeof OpeningHoursVariants;
