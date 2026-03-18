import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactProps } from './CardsIcons';

export const ContactListInline = ({
  contact,
  accentColor,
  sectionTitle = "Contact",
}: ContactProps) => {
  return (
    <div className="max-w-2xl mx-auto mb-16 sm:mb-20 px-4">
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-1">{sectionTitle}</h3>
        <div
          className="w-12 h-0.5 mt-4"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      <div className="space-y-4">
        {contact.email && (
          <div className="flex items-center gap-4">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <a
              href={`mailto:${contact.email}`}
              className="hover:underline"
              style={{ color: accentColor }}
            >
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-4">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <a
              href={`tel:${contact.phone}`}
              className="hover:underline"
              style={{ color: accentColor }}
            >
              {contact.phone}
            </a>
          </div>
        )}
        {contact.address && (
          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{contact.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};
