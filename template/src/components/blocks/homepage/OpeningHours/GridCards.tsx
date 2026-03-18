import { Clock } from 'lucide-react';

export interface OpeningHoursData {
  [day: string]: string;
}

export interface OpeningHoursProps {
  openingHours: OpeningHoursData;
  accentColor: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

const dayTranslations: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

export const OpeningHoursGridCards = ({
  openingHours,
  accentColor,
  sectionTitle = "Horaires d'ouverture",
  sectionSubtitle = "Nous sommes là pour vous",
}: OpeningHoursProps) => {
  return (
    <div className="max-w-3xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Clock className="w-7 h-7" style={{ color: accentColor }} />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-2">{sectionTitle}</h3>
        <p className="text-muted-foreground">{sectionSubtitle}</p>
      </div>
      <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(openingHours).map(([day, hours]) => (
            <div
              key={day}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ backgroundColor: hours === 'Closed' ? 'transparent' : `${accentColor}08` }}
            >
              <span className="font-medium">{dayTranslations[day] || day}</span>
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
    </div>
  );
};
