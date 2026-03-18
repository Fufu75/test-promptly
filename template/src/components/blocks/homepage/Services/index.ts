/**
 * Services Block - Homepage
 * Section présentant les services/prestations avec prix et durée
 */

import { ServicesCardsHover } from './CardsHover';
import { ServicesListCompact } from './ListCompact';
import { ServicesCardsBordered } from './CardsBordered';

export { ServicesCardsHover } from './CardsHover';
export { ServicesListCompact } from './ListCompact';
export { ServicesCardsBordered } from './CardsBordered';
export type { ServicesProps, Service } from './CardsHover';

/**
 * Map des variants disponibles pour Services
 * Noms descriptifs du layout, pas du style
 */
export const ServicesVariants = {
  'cards-hover': ServicesCardsHover,
  'list-compact': ServicesListCompact,
  'cards-bordered': ServicesCardsBordered,
} as const;

export type ServicesVariantKey = keyof typeof ServicesVariants;
