import { HeaderVariants } from './blocks/homepage/Header';
import { HeroVariants } from './blocks/homepage/Hero';
import { FeaturesVariants } from './blocks/homepage/Features';
import { ServicesVariants } from './blocks/homepage/Services';
import { OpeningHoursVariants } from './blocks/homepage/OpeningHours';
import { ContactVariants } from './blocks/homepage/Contact';
import { FooterCTAVariants } from './blocks/homepage/FooterCTA';
import { FooterVariants } from './blocks/homepage/Footer';
import { AuthVariants } from './blocks/auth';
import { ServiceSelectorVariants } from './blocks/booking/ServiceSelector';
import { TimePickerVariants } from './blocks/booking/TimePicker';
import { BookingListVariants } from './blocks/booking/BookingList';
import type { Service } from '@/types';

// Registre de tous les blocs disponibles
const BLOCK_REGISTRY: Record<string, Record<string, React.ComponentType<any>>> = {
  Header: HeaderVariants,
  Hero: HeroVariants,
  Features: FeaturesVariants,
  Services: ServicesVariants,
  OpeningHours: OpeningHoursVariants,
  Contact: ContactVariants,
  FooterCTA: FooterCTAVariants,
  Footer: FooterVariants,
  Auth: AuthVariants as Record<string, React.ComponentType<any>>,
  ServiceSelector: ServiceSelectorVariants,
  TimePicker: TimePickerVariants,
  BookingList: BookingListVariants,
};

// Données mock pour les blocs booking en mode preview
const MOCK_SERVICES: Service[] = [
  { id: 'preview-1', name: 'Prestation A', description: 'Description de la prestation', duration: 60, price: 60, enabled: true, color: '#8B5CF6' },
  { id: 'preview-2', name: 'Prestation B', description: 'Description de la prestation', duration: 30, price: 40, enabled: true, color: '#A78BFA' },
];

const MOCK_OPENING_HOURS: Record<string, string> = {
  monday: '9:00 - 18:00',
  tuesday: '9:00 - 18:00',
  wednesday: '9:00 - 18:00',
  thursday: '9:00 - 18:00',
  friday: '9:00 - 18:00',
  saturday: '10:00 - 16:00',
  sunday: 'Closed',
};

// Props runtime injectées par type de bloc (auth = no-op, booking = données réelles ou mock)
const getRuntimeProps = (
  type: string,
  services: Service[],
  openingHours: Record<string, string>
): Record<string, any> => {
  const previewServices = services.length ? services : MOCK_SERVICES;
  const previewOpeningHours = Object.keys(openingHours).length ? openingHours : MOCK_OPENING_HOURS;
  // Durée du premier service activé, fallback 60 min
  const firstDuration = previewServices[0]?.duration ?? 60;

  switch (type) {
    case 'Auth':
      return {
        onSignIn: async () => ({ error: undefined }),
        onSignUp: async () => ({ error: undefined }),
      };
    case 'ServiceSelector':
      return {
        services: previewServices,
        selectedServiceId: null,
        onServiceSelect: () => {},
      };
    case 'TimePicker':
      return {
        bookings: [],
        openingHours: previewOpeningHours,
        serviceDuration: firstDuration,
        granularity: 30,
        onTimeSelect: () => {},
      };
    case 'BookingList':
      return {
        bookings: [],
        services: previewServices,
        onCancel: () => {},
      };
    default:
      return {};
  }
};

// Props de la config globale à pousser dans chaque bloc
const getConfigOverrides = (type: string, config: GlobalConfigOverride): Record<string, any> => {
  const overrides: Record<string, any> = {};
  if (config.accentColor) overrides.accentColor = config.accentColor;

  switch (type) {
    case 'Header':
    case 'Hero':
    case 'Footer':
    case 'Auth':
      if (config.brandName) overrides.brandName = config.brandName;
      if (config.businessSector) overrides.businessSector = config.businessSector;
      break;
    case 'Services':
      if (config.services?.length) overrides.services = config.services;
      break;
    case 'OpeningHours':
      if (config.openingHours) overrides.openingHours = config.openingHours;
      break;
    case 'Contact':
      if (config.contact) overrides.contact = config.contact;
      break;
  }
  return overrides;
};

export interface PageBlock {
  type: string;
  variant: string;
  props: Record<string, any>;
  _comment?: string;
}

export interface GlobalConfigOverride {
  brandName?: string;
  businessSector?: string;
  accentColor?: string;
  services?: Service[];
  openingHours?: Record<string, string>;
  contact?: { email?: string; phone?: string; address?: string };
}

interface PageRendererProps {
  blocks: PageBlock[];
  config?: GlobalConfigOverride;
}

export const PageRenderer = ({ blocks, config = {} }: PageRendererProps) => {
  return (
    <div>
      {blocks.map((block, i) => {
        const variants = BLOCK_REGISTRY[block.type];
        if (!variants) return null;
        let Component = variants[block.variant];
        if (!Component) {
          // Fallback: use first available variant if the AI returned a wrong variant name
          const firstKey = Object.keys(variants)[0];
          console.warn(`[PageRenderer] Variant "${block.variant}" not found for type "${block.type}", falling back to "${firstKey}"`);
          Component = variants[firstKey];
          if (!Component) return null;
        }

        const runtimeProps = getRuntimeProps(block.type, config.services || [], config.openingHours || {});
        const configOverrides = getConfigOverrides(block.type, config);

        return (
          <Component
            key={i}
            {...block.props}
            {...configOverrides}
            {...runtimeProps}
          />
        );
      })}
    </div>
  );
};
