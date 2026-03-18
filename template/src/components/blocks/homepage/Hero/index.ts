/**
 * Hero Block - Homepage
 * Section d'en-tête principale pour la page d'accueil
 */

import { HeroCenteredBadge } from './CenteredBadge';
import { HeroSplitImage } from './SplitImage';
import { HeroCenteredDecorated } from './CenteredDecorated';

export { HeroCenteredBadge } from './CenteredBadge';
export { HeroSplitImage } from './SplitImage';
export { HeroCenteredDecorated } from './CenteredDecorated';
export type { HeroProps } from './CenteredBadge';

/**
 * Map des variants disponibles pour le Hero
 * Noms descriptifs du layout, pas du style
 */
export const HeroVariants = {
  'centered-badge': HeroCenteredBadge,
  'split-image': HeroSplitImage,
  'centered-decorated': HeroCenteredDecorated,
} as const;

export type HeroVariantKey = keyof typeof HeroVariants;
