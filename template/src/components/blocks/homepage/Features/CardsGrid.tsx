import { Clock, CheckCircle, Shield, LucideIcon } from 'lucide-react';

// Map d'icônes disponibles
const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  check: CheckCircle,
  shield: Shield,
};

export interface Feature {
  icon: string;
  iconUrl?: string;
  title: string;
  description: string;
}

export interface FeaturesProps {
  features: Feature[];
  accentColor: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export const FeaturesCardsGrid = ({
  features,
  accentColor,
  sectionTitle,
  sectionSubtitle,
}: FeaturesProps) => {
  return (
    <div className="max-w-5xl mx-auto mb-16 sm:mb-20 px-4">
      {(sectionTitle || sectionSubtitle) && (
        <div className="text-center mb-8">
          {sectionTitle && (
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">{sectionTitle}</h3>
          )}
          {sectionSubtitle && (
            <p className="text-muted-foreground">{sectionSubtitle}</p>
          )}
        </div>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, index) => {
          const IconComponent = iconMap[feature.icon] || CheckCircle;
          return (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border/50 space-y-3 hover:shadow-lg transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: feature.iconUrl ? 'transparent' : `${accentColor}20` }}
              >
                {feature.iconUrl ? (
                  <img src={feature.iconUrl} alt={feature.title} className="w-8 h-8 object-contain" />
                ) : (
                  <IconComponent className="w-6 h-6" style={{ color: accentColor }} />
                )}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
