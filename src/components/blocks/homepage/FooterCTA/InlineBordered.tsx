import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FooterCTAProps } from './BannerGradient';

export const FooterCTAInlineBordered = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  accentColor,
}: FooterCTAProps) => {
  return (
    <div className="max-w-2xl mx-auto mt-16 sm:mt-20 mb-16 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 border-t border-b border-border/50">
        <div>
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Link to={ctaLink}>
          <Button
            size="lg"
            variant="outline"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            {ctaText} →
          </Button>
        </Link>
      </div>
    </div>
  );
};
