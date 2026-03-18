/**
 * Footer Block - Homepage
 * Pied de page avec copyright et branding
 */

import { FooterSplitBrand } from './SplitBrand';
import { FooterCenteredSimple } from './CenteredSimple';
import { FooterCenteredDecorated } from './CenteredDecorated';

export { FooterSplitBrand } from './SplitBrand';
export { FooterCenteredSimple } from './CenteredSimple';
export { FooterCenteredDecorated } from './CenteredDecorated';
export type { FooterProps } from './SplitBrand';

/**
 * Map des variants disponibles pour Footer
 * Noms descriptifs du layout, pas du style
 */
export const FooterVariants = {
  'split-brand': FooterSplitBrand,
  'centered-simple': FooterCenteredSimple,
  'centered-decorated': FooterCenteredDecorated,
} as const;

export type FooterVariantKey = keyof typeof FooterVariants;
