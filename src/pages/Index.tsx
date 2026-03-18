import { useNavigate } from 'react-router-dom';
import { useConfig } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, Shield, MapPin, Phone, Mail } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const config = useConfig();

  // Traduire les jours de la semaine
  const dayTranslations: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  const heroTitle =
    (config as any).hero?.title ||
    config.texts.homepage.heroTitle ||
    config.brandName ||
    'Réservation Simple et Efficace';
  const heroDescription =
    (config as any).hero?.description ||
    config.texts.homepage.heroDescription ||
    'Gérez vos rendez-vous facilement avec notre système de réservation.';
  const heroAccent =
    (config as any).hero?.accentColor ||
    config.theme?.primaryColor ||
    '#0EA5E9';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header minimaliste */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold">{config.brandName}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{config.businessSector}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-20">
        {/* Hero Section with banner */}
        <div
          className="max-w-5xl mx-auto text-center space-y-6 mb-16 sm:mb-20 rounded-3xl p-8 sm:p-12 shadow-sm border"
          style={{ background: `linear-gradient(135deg, ${heroAccent}33, ${heroAccent}11)` }}
        >
          <div className="inline-flex px-4 py-2 rounded-full bg-white/60 backdrop-blur text-sm font-semibold border">
            {config.brandName || 'Votre marque'}
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {heroTitle}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {heroDescription}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button size="lg" onClick={() => navigate('/auth')}>
              {config.texts.homepage.ctaBookNow}
            </Button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
            >
              Déjà client ? Se connecter
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                {config.texts.homepage.feature1Title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {config.texts.homepage.feature1Description}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                {config.texts.homepage.feature2Title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {config.texts.homepage.feature2Description}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                {config.texts.homepage.feature3Title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {config.texts.homepage.feature3Description}
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        {config.services.filter(s => s.enabled).length > 0 && (
          <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">Nos services</h3>
              <p className="text-muted-foreground">Découvrez nos prestations</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.services.filter(s => s.enabled).map((service) => (
                <div
                  key={service.id}
                  className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{service.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm font-medium">{service.duration} min</span>
                    <span className="text-lg font-bold text-primary">{service.price}€</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Horaires */}
        <div className="max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">Horaires d'ouverture</h3>
            <p className="text-muted-foreground">Nos horaires pour vous accueillir</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6 sm:p-8">
            <div className="space-y-3">
              {Object.entries(config.openingHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="font-medium capitalize">{dayTranslations[day] || day}</span>
                  <span className={hours === 'Closed' ? 'text-muted-foreground' : 'text-primary font-medium'}>
                    {hours === 'Closed' ? 'Fermé' : hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">Nous contacter</h3>
            <p className="text-muted-foreground">Une question ? Contactez-nous</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {config.contact.email && (
              <div className="p-6 rounded-xl bg-card border border-border/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <a
                    href={`mailto:${config.contact.email}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {config.contact.email}
                  </a>
                </div>
              </div>
            )}
            {config.contact.phone && (
              <div className="p-6 rounded-xl bg-card border border-border/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Téléphone</p>
                  <a
                    href={`tel:${config.contact.phone}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {config.contact.phone}
                  </a>
                </div>
              </div>
            )}
            {config.contact.address && (
              <div className="p-6 rounded-xl bg-card border border-border/50 flex items-start gap-4 sm:col-span-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Adresse</p>
                  <p className="text-sm text-muted-foreground">{config.contact.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-3xl mx-auto mt-16 sm:mt-20 text-center">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Prêt à réserver ?</h3>
            <p className="text-muted-foreground mb-6">
              Réservez votre créneau en quelques clics
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Prendre rendez-vous
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 sm:mt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {config.brandName}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
