import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export interface HeaderProps {
  brandName: string;
  businessSector?: string;
  accentColor: string;
  ctaText?: string;
  ctaLink?: string;
  logoUrl?: string;
}

export const HeaderCenteredIcon = ({
  brandName,
  businessSector,
  accentColor,
  ctaText,
  ctaLink = '/auth',
  logoUrl,
}: HeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: logoUrl ? 'transparent' : `${accentColor}20` }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="w-full h-full object-cover" />
            ) : (
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold">{brandName}</h1>
            {businessSector && (
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {businessSector}
              </p>
            )}
          </div>
        </div>
        {ctaText && (
          <Link to={ctaLink}>
            <Button size="sm" style={{ backgroundColor: accentColor }}>
              {ctaText}
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};
