import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import { BOOKING_STATUS } from '@/constants';
import type { Booking, Service } from '@/types';

interface AdminBookingListProps {
  bookings: Booking[];
  services: Service[];
  primaryColor: string;
  onBookingClick: (booking: Booking) => void;
}

/**
 * AdminBookingList - Liste des réservations pour l'admin
 * Affiche toutes les réservations avec code couleur par service
 */
export const AdminBookingList = ({
  bookings,
  services,
  primaryColor,
  onBookingClick,
}: AdminBookingListProps) => {
  const confirmedCount = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length;
  const completedCount = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Toutes les réservations
        </CardTitle>
        <CardDescription>
          {confirmedCount} à venir • {completedCount} terminées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune réservation pour le moment
            </p>
          ) : (
            bookings.map((booking) => {
              const service = services.find(s => s.id === booking.service_id);
              const startTime = booking.start_time
                ? parseLocalDateTime(booking.start_time)
                : parseLocalDateTime(booking.slot?.start_time);
              const endTime = booking.end_time ? parseLocalDateTime(booking.end_time) : null;

              return (
                <div
                  key={booking.id}
                  className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onBookingClick(booking)}
                >
                  {/* Indicateur de couleur du service */}
                  <div
                    className="w-1 h-14 sm:h-16 rounded-full flex-shrink-0"
                    style={{ backgroundColor: service?.color || primaryColor }}
                  />

                  {/* Informations du booking */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {booking.user?.full_name || booking.user?.email}
                      </p>
                      <span
                        className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `${service?.color || primaryColor}20`,
                          color: service?.color || primaryColor,
                        }}
                      >
                        {service?.name || 'Service'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
                      <span className="whitespace-nowrap">
                        {startTime.toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {startTime.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {endTime && (
                          <>
                            {' - '}
                            {endTime.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </>
                        )}
                      </span>
                      {booking.duration && (
                        <span className="text-[10px] sm:text-xs">({booking.duration}min)</span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="text-right flex-shrink-0">
                    {booking.status === BOOKING_STATUS.CONFIRMED ? (
                      <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-primary/10 text-primary">
                        À venir
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
                        Terminé
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
