import { OpeningHoursProps } from './GridCards';

const dayTranslations: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

export const OpeningHoursListSimple = ({
  openingHours,
  accentColor,
  sectionTitle = "Horaires",
}: OpeningHoursProps) => {
  return (
    <div className="max-w-2xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-1">{sectionTitle}</h3>
        <div
          className="w-12 h-0.5 mt-4"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      <div className="space-y-0">
        {Object.entries(openingHours).map(([day, hours]) => (
          <div
            key={day}
            className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
          >
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {dayTranslations[day] || day}
            </span>
            <span
              className={`font-medium ${hours === 'Closed' ? 'text-muted-foreground' : ''}`}
              style={{ color: hours === 'Closed' ? undefined : accentColor }}
            >
              {hours === 'Closed' ? 'Fermé' : hours}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
