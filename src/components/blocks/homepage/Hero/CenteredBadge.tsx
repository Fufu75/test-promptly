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
  backgroundImage?: string;
  sideImage?: string;
}

export const HeroCenteredBadge = ({
  brandName,
  title,
  description,
  accentColor,
  ctaPrimary,
  ctaSecondary,
  backgroundImage,
}: HeroProps) => {
  return (
    <div
      className="max-w-5xl mx-auto text-center space-y-6 mb-16 sm:mb-20 rounded-3xl p-8 sm:p-12 shadow-sm border relative overflow-hidden"
      style={{
        background: backgroundImage
          ? `linear-gradient(135deg, ${accentColor}CC, ${accentColor}99), url(${backgroundImage})`
          : `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={`relative z-10 ${backgroundImage ? 'text-white' : ''}`}>
        <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${backgroundImage ? 'bg-white/20 backdrop-blur border-white/30' : 'bg-white/60 backdrop-blur'}`}>
          {brandName}
        </div>
        <div className="space-y-3 mt-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {title}
          </h2>
          <p className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto ${backgroundImage ? 'text-white/90' : 'text-muted-foreground'}`}>
            {description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <Link to={ctaPrimary.link}>
            <Button size="lg" style={{ backgroundColor: backgroundImage ? 'white' : accentColor, color: backgroundImage ? accentColor : 'white' }}>
              {ctaPrimary.text}
            </Button>
          </Link>
          {ctaSecondary && (
            <Link
              to={ctaSecondary.link}
              className={`text-sm transition-colors underline ${backgroundImage ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-primary'}`}
            >
              {ctaSecondary.text}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
