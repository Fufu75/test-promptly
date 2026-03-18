import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroProps } from './CenteredBadge';

export const HeroCenteredDecorated = ({
  brandName,
  title,
  description,
  accentColor,
  ctaPrimary,
  ctaSecondary,
  backgroundImage,
}: HeroProps) => {
  const hasBackground = !!backgroundImage;

  return (
    <div
      className="max-w-4xl mx-auto mb-16 sm:mb-20 text-center relative py-12 sm:py-16 px-4 rounded-2xl overflow-hidden"
      style={hasBackground ? {
        background: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      <div className={`relative z-10 ${hasBackground ? 'text-white' : ''}`}>
        {/* Ligne décorative supérieure */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`h-px w-16 ${hasBackground ? 'bg-white/30' : 'bg-border'}`} />
          <span
            className="text-sm font-medium uppercase tracking-[0.2em]"
            style={{ color: hasBackground ? 'white' : accentColor }}
          >
            {brandName}
          </span>
          <div className={`h-px w-16 ${hasBackground ? 'bg-white/30' : 'bg-border'}`} />
        </div>

        {/* Titre principal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
          {title}
        </h1>

        {/* Description */}
        <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed ${hasBackground ? 'text-white/90' : 'text-muted-foreground'}`}>
          {description}
        </p>

        {/* Séparateur */}
        <div
          className="w-24 h-1 mx-auto mb-8 rounded-full"
          style={{ backgroundColor: hasBackground ? 'white' : accentColor }}
        />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={ctaPrimary.link}>
            <Button
              size="lg"
              className="min-w-[200px]"
              style={{ backgroundColor: hasBackground ? 'white' : accentColor, color: hasBackground ? accentColor : 'white' }}
            >
              {ctaPrimary.text}
            </Button>
          </Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.link}>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px]"
                style={{
                  borderColor: hasBackground ? 'white' : accentColor,
                  color: hasBackground ? 'white' : accentColor,
                  backgroundColor: 'transparent'
                }}
              >
                {ctaSecondary.text}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
