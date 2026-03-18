import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { Service } from '@/types';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
}

/**
 * ServiceSelector - Grille de sélection de services
 * Affiche tous les services activés sous forme de cartes cliquables
 */
export const ServiceSelector = ({
  services,
  selectedServiceId,
  onServiceSelect,
}: ServiceSelectorProps) => {
  // Filtrer les services activés
  const enabledServices = services.filter(s => s.enabled);

  if (enabledServices.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choisissez votre service</CardTitle>
        <CardDescription>Sélectionnez le service que vous souhaitez réserver</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enabledServices.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all ${
                selectedServiceId === service.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onServiceSelect(service.id)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold">{service.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                      <span className="text-xs sm:text-sm font-medium">
                        {service.duration} min
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-primary">
                        {service.price}€
                      </span>
                    </div>
                  </div>
                  {selectedServiceId === service.id && (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
