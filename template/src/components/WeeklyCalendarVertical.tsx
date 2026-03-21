import { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useConfig } from '@/hooks/useConfig';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/constants';

interface WeeklyCalendarVerticalProps {
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
}

export const WeeklyCalendarVertical = ({
  bookings,
  onBookingClick,
}: WeeklyCalendarVerticalProps) => {
  const config = useConfig();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday

  // Calculer les heures min/max depuis les opening hours
  const getBusinessHours = () => {
    const allHours = Object.values(config.openingHours)
      .filter(h => h !== 'Closed')
      .map(h => {
        const [start, end] = h.split('-');
        return {
          start: parseInt(start.split(':')[0]),
          end: parseInt(end.split(':')[0]),
        };
      });

    if (allHours.length === 0) return { min: 9, max: 17 };

    return {
      min: Math.min(...allHours.map(h => h.start)),
      max: Math.max(...allHours.map(h => h.end)),
    };
  };

  const { min: minHour, max: maxHour } = getBusinessHours();
  const totalMinutes = (maxHour - minHour) * 60;

  // Générer les jours de la semaine
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Vérifier si un jour est fermé
  const isDayClosed = (date: Date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[getDay(date)];
    return config.openingHours[dayName] === 'Closed';
  };

  // Obtenir les heures d'ouverture pour un jour spécifique
  const getDayHours = (date: Date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[getDay(date)];
    const hours = config.openingHours[dayName];

    if (!hours || hours === 'Closed') return null;

    const [start, end] = hours.split('-');
    return {
      start: parseInt(start.split(':')[0]),
      end: parseInt(end.split(':')[0]),
    };
  };

  // Trouver tous les bookings pour un jour donné
  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => {
      if (!booking.start_time) return false;
      const bookingStart = parseLocalDateTime(booking.start_time);
      const bookingDate = new Date(bookingStart.getFullYear(), bookingStart.getMonth(), bookingStart.getDate());
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return bookingDate.getTime() === targetDate.getTime() &&
             (booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.COMPLETED);
    });
  };

  // Calculer la position et hauteur d'un booking en pourcentage
  const getBookingPosition = (booking: Booking) => {
    const startTime = parseLocalDateTime(booking.start_time);
    const endTime = parseLocalDateTime(booking.end_time);

    const startMinutes = (startTime.getHours() - minHour) * 60 + startTime.getMinutes();
    const endMinutes = (endTime.getHours() - minHour) * 60 + endTime.getMinutes();

    const top = (startMinutes / totalMinutes) * 100;
    const height = ((endMinutes - startMinutes) / totalMinutes) * 100;

    return { top: `${top}%`, height: `${height}%` };
  };

  // Générer les lignes de grille (une par heure)
  const hourLines = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);

  return (
    <div className="space-y-4">
      {/* Header avec navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
          {format(weekStart, 'MMM d', { locale: fr })} - {format(addDays(weekStart, 6), 'MMM d, yyyy', { locale: fr })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="text-xs sm:text-sm" onClick={() => setCurrentWeek(new Date())}>
            Aujourd'hui
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Choisir une date">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentWeek}
                onSelect={(date) => { if (date) setCurrentWeek(date); }}
                locale={fr}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendrier avec scroll horizontal sur mobile */}
      <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
        <div className="flex gap-2 md:gap-4 min-w-max md:min-w-0">
          {/* Colonne des heures */}
          <div className="flex flex-col relative flex-shrink-0" style={{ width: '50px', minHeight: '600px' }}>
            <div className="h-12 md:h-16" />
            <div className="relative flex-1">
              {hourLines.map((hour) => (
                <div
                  key={hour}
                  className="absolute text-xs md:text-sm font-medium text-muted-foreground text-right pr-2 md:pr-3"
                  style={{
                    top: `${((hour - minHour) / (maxHour - minHour)) * 100}%`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {/* Colonnes des jours */}
          <div className="flex gap-2 md:gap-3 md:flex-1 md:grid md:grid-cols-7">
            {weekDays.map((day) => {
              const dayBookings = getBookingsForDay(day);
              const isClosed = isDayClosed(day);
              const dayHours = getDayHours(day);

              return (
                <div key={day.toISOString()} className="flex flex-col min-h-[600px] w-[120px] md:w-auto flex-shrink-0 md:flex-shrink">
                  {/* Header du jour */}
                  <div className="text-center pb-2 md:pb-3 mb-2 border-b-2">
                    <div className="font-semibold text-sm md:text-base">{format(day, 'EEE', { locale: fr })}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{format(day, 'd MMM', { locale: fr })}</div>
                  </div>

                  {/* Colonne du jour */}
                  <div className="relative flex-1 border-x-2 rounded-md bg-card">
                    {/* Lignes de grille */}
                    {hourLines.map((hour) => (
                      <div
                        key={hour}
                        className="absolute w-full border-t border-muted/30"
                        style={{ top: `${((hour - minHour) / (maxHour - minHour)) * 100}%` }}
                      />
                    ))}

                    {isClosed ? (
                      <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Fermé</span>
                      </div>
                    ) : (
                      <>
                        {/* Zone d'ouverture */}
                        {dayHours && (
                          <div
                            className="absolute w-full bg-primary/5"
                            style={{
                              top: `${((dayHours.start - minHour) / (maxHour - minHour)) * 100}%`,
                              height: `${((dayHours.end - dayHours.start) / (maxHour - minHour)) * 100}%`,
                            }}
                          />
                        )}

                        {/* Bookings */}
                        {dayBookings.map((booking) => {
                          const service = config.services.find(s => s.id === booking.service_id);
                          const color = service?.color || config.theme.primaryColor;
                          const position = getBookingPosition(booking);
                          const startTime = parseLocalDateTime(booking.start_time);
                          const isCompleted = booking.status === BOOKING_STATUS.COMPLETED;

                          return (
                            <div
                              key={booking.id}
                              className={`absolute inset-x-1 rounded-md shadow-sm cursor-pointer hover:shadow-lg hover:z-10 transition-all overflow-hidden border-2 ${
                                isCompleted ? 'border-muted/30 opacity-60' : 'border-white/20'
                              }`}
                              style={{
                                ...position,
                                backgroundColor: isCompleted ? '#9ca3af' : color,
                                minHeight: '36px',
                              }}
                              onClick={() => onBookingClick?.(booking)}
                            >
                              <div className="px-1.5 py-1 text-white h-full flex flex-col justify-center">
                                <div className="font-bold text-[11px] leading-tight">
                                  {startTime.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  })}
                                </div>
                                <div className="font-medium text-[10px] leading-tight truncate opacity-90">
                                  {booking.user?.full_name || booking.profiles?.full_name || 'Client'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
