import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingListItem } from './BookingListItem';
import type { Booking, Service } from '@/types';

interface BookingListProps {
  bookings: Booking[];
  services: Service[];
  allowCancellation?: boolean;
  onCancel?: (bookingId: string) => void;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

/**
 * BookingList - Section complète de la liste des réservations
 * Affiche toutes les réservations avec titre et gestion de l'état vide
 */
export const BookingList = ({
  bookings,
  services,
  allowCancellation = true,
  onCancel,
  title = 'Mes réservations',
  description = 'Consultez et gérez vos rendez-vous',
  emptyMessage = 'Aucune réservation pour le moment',
}: BookingListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingListItem
              key={booking.id}
              booking={booking}
              services={services}
              allowCancellation={allowCancellation}
              onCancel={onCancel}
            />
          ))}
          {bookings.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
