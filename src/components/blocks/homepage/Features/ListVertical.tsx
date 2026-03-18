import { Clock, CheckCircle, Shield, LucideIcon } from 'lucide-react';
import { FeaturesProps } from './CardsGrid';

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  check: CheckCircle,
  shield: Shield,
};

export const FeaturesListVertical = ({
  features,
  accentColor,
  sectionTitle,
  sectionSubtitle,
}: FeaturesProps) => {
  return (
    <div className="max-w-4xl mx-auto mb-16 sm:mb-20 px-4">
      {(sectionTitle || sectionSubtitle) && (
        <div className="mb-10">
          {sectionTitle && (
            <h3 className="text-xl sm:text-2xl font-semibold mb-1">{sectionTitle}</h3>
          )}
          {sectionSubtitle && (
            <p className="text-sm text-muted-foreground">{sectionSubtitle}</p>
          )}
          <div
            className="w-12 h-0.5 mt-4"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      )}
      <div className="space-y-8">
        {features.map((feature, index) => {
          const IconComponent = iconMap[feature.icon] || CheckCircle;
          return (
            <div key={index} className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: feature.iconUrl ? 'transparent' : `${accentColor}10` }}
              >
                {feature.iconUrl ? (
                  <img src={feature.iconUrl} alt={feature.title} className="w-6 h-6 object-contain" />
                ) : (
                  <IconComponent className="w-5 h-5" style={{ color: accentColor }} />
                )}
              </div>
              <div>
                <h4 className="font-medium mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
