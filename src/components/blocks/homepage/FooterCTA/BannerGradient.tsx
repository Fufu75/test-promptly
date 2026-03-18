import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export interface FooterCTAProps {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  accentColor: string;
}

export const FooterCTABannerGradient = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  accentColor,
}: FooterCTAProps) => {
  return (
    <div className="max-w-3xl mx-auto mt-16 sm:mt-20 mb-16 px-4">
      <div
        className="p-8 sm:p-12 rounded-3xl text-center"
        style={{
          background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
          border: `1px solid ${accentColor}30`,
        }}
      >
        <h3 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground mb-6">{subtitle}</p>
        )}
        <Link to={ctaLink}>
          <Button size="lg" style={{ backgroundColor: accentColor }}>
            {ctaText}
          </Button>
        </Link>
      </div>
    </div>
  );
};
