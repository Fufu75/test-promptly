/**
 * Auth Block - Page d'authentification
 * Login/Signup avec différents layouts
 */

import { AuthCenteredCard } from './CenteredCard';
import { AuthSplitImage } from './SplitImage';
import { AuthMinimal } from './Minimal';

export { AuthCenteredCard } from './CenteredCard';
export { AuthSplitImage } from './SplitImage';
export { AuthMinimal } from './Minimal';
export type { AuthProps } from './CenteredCard';

/**
 * Map des variants disponibles pour Auth
 */
export const AuthVariants = {
  'centered-card': AuthCenteredCard,
  'split-image': AuthSplitImage,
  'minimal': AuthMinimal,
} as const;

export type AuthVariantKey = keyof typeof AuthVariants;
