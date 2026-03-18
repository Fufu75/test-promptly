import { Clock, CheckCircle, Shield, LucideIcon } from 'lucide-react';
import { FeaturesProps } from './CardsGrid';

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  check: CheckCircle,
  shield: Shield,
};

export const FeaturesCirclesCentered = ({
  features,
  accentColor,
  sectionTitle,
  sectionSubtitle,
}: FeaturesProps) => {
  return (
    <div className="max-w-5xl mx-auto mb-16 sm:mb-20 px-4">
      {(sectionTitle || sectionSubtitle) && (
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-border" />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-px w-12 bg-border" />
          </div>
          {sectionTitle && (
            <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">{sectionTitle}</h3>
          )}
          {sectionSubtitle && (
            <p className="text-muted-foreground">{sectionSubtitle}</p>
          )}
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const IconComponent = iconMap[feature.icon] || CheckCircle;
          return (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 overflow-hidden"
                style={{ borderColor: accentColor }}
              >
                {feature.iconUrl ? (
                  <img src={feature.iconUrl} alt={feature.title} className="w-10 h-10 object-contain" />
                ) : (
                  <IconComponent className="w-7 h-7" style={{ color: accentColor }} />
                )}
              </div>
              <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
