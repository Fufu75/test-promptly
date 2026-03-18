import { Button } from '@/components/ui/button';
import { LogOut, LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onSignOut?: () => void;
  showSignOut?: boolean;
}

/**
 * PageHeader - Header réutilisable pour toutes les pages
 * Affiche le titre, sous-titre optionnel, icône et bouton de déconnexion
 */
export const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  onSignOut,
  showSignOut = true,
}: PageHeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {Icon && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>
        {showSignOut && onSignOut && (
          <Button variant="outline" size="sm" className="flex-shrink-0" onClick={onSignOut}>
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </Button>
        )}
      </div>
    </header>
  );
};
