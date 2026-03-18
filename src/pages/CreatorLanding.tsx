import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Zap, Paintbrush, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PRE_PROMPT_KEY = 'pre_creator_prompt';

const features = [
  {
    icon: Zap,
    title: 'Généré en 2 minutes',
    description: 'Décrivez votre activité, notre IA s\'occupe du reste.',
  },
  {
    icon: Paintbrush,
    title: '100% personnalisable',
    description: 'Couleurs, services, horaires — tout s\'adapte à votre image.',
  },
  {
    icon: Globe,
    title: 'Déployé instantanément',
    description: 'Votre site en ligne en un clic, sans configuration technique.',
  },
];

const CreatorLanding = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');

  const handleSubmitPrompt = () => {
    if (!prompt.trim()) {
      toast.error('Décrivez brièvement votre besoin avant de continuer');
      return;
    }
    localStorage.setItem(PRE_PROMPT_KEY, prompt.trim());
    toast.success('Message enregistré, connectez-vous pour continuer');
    navigate('/auth?redirect=creator');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 pt-24 pb-20 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Propulsé par l'IA
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Votre site de réservation,{' '}
            <span className="text-primary">prêt en 2 minutes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Décrivez votre activité. Promptly génère un site professionnel,
            personnalisé et déployé — sans écrire une seule ligne de code.
          </p>

          {/* Input CTA */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ex : "Salon de coiffure à Paris, ouvert du mardi au samedi"'
              className="h-12 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitPrompt();
                }
              }}
            />
            <Button size="lg" className="h-12 px-6 shrink-0" onClick={handleSubmitPrompt}>
              Créer mon site
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Déjà un compte ?{' '}
            <button
              className="text-primary hover:underline font-semibold"
              onClick={() => navigate('/auth')}
            >
              Se connecter
            </button>
            {' '}·{' '}
            <button
              className="text-primary hover:underline font-semibold"
              onClick={() => navigate('/dashboard')}
            >
              Mes projets
            </button>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default CreatorLanding;
