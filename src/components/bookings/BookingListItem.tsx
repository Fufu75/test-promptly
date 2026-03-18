import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import { BOOKING_STATUS } from '@/constants';
import type { Booking, Service } from '@/types';

interface BookingListItemProps {
  booking: Booking;
  services: Service[];
  allowCancellation?: boolean;
  onCancel?: (bookingId: string) => void;
}

/**
 * BookingListItem - Carte d'une réservation individuelle
 * Affiche les détails d'une réservation avec possibilité d'annulation
 */
export const BookingListItem = ({
  booking,
  services,
  allowCancellation = true,
  onCancel,
}: BookingListItemProps) => {
  const service = booking.service_id
    ? services.find(s => s.id === booking.service_id)
    : null;

  const startTime = booking.start_time
    ? parseLocalDateTime(booking.start_time)
    : parseLocalDateTime(booking.slot.start_time);

  const endTime = booking.end_time
    ? parseLocalDateTime(booking.end_time)
    : parseLocalDateTime(booking.slot.end_time);

  const isConfirmed = booking.status === BOOKING_STATUS.CONFIRMED;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
      <div className="flex-1 min-w-0">
        {/* Service name */}
        {service && (
          <p className="font-semibold text-sm sm:text-base text-primary">{service.name}</p>
        )}

        {/* Date */}
        <p className="font-medium text-sm sm:text-base mt-1">
          {startTime.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {/* Time */}
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {startTime.toLocaleTimeString('fr-FR', {
            hour: 'numeric',
            minute: '2-digit',
          })}
          {' - '}
          {endTime.toLocaleTimeString('fr-FR', {
            hour: 'numeric',
            minute: '2-digit',
          })}
          {booking.duration && ` (${booking.duration} min)`}
        </p>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
        {isConfirmed ? (
          <>
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-primary/10 text-primary">
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
};
