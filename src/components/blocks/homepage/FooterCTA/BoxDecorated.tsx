import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FooterCTAProps } from './BannerGradient';

export const FooterCTABoxDecorated = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  accentColor,
}: FooterCTAProps) => {
  return (
    <div className="max-w-3xl mx-auto mt-16 sm:mt-20 mb-16 px-4">
      <div
        className="p-8 sm:p-12 border-2 rounded-lg text-center"
        style={{ borderColor: accentColor }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-4">{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground mb-6">{subtitle}</p>
        )}
        <Link to={ctaLink}>
          <Button
            size="lg"
            className="min-w-[200px]"
            style={{ backgroundColor: accentColor }}
          >
            {ctaText}
          </Button>
        </Link>
      </div>
    </div>
  );
};
