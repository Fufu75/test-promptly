import { Helmet } from 'react-helmet-async';
import { useConfig } from '@/hooks/useConfig';

/**
 * Composant Head - Gère dynamiquement les meta tags depuis config.json
 * Modifie le titre de la page, description, et meta tags sociaux (OpenGraph, Twitter)
 */
export const Head = () => {
  const config = useConfig();

  return (
    <Helmet>
      {/* Title */}
      <title>{config.seo?.title || config.brandName}</title>

      {/* Meta descriptions */}
      <meta name="description" content={config.seo?.description || config.description} />
      <meta name="keywords" content={config.seo?.keywords || ''} />
      <meta name="author" content={config.brandName} />

      {/* OpenGraph (Facebook) */}
      <meta property="og:title" content={config.seo?.title || config.brandName} />
      <meta property="og:description" content={config.seo?.description || config.description} />
      <meta property="og:type" content="website" />
      {config.logoUrl && <meta property="og:image" content={config.logoUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.seo?.title || config.brandName} />
      <meta name="twitter:description" content={config.seo?.description || config.description} />
      {config.logoUrl && <meta name="twitter:image" content={config.logoUrl} />}
      {config.social?.twitter && <meta name="twitter:site" content={config.social.twitter} />}

      {/* Langue */}
      <html lang="fr" />
    </Helmet>
  );
};
