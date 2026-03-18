import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactProps } from './CardsIcons';

export const ContactCirclesRow = ({
  contact,
  accentColor,
  sectionTitle = "Nous Trouver",
  sectionSubtitle = "Restons en contact",
}: ContactProps) => {
  return (
    <div className="max-w-3xl mx-auto mb-16 sm:mb-20 px-4">
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
        className="border-2 rounded-lg p-8 text-center"
        style={{ borderColor: `${accentColor}30` }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {contact.email && (
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border-2"
                style={{ borderColor: accentColor }}
              >
                <Mail className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm hover:underline"
                style={{ color: accentColor }}
              >
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border-2"
                style={{ borderColor: accentColor }}
              >
                <Phone className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="text-sm hover:underline"
                style={{ color: accentColor }}
              >
                {contact.phone}
              </a>
            </div>
          )}
          {contact.address && (
            <div className="flex flex-col items-center max-w-[200px]">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border-2"
                style={{ borderColor: accentColor }}
              >
                <MapPin className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <span className="text-sm text-muted-foreground text-center">
                {contact.address}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
