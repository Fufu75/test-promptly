import type { ServiceSelectorProps } from './CardsGrid';

/**
 * ServiceSelector - Pills Horizontal
 * Rangée de pills/badges horizontaux scrollables
 * Nom + durée dans chaque pill
 * Fond plein coloré sur sélection
 */
export const ServiceSelectorPillsHorizontal = ({
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
      </div>
      <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="flex gap-3 min-w-max sm:min-w-0 sm:flex-wrap pb-2">
          {enabledServices.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <button
                key={service.id}
                type="button"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                  isSelected ? 'text-white shadow-md' : 'hover:shadow-sm'
                }`}
                style={isSelected ? {
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                } : {
                  borderColor: `${accentColor}30`,
                }}
                onClick={() => onServiceSelect(service.id)}
              >
                <span>{service.name}</span>
                <span
                  className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}
                >
                  {service.duration} min
                </span>
                <span
                  className={`text-xs font-bold ${isSelected ? 'text-white' : ''}`}
                  style={!isSelected ? { color: accentColor } : {}}
                >
                  {service.price}€
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
