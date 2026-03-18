/**
 * Contact Block - Homepage
 * Section affichant les informations de contact
 */

import { ContactCardsIcons } from './CardsIcons';
import { ContactListInline } from './ListInline';
import { ContactCirclesRow } from './CirclesRow';

export { ContactCardsIcons } from './CardsIcons';
export { ContactListInline } from './ListInline';
export { ContactCirclesRow } from './CirclesRow';
export type { ContactProps, ContactInfo } from './CardsIcons';

/**
 * Map des variants disponibles pour Contact
 * Noms descriptifs du layout, pas du style
 */
export const ContactVariants = {
  'cards-icons': ContactCardsIcons,
  'list-inline': ContactListInline,
  'circles-row': ContactCirclesRow,
} as const;

export type ContactVariantKey = keyof typeof ContactVariants;
