export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  imageUrl?: string;
}

export interface ServicesProps {
  services: Service[];
  accentColor: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export const ServicesCardsHover = ({
  services,
  accentColor,
  sectionTitle = "Nos services",
  sectionSubtitle = "Découvrez nos prestations",
}: ServicesProps) => {
  return (
    <div className="max-w-5xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold mb-2">{sectionTitle}</h3>
        <p className="text-muted-foreground">{sectionSubtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            {service.imageUrl ? (
              <div className="w-full h-32 rounded-lg overflow-hidden mb-4">
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            )}
            <h4 className="text-lg font-semibold mb-2">{service.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {service.description}
            </p>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm font-medium">{service.duration} min</span>
              <span className="text-lg font-bold" style={{ color: accentColor }}>{service.price}€</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
