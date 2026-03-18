import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import { BOOKING_STATUS } from '@/constants';
import type { BookingListProps } from './CardsStack';

/**
 * BookingList - Timeline Vertical
 * Timeline avec points connectés par une ligne
 * Chaque booking = un noeud avec détails à droite
 */
export const BookingListTimelineVertical = ({
  bookings,
  services,
  accentColor,
  allowCancellation = true,
  onCancel,
  sectionTitle = 'Mes réservations',
  sectionSubtitle = 'Consultez et gérez vos rendez-vous',
  emptyMessage = 'Aucune réservation pour le moment',
}: BookingListProps) => {
  if (bookings.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">{sectionTitle}</h3>
          {sectionSubtitle && (
            <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
          )}
        </div>
        <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold">{sectionTitle}</h3>
        {sectionSubtitle && (
          <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
        )}
      </div>

      <div className="relative pl-8">
        {/* Ligne verticale */}
        <div
          className="absolute left-3 top-2 bottom-2 w-0.5 rounded-full"
          style={{ backgroundColor: `${accentColor}25` }}
        />

        <div className="space-y-6">
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
              <div key={booking.id} className="relative">
                {/* Point sur la timeline */}
                <div
                  className="absolute -left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background"
                  style={{ borderColor: isConfirmed ? accentColor : '#d1d5db' }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isConfirmed ? accentColor : '#d1d5db' }}
                  />
                </div>

                {/* Contenu */}
                <div className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {service && (
                        <p className="font-semibold text-sm sm:text-base" style={{ color: accentColor }}>
                          {service.name}
                        </p>
                      )}
                      <p className="text-sm mt-1">
                        {startTime.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {startTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
                        {' - '}
                        {endTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
                        {booking.duration && ` (${booking.duration} min)`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isConfirmed ? (
                        <>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium"
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmé
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
                          <XCircle className="h-3 w-3" />
                          Annulé
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
