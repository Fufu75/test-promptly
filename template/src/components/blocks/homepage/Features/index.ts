/**
 * Features Block - Homepage
 * Section mettant en avant les fonctionnalités/avantages
 */

import { FeaturesCardsGrid } from './CardsGrid';
import { FeaturesListVertical } from './ListVertical';
import { FeaturesCirclesCentered } from './CirclesCentered';

export { FeaturesCardsGrid } from './CardsGrid';
export { FeaturesListVertical } from './ListVertical';
export { FeaturesCirclesCentered } from './CirclesCentered';
export type { FeaturesProps, Feature } from './CardsGrid';

/**
 * Map des variants disponibles pour Features
 * Noms descriptifs du layout, pas du style
 */
export const FeaturesVariants = {
  'cards-grid': FeaturesCardsGrid,
  'list-vertical': FeaturesListVertical,
  'circles-centered': FeaturesCirclesCentered,
} as const;

export type FeaturesVariantKey = keyof typeof FeaturesVariants;
