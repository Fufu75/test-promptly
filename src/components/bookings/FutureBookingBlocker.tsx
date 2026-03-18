import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import type { Booking, Service } from '@/types';

interface FutureBookingBlockerProps {
  futureBooking: Booking;
  services: Service[];
}

/**
 * FutureBookingBlocker - Message informatif si un rendez-vous futur existe
 * Bloque la réservation et affiche les détails du prochain rendez-vous
 */
export const FutureBookingBlocker = ({
  futureBooking,
  services,
}: FutureBookingBlockerProps) => {
  const bookingDate = parseLocalDateTime(
    futureBooking.start_time || futureBooking.slot?.start_time
  );
  const bookingService = services.find(s => s.id === futureBooking.service_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réservation non disponible</CardTitle>
        <CardDescription>
          Vous avez déjà un rendez-vous à venir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 sm:p-6 text-center space-y-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">
              {bookingService?.name || 'Rendez-vous'} programmé
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {bookingDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">
              à {bookingDate.toLocaleTimeString('fr-FR', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-2">
            Vous pourrez réserver un nouveau rendez-vous après celui-ci.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
