import { Link } from 'react-router-dom';
import { HeaderProps } from './CenteredIcon';

export const HeaderLeftAccent = ({
  brandName,
  businessSector,
  accentColor,
  ctaText,
  ctaLink = '/auth',
  logoUrl,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-8 w-auto object-contain" />
          ) : (
            /* Barre verticale accent */
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">{brandName}</h1>
            {businessSector && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {businessSector}
              </p>
            )}
          </div>
        </div>
        {ctaText && (
          <Link
            to={ctaLink}
            className="text-sm font-medium hover:underline transition-colors"
            style={{ color: accentColor }}
          >
            {ctaText} →
          </Link>
        )}
      </div>
    </header>
  );
};
