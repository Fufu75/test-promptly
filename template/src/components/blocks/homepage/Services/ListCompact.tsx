import { ServicesProps } from './CardsHover';

export const ServicesListCompact = ({
  services,
  accentColor,
  sectionTitle = "Services",
  sectionSubtitle,
}: ServicesProps) => {
  return (
    <div className="max-w-3xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-1">{sectionTitle}</h3>
        {sectionSubtitle && (
          <p className="text-sm text-muted-foreground">{sectionSubtitle}</p>
        )}
        <div
          className="w-12 h-0.5 mt-4"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between py-4 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-4">
              {service.imageUrl ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-2 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              <div>
                <h4 className="font-medium">{service.name}</h4>
                <p className="text-sm text-muted-foreground">{service.duration} min</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold" style={{ color: accentColor }}>
                {service.price}€
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
