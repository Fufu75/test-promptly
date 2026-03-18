import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeaderProps } from './CenteredIcon';

export const HeaderCenteredBordered = ({
  brandName,
  businessSector,
  accentColor,
  ctaText,
  ctaLink = '/auth',
  logoUrl,
}: HeaderProps) => {
  return (
    <header className="border-b-2 bg-background sticky top-0 z-10" style={{ borderColor: accentColor }}>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Logo centré sur mobile, à gauche sur desktop */}
          <div className="flex-1 sm:flex-none text-center sm:text-left">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-10 w-auto object-contain mx-auto sm:mx-0" />
            ) : (
              <h1 className="text-xl sm:text-2xl font-serif font-bold">{brandName}</h1>
            )}
            {businessSector && (
              <p className="text-xs text-muted-foreground tracking-wide mt-0.5">
                {businessSector}
              </p>
            )}
          </div>

          {/* Séparateur décoratif - desktop only */}
          <div className="hidden sm:flex items-center gap-2 flex-1 justify-center">
            <div className="h-px w-12 bg-border" />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-px w-12 bg-border" />
          </div>

          {/* CTA */}
          {ctaText && (
            <div className="flex-1 sm:flex-none text-right">
              <Link to={ctaLink}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {ctaText}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
