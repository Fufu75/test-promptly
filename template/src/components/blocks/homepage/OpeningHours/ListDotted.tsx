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

export const OpeningHoursListDotted = ({
  openingHours,
  accentColor,
  sectionTitle = "Nos Horaires",
  sectionSubtitle = "Quand nous accueillir",
}: OpeningHoursProps) => {
  return (
    <div className="max-w-2xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-border" />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div className="h-px w-12 bg-border" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">{sectionTitle}</h3>
        <p className="text-muted-foreground">{sectionSubtitle}</p>
      </div>
      <div
        className="border-2 rounded-lg p-6 sm:p-8"
        style={{ borderColor: `${accentColor}30` }}
      >
        <div className="space-y-2">
          {Object.entries(openingHours).map(([day, hours]) => (
            <div
              key={day}
              className="flex items-center justify-between py-2"
            >
              <span className="font-serif font-medium">{dayTranslations[day] || day}</span>
              <div className="flex-1 mx-4 border-b border-dotted border-border/50" />
              <span
                className={`font-medium ${hours === 'Closed' ? 'text-muted-foreground italic' : ''}`}
                style={{ color: hours === 'Closed' ? undefined : accentColor }}
              >
                {hours === 'Closed' ? 'Fermé' : hours}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
