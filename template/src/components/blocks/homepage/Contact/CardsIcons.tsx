import { Mail, Phone, MapPin } from 'lucide-react';

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface ContactProps {
  contact: ContactInfo;
  accentColor: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export const ContactCardsIcons = ({
  contact,
  accentColor,
  sectionTitle = "Nous contacter",
  sectionSubtitle = "Une question ? Contactez-nous",
}: ContactProps) => {
  return (
    <div className="max-w-3xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold mb-2">{sectionTitle}</h3>
        <p className="text-muted-foreground">{sectionSubtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {contact.email && (
          <div className="p-6 rounded-xl bg-card border border-border/50 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Mail className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="font-medium mb-1">Email</p>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-muted-foreground hover:underline transition-colors"
                style={{ color: undefined }}
                onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                {contact.email}
              </a>
            </div>
          </div>
        )}
        {contact.phone && (
          <div className="p-6 rounded-xl bg-card border border-border/50 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Phone className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="font-medium mb-1">Téléphone</p>
              <a
                href={`tel:${contact.phone}`}
                className="text-sm text-muted-foreground hover:underline transition-colors"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        )}
        {contact.address && (
          <div className="p-6 rounded-xl bg-card border border-border/50 flex items-start gap-4 sm:col-span-2 hover:shadow-lg transition-shadow">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <MapPin className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="font-medium mb-1">Adresse</p>
              <p className="text-sm text-muted-foreground">{contact.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
