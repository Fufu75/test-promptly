import { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getAvailableTimeSlotsForService } from '@/utils/availabilityHelpers';
import type { Booking } from '@/types';

interface OpeningHours {
  [key: string]: string;
}

interface AvailableTimePickerProps {
  bookings: Booking[];
  openingHours: OpeningHours;
  serviceDuration: number;
  granularity: number;
  maxAdvanceBookingDays?: number;
  onTimeSelect: (startTime: Date) => void;
}

export const AvailableTimePicker = ({
  bookings,
  openingHours,
  serviceDuration,
  granularity,
  maxAdvanceBookingDays = 60,
  onTimeSelect,
}: AvailableTimePickerProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Calculer tous les créneaux disponibles
  const allAvailableTimes = getAvailableTimeSlotsForService(
    serviceDuration,
    bookings,
    openingHours,
    granularity,
    maxAdvanceBookingDays
  );

  // Calculer les créneaux disponibles pour un jour donné
  const getAvailableTimesForDay = (day: Date): Date[] => {
    return allAvailableTimes.filter((time) => {
      return (
        time.getDate() === day.getDate() &&
        time.getMonth() === day.getMonth() &&
        time.getFullYear() === day.getFullYear()
      );
    });
  };

  // Compter les créneaux disponibles par jour
  const getAvailableCountForDay = (day: Date): number => {
    return getAvailableTimesForDay(day).length;
  };

  const availableTimes = selectedDay ? getAvailableTimesForDay(selectedDay) : [];

  // Grouper les créneaux par période (matin, après-midi, soir)
  const groupTimesByPeriod = (times: Date[]) => {
    const morning = times.filter((t) => t.getHours() < 12);
    const afternoon = times.filter((t) => t.getHours() >= 12 && t.getHours() < 18);
    const evening = times.filter((t) => t.getHours() >= 18);

    return { morning, afternoon, evening };
  };

  const groupedTimes = groupTimesByPeriod(availableTimes);

  return (
    <div className="space-y-6">
      {/* Navigation semaine */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold">
          {format(weekStart, 'MMM d', { locale: fr })} - {format(addDays(weekStart, 6), 'MMM d, yyyy', { locale: fr })}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
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
                onSelect={(date) => {
                  if (date) {
                    setCurrentWeek(date);
                  }
                }}
                locale={fr}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sélection du jour - scroll horizontal sur mobile */}
      <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="grid grid-cols-7 gap-2 min-w-max sm:min-w-0">
          {weekDays.map((day) => {
            const count = getAvailableCountForDay(day);
            const isSelected =
              selectedDay &&
              day.getDate() === selectedDay.getDate() &&
              day.getMonth() === selectedDay.getMonth();
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <Card
                key={day.toISOString()}
                className={`
                  p-2 sm:p-3 md:p-4 cursor-pointer transition-all text-center min-w-[75px] sm:min-w-0
                  ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}
                  ${isPast || count === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => {
                  if (!isPast && count > 0) {
                    setSelectedDay(day);
                  }
                }}
              >
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">{format(day, 'd')}</div>
                {count > 0 && !isPast && (
                  <div className="text-[10px] sm:text-xs text-primary mt-1 sm:mt-2">{count} créneaux</div>
                )}
                {count === 0 && !isPast && (
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">Complet</div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Créneaux disponibles pour le jour sélectionné */}
      {selectedDay && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h4 className="text-base sm:text-lg font-semibold">
              Horaires disponibles pour le {format(selectedDay, 'EEEE d MMMM', { locale: fr })}
            </h4>
          </div>

          {availableTimes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun horaire disponible pour ce jour
            </p>
          ) : (
            <div className="space-y-6">
              {/* Matin */}
              {groupedTimes.morning.length > 0 && (
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Matin</h5>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {groupedTimes.morning.map((time) => (
                      <Button
                        key={time.toISOString()}
                        variant="outline"
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        onClick={() => onTimeSelect(time)}
                      >
                        {format(time, 'HH:mm')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Après-midi */}
              {groupedTimes.afternoon.length > 0 && (
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Après-midi</h5>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {groupedTimes.afternoon.map((time) => (
                      <Button
                        key={time.toISOString()}
                        variant="outline"
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        onClick={() => onTimeSelect(time)}
                      >
                        {format(time, 'HH:mm')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Soir */}
              {groupedTimes.evening.length > 0 && (
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Soir</h5>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {groupedTimes.evening.map((time) => (
                      <Button
                        key={time.toISOString()}
                        variant="outline"
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        onClick={() => onTimeSelect(time)}
                      >
                        {format(time, 'HH:mm')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
