/**
 * Header Block - Homepage
 * En-tête de navigation avec logo et CTA
 */

import { HeaderCenteredIcon } from './CenteredIcon';
import { HeaderLeftAccent } from './LeftAccent';
import { HeaderCenteredBordered } from './CenteredBordered';

export { HeaderCenteredIcon } from './CenteredIcon';
export { HeaderLeftAccent } from './LeftAccent';
export { HeaderCenteredBordered } from './CenteredBordered';
export type { HeaderProps } from './CenteredIcon';

/**
 * Map des variants disponibles pour le Header
 * Noms descriptifs du layout, pas du style
 */
export const HeaderVariants = {
  'centered-icon': HeaderCenteredIcon,
  'left-accent': HeaderLeftAccent,
  'centered-bordered': HeaderCenteredBordered,
} as const;

export type HeaderVariantKey = keyof typeof HeaderVariants;
