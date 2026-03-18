import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Eye, Edit, Trash2, ExternalLink, Loader2, Sparkles, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Project {
  id: string;
  site_name: string;
  slug: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'suspended';
  deployment_url: string | null;
  created_at: string;
  updated_at: string;
  accentColor?: string;
  logoUrl?: string;
}

const STATUS_CONFIG = {
  pending:   { label: 'Brouillon',      class: 'bg-muted text-muted-foreground' },
  deploying: { label: 'Déploiement…',   class: 'bg-primary/10 text-primary' },
  deployed:  { label: 'En ligne',        class: 'bg-green-100 text-green-700' },
  failed:    { label: 'Échec',           class: 'bg-red-100 text-red-700' },
  suspended: { label: 'Suspendu',        class: 'bg-orange-100 text-orange-700' },
};

const formatRelativeDate = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 30) return `Il y a ${days} jours`;
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ProjectsDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadProjects();
  }, [user, navigate]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Extraire accentColor + logoUrl depuis config_url
      const enriched = (data || []).map((p: any) => {
        let accentColor: string | undefined;
        let logoUrl: string | undefined;
        try {
          const config = JSON.parse(p.config_url);
          accentColor = config?.theme?.primaryColor || config?.accentColor;
          // Les blocs sont stockés dans _pageBlocks.homepage (structure de sauvegarde useSiteCreator)
          logoUrl = config?._pageBlocks?.homepage?.find((b: any) => b.type === 'Header')?.props?.logoUrl;
        } catch {}
        return { ...p, accentColor, logoUrl };
      });

      setProjects(enriched);
    } catch {
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    try {
      const { error } = await (supabase as any).from('clients').delete().eq('id', deleteProject.id);
      if (error) throw error;
      toast.success('Projet supprimé');
      setProjects(projects.filter(p => p.id !== deleteProject.id));
      // Effacer la session si elle correspond au projet supprimé
      try {
        const raw = localStorage.getItem('creator-session');
        if (raw) {
          const s = JSON.parse(raw);
          if (s.currentProjectId === deleteProject.id) localStorage.removeItem('creator-session');
        }
      } catch {}
      setDeleteProject(null);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Mes Projets</p>
              <p className="text-xs text-muted-foreground">{profile?.email || user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">

        {/* Titre */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            {projects.length === 0 ? 'Aucun projet' : `${projects.length} projet${projects.length > 1 ? 's' : ''}`}
          </h2>
          <p className="text-muted-foreground mt-1">
            {projects.length === 0
              ? 'Créez votre premier site de réservation en quelques minutes'
              : 'Gérez et éditez vos sites de réservation'}
          </p>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Prêt à créer votre site ?</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Décrivez votre activité à l'IA et votre site de réservation est généré en quelques secondes.
            </p>
            <Button onClick={() => navigate('/creator?new=1')} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Créer mon premier projet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const status = STATUS_CONFIG[project.status];
              const accent = project.accentColor || '#8B5CF6';

              return (
                <div
                  key={project.id}
                  className="group relative bg-card rounded-2xl border hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Bande couleur accent en haut */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Logo + nom + status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {project.logoUrl ? (
                          <img
                            src={project.logoUrl}
                            alt={project.site_name}
                            className="w-8 h-8 rounded-lg object-contain shrink-0 bg-muted/30"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: accent }}
                          >
                            {project.site_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <h3 className="font-semibold text-base leading-tight truncate">{project.site_name}</h3>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Slug */}
                    <p className="text-xs text-muted-foreground mb-4 font-mono">{project.slug}</p>

                    {/* URL si déployé */}
                    {project.deployment_url && (
                      <a
                        href={project.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline mb-4"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Voir le site en ligne
                      </a>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Date */}
                    <p className="text-xs text-muted-foreground mb-4">
                      Modifié {formatRelativeDate(project.updated_at)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-1.5"
                        style={{ backgroundColor: accent }}
                        onClick={() => navigate(`/creator?projectId=${project.id}`)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Éditer
                      </Button>
                      {project.deployment_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5"
                          onClick={() => window.open(project.deployment_url!, '_blank')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Voir
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteProject(project)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card "Nouveau projet" dans la grille */}
            <button
              onClick={() => navigate('/creator?new=1')}
              className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground hover:text-primary min-h-[200px]"
            >
              <div className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Nouveau projet</span>
            </button>
          </div>
        )}
      </div>

      {/* Dialog suppression */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteProject?.site_name}" sera définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
