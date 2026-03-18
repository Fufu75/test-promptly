import { ServicesProps } from './CardsHover';

export const ServicesCardsBordered = ({
  services,
  accentColor,
  sectionTitle = "Nos Prestations",
  sectionSubtitle = "Des services de qualité pour vous",
}: ServicesProps) => {
  return (
    <div className="max-w-4xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-border" />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div className="h-px w-12 bg-border" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">{sectionTitle}</h3>
        <p className="text-muted-foreground">{sectionSubtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-6 border-2 rounded-lg text-center"
            style={{ borderColor: `${accentColor}30` }}
          >
            {service.imageUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-16 h-1 mx-auto mb-4 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            )}
            <h4 className="text-lg font-serif font-semibold mb-2">{service.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {service.description}
            </p>
            <div className="pt-4 border-t" style={{ borderColor: `${accentColor}20` }}>
              <span className="text-2xl font-bold" style={{ color: accentColor }}>
                {service.price}€
              </span>
              <span className="text-sm text-muted-foreground ml-2">/ {service.duration} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
