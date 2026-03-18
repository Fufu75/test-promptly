import { useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Clock } from 'lucide-react';
import { getAvailableTimeSlotsForService } from '@/utils/availabilityHelpers';
import type { TimePickerProps } from './WeekGrid';

/**
 * TimePicker - Calendar Sidebar
 * Layout 2 colonnes : calendrier mois à gauche, créneaux à droite
 * Créneaux en liste simple pour le jour sélectionné
 */
export const TimePickerCalendarSidebar = ({
  bookings,
  openingHours,
  serviceDuration,
  granularity,
  accentColor,
  maxAdvanceBookingDays = 60,
  onTimeSelect,
  sectionTitle = 'Choisissez un créneau',
  sectionSubtitle,
}: TimePickerProps) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);

  const allAvailableTimes = useMemo(() =>
    getAvailableTimeSlotsForService(
      serviceDuration,
      bookings,
      openingHours,
      granularity,
      maxAdvanceBookingDays
    ),
    [serviceDuration, bookings, openingHours, granularity, maxAdvanceBookingDays]
  );

  // Jours qui ont des créneaux disponibles
  const daysWithSlots = useMemo(() => {
    const days = new Set<string>();
    allAvailableTimes.forEach((time) => {
      days.add(format(time, 'yyyy-MM-dd'));
    });
    return days;
  }, [allAvailableTimes]);

  const availableTimes = selectedDay
    ? allAvailableTimes.filter((time) => isSameDay(time, selectedDay))
    : [];

  const isDayDisabled = (date: Date) => {
    return !daysWithSlots.has(format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold">{sectionTitle}</h3>
        {sectionSubtitle && (
          <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
        {/* Calendrier */}
        <div className="border rounded-lg p-3">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            locale={fr}
            disabled={isDayDisabled}
            modifiersStyles={{
              selected: {
                backgroundColor: accentColor,
                color: 'white',
              },
            }}
          />
        </div>

        {/* Créneaux pour le jour sélectionné */}
        <div className="min-h-[280px]">
          {!selectedDay ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Clock className="w-6 h-6" style={{ color: accentColor }} />
              </div>
              <p className="text-muted-foreground text-sm">
                Sélectionnez un jour dans le calendrier
              </p>
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-muted-foreground py-8">
                Aucun horaire disponible pour ce jour
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium mb-3">
                {format(selectedDay, 'EEEE d MMMM', { locale: fr })}
                <span className="text-muted-foreground ml-2">
                  ({availableTimes.length} créneaux)
                </span>
              </h4>
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {availableTimes.map((time) => (
                  <Button
                    key={time.toISOString()}
                    variant="outline"
                    className="w-full justify-start h-10 text-sm"
                    onClick={() => onTimeSelect(time)}
                  >
                    <Clock className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    {format(time, 'HH:mm')}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
