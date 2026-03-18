import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageRenderer } from '@/components/PageRenderer';
import type { PageBlock } from '@/components/PageRenderer';
import type { Config } from '@/hooks/useConfig';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Config;
  homepageBlocks: PageBlock[];
  authBlock: { variant: string; props: Record<string, any> };
  bookingBlocks: PageBlock[];
}

const PreviewModal = ({ isOpen, onClose, config, homepageBlocks, authBlock, bookingBlocks }: PreviewModalProps) => {
  if (!isOpen) return null;

  // Config globale passée aux blocs pour override brandName, couleur, services, etc.
  const globalOverride = {
    brandName: config.brandName,
    businessSector: config.businessSector,
    accentColor: config.theme?.primaryColor,
    services: config.services?.filter((s: any) => s.enabled),
    openingHours: config.openingHours as Record<string, string>,
    contact: config.contact,
  };

  // auth-config est un bloc unique (pas un tableau)
  const authBlocks = [{ type: 'Auth', variant: authBlock.variant, props: authBlock.props }];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold">Aperçu en direct</span>
          <span className="text-sm text-muted-foreground">
            {config.brandName || 'Sans nom'}
          </span>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X className="h-4 w-4 mr-2" />
          Fermer
        </Button>
      </div>

      {/* Tabs 3 pages */}
      <Tabs defaultValue="homepage" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 self-start shrink-0">
          <TabsTrigger value="homepage">Accueil</TabsTrigger>
          <TabsTrigger value="auth">Connexion</TabsTrigger>
          <TabsTrigger value="booking">Réservation</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="flex-1 overflow-auto mt-3 border-none">
          <PageRenderer blocks={homepageBlocks} config={globalOverride} />
        </TabsContent>

        <TabsContent value="auth" className="flex-1 overflow-auto mt-3 border-none">
          <PageRenderer blocks={authBlocks} config={globalOverride} />
        </TabsContent>

        <TabsContent value="booking" className="flex-1 overflow-auto mt-3 border-none">
          <div className="container mx-auto px-4 py-8 space-y-12">
            <PageRenderer blocks={bookingBlocks} config={globalOverride} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PreviewModal;
