import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import { BOOKING_STATUS } from '@/constants';
import type { Booking, Service } from '@/types';

export interface BookingListProps {
  bookings: Booking[];
  services: Service[];
  accentColor: string;
  allowCancellation?: boolean;
  onCancel?: (bookingId: string) => void;
  sectionTitle?: string;
  sectionSubtitle?: string;
  emptyMessage?: string;
}

/**
 * BookingList - Cards Stack
 * Cards empilées, service + date + heure + statut + bouton annuler
 */
export const BookingListCardsStack = ({
  bookings,
  services,
  accentColor,
  allowCancellation = true,
  onCancel,
  sectionTitle = 'Mes réservations',
  sectionSubtitle = 'Consultez et gérez vos rendez-vous',
  emptyMessage = 'Aucune réservation pour le moment',
}: BookingListProps) => {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">{sectionTitle}</h3>
        {sectionSubtitle && (
          <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
        )}
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => {
          const service = booking.service_id
            ? services.find(s => s.id === booking.service_id)
            : null;

          const startTime = booking.start_time
            ? parseLocalDateTime(booking.start_time)
            : parseLocalDateTime(booking.slot?.start_time);

          const endTime = booking.end_time
            ? parseLocalDateTime(booking.end_time)
            : parseLocalDateTime(booking.slot?.end_time);

          const isConfirmed = booking.status === BOOKING_STATUS.CONFIRMED;

          return (
            <div
              key={booking.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                {service && (
                  <p className="font-semibold text-sm sm:text-base" style={{ color: accentColor }}>
                    {service.name}
                  </p>
                )}
                <p className="font-medium text-sm sm:text-base mt-1">
                  {startTime.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {startTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
                  {' - '}
                  {endTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
                  {booking.duration && ` (${booking.duration} min)`}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                {isConfirmed ? (
                  <>
                    <span
                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Confirmé</span>
                    </span>
                    {allowCancellation && onCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onCancel(booking.id)}
                      >
                        Annuler
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
                    <XCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Annulé</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {bookings.length === 0 && (
          <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
};
