import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export interface HeroProps {
  brandName: string;
  title: string;
  description: string;
  accentColor: string;
  ctaPrimary: {
    text: string;
    link: string;
  };
  ctaSecondary?: {
    text: string;
    link: string;
  };
}

export const HeroModern = ({
  brandName,
  title,
  description,
  accentColor,
  ctaPrimary,
  ctaSecondary,
}: HeroProps) => {
  return (
    <div
      className="max-w-5xl mx-auto text-center space-y-6 mb-16 sm:mb-20 rounded-3xl p-8 sm:p-12 shadow-sm border"
      style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }}
    >
      <div className="inline-flex px-4 py-2 rounded-full bg-white/60 backdrop-blur text-sm font-semibold border">
        {brandName}
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Link to={ctaPrimary.link}>
          <Button size="lg">
            {ctaPrimary.text}
          </Button>
        </Link>
        {ctaSecondary && (
          <Link
            to={ctaSecondary.link}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
          >
            {ctaSecondary.text}
          </Link>
        )}
      </div>
    </div>
  );
};
