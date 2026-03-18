import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import { BOOKING_STATUS } from '@/constants';
import type { BookingListProps } from './CardsStack';

/**
 * BookingList - Table Compact
 * Vue table : colonnes Service | Date | Heure | Statut | Action
 */
export const BookingListTableCompact = ({
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
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">{sectionTitle}</h3>
        {sectionSubtitle && (
          <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
        )}
      </div>

      {/* Table desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Service</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Heure</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Statut</th>
              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
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
                <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2">
                    <span className="font-medium" style={{ color: accentColor }}>
                      {service?.name || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {startTime.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-2">
                    {startTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
                    {' - '}
                    {endTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-2">
                    {isConfirmed ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <XCircle className="h-3 w-3" />
                        Annulé
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {isConfirmed && allowCancellation && onCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onCancel(booking.id)}
                      >
                        Annuler
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vue mobile : cards compactes */}
      <div className="sm:hidden space-y-3">
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
            <div key={booking.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm" style={{ color: accentColor }}>
                  {service?.name || '-'}
                </span>
                {isConfirmed ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Confirmé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                    <XCircle className="h-3 w-3" />
                    Annulé
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {startTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {startTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
                {' - '}
                {endTime.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' })}
              </p>
              {isConfirmed && allowCancellation && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mt-2 w-full"
                  onClick={() => onCancel(booking.id)}
                >
                  Annuler
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
