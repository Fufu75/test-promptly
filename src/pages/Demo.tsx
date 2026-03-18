import { HeaderVariants } from '@/components/blocks/homepage/Header';
import { HeroVariants } from '@/components/blocks/homepage/Hero';
import { FeaturesVariants } from '@/components/blocks/homepage/Features';
import { ServicesVariants } from '@/components/blocks/homepage/Services';
import { OpeningHoursVariants } from '@/components/blocks/homepage/OpeningHours';
import { ContactVariants } from '@/components/blocks/homepage/Contact';
import { FooterCTAVariants } from '@/components/blocks/homepage/FooterCTA';
import { FooterVariants } from '@/components/blocks/homepage/Footer';
import { AuthCenteredCard, AuthSplitImage, AuthMinimal } from '@/components/blocks/auth';
import { ServiceSelectorCardsGrid, ServiceSelectorListCompact, ServiceSelectorPillsHorizontal } from '@/components/blocks/booking/ServiceSelector';
import { TimePickerWeekGrid, TimePickerCalendarSidebar } from '@/components/blocks/booking/TimePicker';
import { BookingListCardsStack, BookingListTimelineVertical, BookingListTableCompact } from '@/components/blocks/booking/BookingList';

// ─── Données fictives partagées ────────────────────────────────────────────────

const SERVICES = [
  { id: '1', name: 'Massage Relaxant', description: 'Un massage doux pour évacuer le stress quotidien', duration: 60, price: 70, color: '#8B5CF6', enabled: true },
  { id: '2', name: 'Massage Profond', description: 'Travail en profondeur sur les tensions musculaires', duration: 90, price: 95, color: '#A78BFA', enabled: true },
  { id: '3', name: 'Soin Visage', description: 'Nettoyage et hydratation pour une peau éclatante', duration: 45, price: 55, color: '#C4B5FD', enabled: true },
];

const OPENING_HOURS = {
  monday: '9:00 - 19:00',
  tuesday: '9:00 - 19:00',
  wednesday: '9:00 - 19:00',
  thursday: '9:00 - 21:00',
  friday: '9:00 - 19:00',
  saturday: '10:00 - 18:00',
  sunday: 'Closed',
};

const FEATURES = [
  { icon: 'clock', title: 'Flexibilité totale', description: 'Réservez en ligne 24h/24, modifiez ou annulez facilement' },
  { icon: 'shield', title: 'Praticiens certifiés', description: 'Une équipe qualifiée et à votre écoute' },
  { icon: 'check', title: 'Satisfaction garantie', description: '97% de nos clients nous recommandent' },
];

const CONTACT = {
  email: 'contact@studio-zen.fr',
  phone: '01 23 45 67 89',
  address: '12 rue de la Paix, 75002 Paris',
};

const now = new Date();
const MOCK_BOOKINGS_DATA = [
  {
    id: 'b1',
    user_id: 'u1',
    service_id: '1',
    duration: 60,
    start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0).toISOString().replace('T', ' ').slice(0, 19),
    end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 11, 0).toISOString().replace('T', ' ').slice(0, 19),
    status: 'confirmed' as const,
    created_at: now.toISOString(),
  },
  {
    id: 'b2',
    user_id: 'u1',
    service_id: '2',
    duration: 90,
    start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 14, 0).toISOString().replace('T', ' ').slice(0, 19),
    end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 15, 30).toISOString().replace('T', ' ').slice(0, 19),
    status: 'confirmed' as const,
    created_at: now.toISOString(),
  },
  {
    id: 'b3',
    user_id: 'u1',
    service_id: '3',
    duration: 45,
    start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 16, 0).toISOString().replace('T', ' ').slice(0, 19),
    end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 16, 45).toISOString().replace('T', ' ').slice(0, 19),
    status: 'cancelled' as const,
    created_at: now.toISOString(),
  },
];

// ─── Block renderer helpers ────────────────────────────────────────────────────

interface BlockConfig {
  type: string;
  variant: string;
  props: Record<string, any>;
}

const HOMEPAGE_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  Header: HeaderVariants,
  Hero: HeroVariants,
  Features: FeaturesVariants,
  Services: ServicesVariants,
  OpeningHours: OpeningHoursVariants,
  Contact: ContactVariants,
  FooterCTA: FooterCTAVariants,
  Footer: FooterVariants,
};

const HomepageBlockRenderer = ({ block, index }: { block: BlockConfig; index: number }) => {
  const blockType = HOMEPAGE_COMPONENTS[block.type];
  if (!blockType) return null;
  const Component = blockType[block.variant];
  if (!Component) return null;
  return <Component key={`${block.type}-${block.variant}-${index}`} {...block.props} />;
};

// ─── 3 Homepage Configs ────────────────────────────────────────────────────────

const HOMEPAGE_MODERNE: BlockConfig[] = [
  { type: 'Header', variant: 'centered-icon', props: { brandName: 'Studio Zen', businessSector: 'Bien-être & Relaxation', accentColor: '#8B5CF6', ctaText: 'Réserver' } },
  { type: 'Hero', variant: 'centered-badge', props: { brandName: 'Studio Zen', title: 'Offrez-vous un moment de sérénité', description: 'Prenez rendez-vous pour une séance sur-mesure. Nos praticiens vous accompagnent vers un bien-être durable.', accentColor: '#8B5CF6', ctaPrimary: { text: 'Prendre rendez-vous', link: '#' }, ctaSecondary: { text: 'Découvrir nos soins', link: '#' } } },
  { type: 'Features', variant: 'cards-grid', props: { accentColor: '#8B5CF6', sectionTitle: 'Pourquoi nous choisir', sectionSubtitle: 'Des avantages qui font la différence', features: FEATURES } },
  { type: 'Services', variant: 'cards-hover', props: { accentColor: '#8B5CF6', sectionTitle: 'Nos soins', sectionSubtitle: 'Choisissez votre moment de détente', services: SERVICES } },
  { type: 'OpeningHours', variant: 'grid-cards', props: { accentColor: '#8B5CF6', sectionTitle: 'Nos horaires', sectionSubtitle: 'Nous sommes là pour vous', openingHours: OPENING_HOURS } },
  { type: 'Contact', variant: 'cards-icons', props: { accentColor: '#8B5CF6', sectionTitle: 'Nous contacter', sectionSubtitle: 'Une question ? On vous répond', contact: CONTACT } },
  { type: 'FooterCTA', variant: 'banner-gradient', props: { accentColor: '#8B5CF6', title: 'Prêt à vous détendre ?', subtitle: 'Réservez votre séance en quelques clics', ctaText: 'Réserver maintenant', ctaLink: '#' } },
  { type: 'Footer', variant: 'split-brand', props: { brandName: 'Studio Zen', accentColor: '#8B5CF6' } },
];

const HOMEPAGE_PRO: BlockConfig[] = [
  { type: 'Header', variant: 'left-accent', props: { brandName: 'Dr. Martin', businessSector: 'Cabinet Médical', accentColor: '#0891B2', ctaText: 'Prendre RDV' } },
  { type: 'Hero', variant: 'split-image', props: { brandName: 'Dr. Martin', title: 'Votre santé entre de bonnes mains', description: 'Cabinet de médecine générale au cœur de Paris. Consultations sur rendez-vous, téléconsultation disponible.', accentColor: '#0891B2', ctaPrimary: { text: 'Prendre rendez-vous', link: '#' }, ctaSecondary: { text: 'Nos spécialités', link: '#' } } },
  { type: 'Features', variant: 'list-vertical', props: { accentColor: '#0891B2', sectionTitle: 'Notre engagement', features: FEATURES } },
  { type: 'Services', variant: 'list-compact', props: { accentColor: '#0891B2', sectionTitle: 'Consultations', sectionSubtitle: 'Nos prestations médicales', services: SERVICES } },
  { type: 'OpeningHours', variant: 'list-simple', props: { accentColor: '#0891B2', sectionTitle: 'Horaires du cabinet', openingHours: OPENING_HOURS } },
  { type: 'Contact', variant: 'list-inline', props: { accentColor: '#0891B2', sectionTitle: 'Coordonnées', contact: CONTACT } },
  { type: 'FooterCTA', variant: 'inline-bordered', props: { accentColor: '#0891B2', title: 'Besoin d\'un rendez-vous ?', ctaText: 'Nous contacter', ctaLink: '#' } },
  { type: 'Footer', variant: 'centered-simple', props: { brandName: 'Dr. Martin', accentColor: '#0891B2' } },
];

const HOMEPAGE_ELEGANT: BlockConfig[] = [
  { type: 'Header', variant: 'centered-bordered', props: { brandName: 'Maison Éclat', businessSector: 'Salon de Coiffure', accentColor: '#B45309', ctaText: 'Réserver' } },
  { type: 'Hero', variant: 'centered-decorated', props: { brandName: 'Maison Éclat', title: 'L\'art de la coiffure depuis 1987', description: 'Un savoir-faire artisanal transmis de génération en génération. Chaque visite est une expérience unique.', accentColor: '#B45309', ctaPrimary: { text: 'Découvrir', link: '#' }, ctaSecondary: { text: 'Nos créations', link: '#' } } },
  { type: 'Features', variant: 'circles-centered', props: { accentColor: '#B45309', sectionTitle: 'Notre philosophie', sectionSubtitle: 'Ce qui nous distingue', features: FEATURES } },
  { type: 'Services', variant: 'cards-bordered', props: { accentColor: '#B45309', sectionTitle: 'Nos prestations', sectionSubtitle: 'Un soin pour chaque envie', services: SERVICES } },
  { type: 'OpeningHours', variant: 'list-dotted', props: { accentColor: '#B45309', sectionTitle: 'Horaires d\'ouverture', sectionSubtitle: 'Nous vous accueillons', openingHours: OPENING_HOURS } },
  { type: 'Contact', variant: 'circles-row', props: { accentColor: '#B45309', sectionTitle: 'Nous trouver', sectionSubtitle: 'Au plaisir de vous recevoir', contact: CONTACT } },
  { type: 'FooterCTA', variant: 'box-decorated', props: { accentColor: '#B45309', title: 'Une envie de changement ?', subtitle: 'Réservez votre prochaine visite', ctaText: 'Prendre rendez-vous', ctaLink: '#' } },
  { type: 'Footer', variant: 'centered-decorated', props: { brandName: 'Maison Éclat', accentColor: '#B45309' } },
];

// ─── Section separator ─────────────────────────────────────────────────────────

const SectionDivider = ({ title, subtitle, color }: { title: string; subtitle?: string; color: string }) => (
  <div className="py-12 sm:py-16 px-4">
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px w-16 bg-border" />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <div className="h-px w-16 bg-border" />
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{subtitle}</p>
      )}
    </div>
  </div>
);

// ─── Auth mock handlers ────────────────────────────────────────────────────────

const mockSignIn = async () => ({ error: { message: 'Demo mode - connexion désactivée' } });
const mockSignUp = async () => ({ error: { message: 'Demo mode - inscription désactivée' } });

// ─── Main Demo Page ────────────────────────────────────────────────────────────

const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">Démo — Variantes de blocs</h1>
          <nav className="hidden sm:flex gap-4 text-sm">
            <a href="#homepage-moderne" className="text-muted-foreground hover:text-foreground transition-colors">Moderne</a>
            <a href="#homepage-pro" className="text-muted-foreground hover:text-foreground transition-colors">Pro</a>
            <a href="#homepage-elegant" className="text-muted-foreground hover:text-foreground transition-colors">Élégant</a>
            <a href="#auth" className="text-muted-foreground hover:text-foreground transition-colors">Auth</a>
            <a href="#booking" className="text-muted-foreground hover:text-foreground transition-colors">Booking</a>
          </nav>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOMEPAGE CONFIG 1 — Moderne / Dynamique
          ═══════════════════════════════════════════════════════════════════════ */}
      <div id="homepage-moderne">
        <SectionDivider
          title="Homepage — Moderne"
          subtitle="centered-badge · cards-grid · cards-hover · grid-cards · cards-icons · banner-gradient"
          color="#8B5CF6"
        />
        <div className="bg-gradient-to-br from-background via-purple-500/5 to-background">
          {HOMEPAGE_MODERNE.map((block, i) => (
            <HomepageBlockRenderer key={`moderne-${i}`} block={block} index={i} />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOMEPAGE CONFIG 2 — Professionnel / Sobre
          ═══════════════════════════════════════════════════════════════════════ */}
      <div id="homepage-pro">
        <SectionDivider
          title="Homepage — Professionnel"
          subtitle="split-image · list-vertical · list-compact · list-simple · list-inline · inline-bordered"
          color="#0891B2"
        />
        <div className="bg-gradient-to-br from-background via-cyan-500/5 to-background">
          {HOMEPAGE_PRO.map((block, i) => (
            <HomepageBlockRenderer key={`pro-${i}`} block={block} index={i} />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOMEPAGE CONFIG 3 — Élégant / Premium
          ═══════════════════════════════════════════════════════════════════════ */}
      <div id="homepage-elegant">
        <SectionDivider
          title="Homepage — Élégant"
          subtitle="centered-decorated · circles-centered · cards-bordered · list-dotted · circles-row · box-decorated"
          color="#B45309"
        />
        <div className="bg-gradient-to-br from-background via-amber-500/5 to-background">
          {HOMEPAGE_ELEGANT.map((block, i) => (
            <HomepageBlockRenderer key={`elegant-${i}`} block={block} index={i} />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          AUTH — 3 variantes
          ═══════════════════════════════════════════════════════════════════════ */}
      <div id="auth">
        <SectionDivider
          title="Auth — 3 variantes"
          subtitle="centered-card · split-image · minimal"
          color="#8B5CF6"
        />

        {/* Auth: centered-card */}
        <div className="mb-12">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">Variante : centered-card</p>
          <AuthCenteredCard
            brandName="Studio Zen"
            accentColor="#8B5CF6"
            tagline="Réservez votre moment de détente"
            onSignIn={mockSignIn}
            onSignUp={mockSignUp}
          />
        </div>

        {/* Auth: split-image */}
        <div className="mb-12">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">Variante : split-image</p>
          <AuthSplitImage
            brandName="Dr. Martin"
            accentColor="#0891B2"
            tagline="Votre santé, notre priorité"
            onSignIn={mockSignIn}
            onSignUp={mockSignUp}
          />
        </div>

        {/* Auth: minimal */}
        <div className="mb-12">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">Variante : minimal</p>
          <AuthMinimal
            brandName="Maison Éclat"
            accentColor="#B45309"
            tagline="Bienvenue"
            onSignIn={mockSignIn}
            onSignUp={mockSignUp}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOOKING — Variantes des 3 blocs
          ═══════════════════════════════════════════════════════════════════════ */}
      <div id="booking">
        <SectionDivider
          title="Booking — Toutes les variantes"
          subtitle="ServiceSelector · TimePicker · BookingList"
          color="#8B5CF6"
        />

        <div className="max-w-5xl mx-auto px-4 space-y-16 pb-20">

          {/* ── ServiceSelector ─────────────────────────── */}
          <div>
            <h3 className="text-xl font-bold mb-2">ServiceSelector</h3>
            <p className="text-sm text-muted-foreground mb-8">3 variantes pour la sélection de service</p>

            <div className="space-y-10">
              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">cards-grid</p>
                <ServiceSelectorCardsGrid
                  services={SERVICES}
                  selectedServiceId="1"
                  accentColor="#8B5CF6"
                  onServiceSelect={() => {}}
                />
              </div>

              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">list-compact</p>
                <ServiceSelectorListCompact
                  services={SERVICES}
                  selectedServiceId="2"
                  accentColor="#0891B2"
                  onServiceSelect={() => {}}
                />
              </div>

              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">pills-horizontal</p>
                <ServiceSelectorPillsHorizontal
                  services={SERVICES}
                  selectedServiceId="3"
                  accentColor="#B45309"
                  onServiceSelect={() => {}}
                />
              </div>
            </div>
          </div>

          {/* ── TimePicker ──────────────────────────────── */}
          <div>
            <h3 className="text-xl font-bold mb-2">TimePicker</h3>
            <p className="text-sm text-muted-foreground mb-8">2 variantes pour la sélection de créneau</p>

            <div className="space-y-10">
              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">week-grid</p>
                <TimePickerWeekGrid
                  bookings={[]}
                  openingHours={OPENING_HOURS}
                  serviceDuration={60}
                  granularity={30}
                  accentColor="#8B5CF6"
                  onTimeSelect={() => {}}
                />
              </div>

              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">calendar-sidebar</p>
                <TimePickerCalendarSidebar
                  bookings={[]}
                  openingHours={OPENING_HOURS}
                  serviceDuration={60}
                  granularity={30}
                  accentColor="#0891B2"
                  onTimeSelect={() => {}}
                />
              </div>
            </div>
          </div>

          {/* ── BookingList ─────────────────────────────── */}
          <div>
            <h3 className="text-xl font-bold mb-2">BookingList</h3>
            <p className="text-sm text-muted-foreground mb-8">3 variantes pour la liste des réservations</p>

            <div className="space-y-10">
              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">cards-stack</p>
                <BookingListCardsStack
                  bookings={MOCK_BOOKINGS_DATA}
                  services={SERVICES}
                  accentColor="#8B5CF6"
                  onCancel={() => {}}
                />
              </div>

              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">timeline-vertical</p>
                <BookingListTimelineVertical
                  bookings={MOCK_BOOKINGS_DATA}
                  services={SERVICES}
                  accentColor="#0891B2"
                  onCancel={() => {}}
                />
              </div>

              <div className="border rounded-xl p-6">
                <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">table-compact</p>
                <BookingListTableCompact
                  bookings={MOCK_BOOKINGS_DATA}
                  services={SERVICES}
                  accentColor="#B45309"
                  onCancel={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
