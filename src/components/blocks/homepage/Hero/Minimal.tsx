import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroProps } from './Modern';

export const HeroMinimal = ({
  brandName,
  title,
  description,
  accentColor,
  ctaPrimary,
  ctaSecondary,
}: HeroProps) => {
  return (
    <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Colonne gauche - Texte */}
        <div className="space-y-6">
          <div className="inline-block">
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: accentColor }}>
              {brandName}
            </p>
            <div className="h-0.5 w-12 mt-2" style={{ backgroundColor: accentColor }} />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to={ctaPrimary.link}>
              <Button size="lg" style={{ backgroundColor: accentColor }}>
                {ctaPrimary.text}
              </Button>
            </Link>
            {ctaSecondary && (
              <Link
                to={ctaSecondary.link}
                className="text-sm font-medium hover:underline"
                style={{ color: accentColor }}
              >
                {ctaSecondary.text} →
              </Link>
            )}
          </div>
        </div>

        {/* Colonne droite - Zone visuelle (placeholder pour l'instant) */}
        <div className="hidden md:block">
          <div
            className="aspect-square rounded-2xl border-2"
            style={{ borderColor: `${accentColor}33` }}
          >
            <div
              className="w-full h-full rounded-2xl opacity-5"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
