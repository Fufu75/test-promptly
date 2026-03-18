import { Clock } from 'lucide-react';
import type { ServiceSelectorProps } from './CardsGrid';

/**
 * ServiceSelector - List Compact
 * Liste verticale, chaque service = une ligne
 * Icône gauche, nom + durée au centre, prix à droite
 * Fond coloré léger sur sélection
 */
export const ServiceSelectorListCompact = ({
  services,
  selectedServiceId,
  accentColor,
  onServiceSelect,
  sectionTitle = 'Choisissez votre service',
  sectionSubtitle,
}: ServiceSelectorProps) => {
  const enabledServices = services.filter(s => s.enabled);

  if (enabledServices.length === 0) return null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">{sectionTitle}</h3>
        {sectionSubtitle && (
          <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
        )}
        <div
          className="w-12 h-0.5 mt-3"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      <div className="space-y-1">
        {enabledServices.map((service) => {
          const isSelected = selectedServiceId === service.id;
          return (
            <div
              key={service.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'shadow-sm' : 'hover:bg-muted/50'
              }`}
              style={isSelected ? { backgroundColor: `${accentColor}12` } : {}}
              onClick={() => onServiceSelect(service.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <Clock className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.duration} min</p>
                </div>
              </div>
              <span
                className="text-sm sm:text-base font-semibold flex-shrink-0"
                style={{ color: accentColor }}
              >
                {service.price}€
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
