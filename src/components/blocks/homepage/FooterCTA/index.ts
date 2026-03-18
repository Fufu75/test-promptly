/**
 * FooterCTA Block - Homepage
 * Bandeau d'appel à l'action avant le footer
 */

import { FooterCTABannerGradient } from './BannerGradient';
import { FooterCTAInlineBordered } from './InlineBordered';
import { FooterCTABoxDecorated } from './BoxDecorated';

export { FooterCTABannerGradient } from './BannerGradient';
export { FooterCTAInlineBordered } from './InlineBordered';
export { FooterCTABoxDecorated } from './BoxDecorated';
export type { FooterCTAProps } from './BannerGradient';

/**
 * Map des variants disponibles pour FooterCTA
 * Noms descriptifs du layout, pas du style
 */
export const FooterCTAVariants = {
  'banner-gradient': FooterCTABannerGradient,
  'inline-bordered': FooterCTAInlineBordered,
  'box-decorated': FooterCTABoxDecorated,
} as const;

export type FooterCTAVariantKey = keyof typeof FooterCTAVariants;
