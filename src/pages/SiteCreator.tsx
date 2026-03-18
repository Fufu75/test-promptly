import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Save, Sparkles, CheckCircle2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { INITIAL_QUESTIONNAIRE } from '@/types/questionnaire';
import PreviewModal from '@/components/PreviewModal';
import { DeploymentManager } from '@/components/DeploymentManager';
import ChatPanel from '@/components/creator/ChatPanel';
import ConfigPanel, { type ImageSlot } from '@/components/creator/ConfigPanel';
import { useSiteCreator } from '@/hooks/useSiteCreator';

const SiteCreator = () => {
  const navigate = useNavigate();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const {
    user,
    questionnaireCompleted,
    handleQuestionnaireComplete,
    handleSkipQuestionnaire,
    currentProjectId,
    projectName,
    setProjectName,
    isSaving,
    isDirty,
    lastSaved,
    handleSaveProject,
    generatedConfig,
    homepageBlocks,
    authBlock,
    bookingBlocks,
    chatMessages,
    chatInput,
    setChatInput,
    aiState,
    handleSendMessage,
    handleClearChat,
    updateConfigField,
    updateServiceField,
    addService,
    removeService,
    handleUploadImage,
    handleRemoveImage,
    isPreviewOpen,
    setIsPreviewOpen,
    handlePreviewSite,
    handleGenerateSite,
  } = useSiteCreator();

  const heroVariant = homepageBlocks.find((b) => b.type === 'Hero')?.variant;

  // Slots image dynamiques — calqués sur l'usage réel dans chaque composant
  const imageSlots: ImageSlot[] = [
    {
      blockType: 'Header',
      propName: 'logoUrl',
      label: 'Logo de la marque',
      context: 'Affiché dans la barre de navigation et sur la page de connexion',
      aspectRatio: 'square',
      hint: 'PNG avec fond transparent recommandé · 512×512 px',
      accept: 'image/png,image/jpeg,image/webp',
      page: 'homepage',
      currentUrl: homepageBlocks.find((b) => b.type === 'Header')?.props?.logoUrl as string | undefined,
    },
    // backgroundImage : uniquement pour les variants Hero qui l'utilisent (centered-badge, centered-decorated)
    ...(heroVariant !== 'split-image' ? [{
      blockType: 'Hero',
      propName: 'backgroundImage',
      label: 'Image de fond',
      context: 'Derrière le texte principal, avec un overlay coloré par-dessus',
      aspectRatio: 'video' as const,
      hint: 'JPG ou WebP · 1920×1080 px recommandé',
      accept: 'image/jpeg,image/webp,image/png',
      page: 'homepage' as const,
      currentUrl: homepageBlocks.find((b) => b.type === 'Hero')?.props?.backgroundImage as string | undefined,
    }] : []),
    // sideImage : uniquement pour Hero split-image
    ...(heroVariant === 'split-image' ? [{
      blockType: 'Hero',
      propName: 'sideImage',
      label: 'Image latérale',
      context: 'Photo à côté du texte principal (colonne droite)',
      aspectRatio: 'square' as const,
      hint: 'JPG ou WebP · format carré idéal',
      accept: 'image/jpeg,image/webp,image/png',
      page: 'homepage' as const,
      currentUrl: homepageBlocks.find((b) => b.type === 'Hero')?.props?.sideImage as string | undefined,
    }] : []),
    // backgroundImage auth : uniquement pour le variant split-image
    ...(authBlock?.variant === 'split-image' ? [{
      blockType: 'Auth',
      propName: 'backgroundImage',
      label: 'Image de fond',
      context: 'Panneau décoratif côté droit de la page connexion',
      aspectRatio: 'video' as const,
      hint: 'JPG ou WebP · format portrait ou paysage',
      accept: 'image/jpeg,image/webp,image/png',
      page: 'auth' as const,
      currentUrl: authBlock?.props?.backgroundImage as string | undefined,
    }] : []),
  ];

  // ── Questionnaire ────────────────────────────────────────────────────────

  if (!questionnaireCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <QuestionnaireForm
          questions={INITIAL_QUESTIONNAIRE}
          onComplete={handleQuestionnaireComplete}
          onSkip={handleSkipQuestionnaire}
        />
      </div>
    );
  }

  // ── Créateur ─────────────────────────────────────────────────────────────

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 pt-6 flex-1 flex flex-col min-h-0">

        {/* Header */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isDirty ? setShowLeaveDialog(true) : navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Mes Projets
              </Button>
              {user && (
                <span className="text-sm text-muted-foreground">{user.email}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
                </span>
              )}
              <Input
                placeholder="Nom du projet"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-48"
              />
              <Button
                onClick={handleSaveProject}
                disabled={isSaving || !projectName.trim()}
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />{currentProjectId ? 'Sauvegarder' : 'Créer et Sauvegarder'}</>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {currentProjectId ? `Édition : ${projectName}` : 'Nouveau Projet'}
              </h1>
              <p className="text-muted-foreground">
                Affinez votre configuration avec l'IA
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              OpenAI connectée
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="creator" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mb-3 shrink-0">
            <TabsTrigger value="creator">Créateur</TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Déploiement
              {currentProjectId && (
                <span className="ml-1 w-2 h-2 rounded-full bg-primary inline-block" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Onglet Créateur */}
          <TabsContent value="creator" className="flex-1 min-h-0 mt-0">
            <div className="flex gap-6 h-full">
              <div className="flex-[2] min-w-0 h-full">
                <ChatPanel
                  chatMessages={chatMessages}
                  chatInput={chatInput}
                  aiState={aiState}
                  onInputChange={setChatInput}
                  onSendMessage={handleSendMessage}
                  onClearChat={handleClearChat}
                />
              </div>
              <div className="flex-1 min-w-0 h-full overflow-y-auto pb-6">
                <ConfigPanel
                  generatedConfig={generatedConfig}
                  aiState={aiState}
                  imageSlots={imageSlots}
                  onUpdateField={updateConfigField}
                  onUpdateServiceField={updateServiceField}
                  onAddService={addService}
                  onRemoveService={removeService}
                  onUploadImage={handleUploadImage}
                  onRemoveImage={handleRemoveImage}
                  onPreview={handlePreviewSite}
                  onExport={handleGenerateSite}
                />
              </div>
            </div>
          </TabsContent>

          {/* Onglet Déploiement */}
          <TabsContent value="deploy">
            <div className="max-w-2xl mx-auto pt-4">
              {!currentProjectId && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Sauvegardez d'abord votre projet avant de déployer.
                </div>
              )}
              <DeploymentManager
                config={generatedConfig}
                siteName={projectName}
                existingClientId={currentProjectId}
                homepageBlocks={homepageBlocks}
                authBlock={authBlock}
                bookingBlocks={bookingBlocks}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog quitter sans sauvegarder */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifications non sauvegardées</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des modifications non sauvegardées. Voulez-vous sauvegarder avant de quitter ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate('/dashboard')}>
              Quitter sans sauvegarder
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleSaveProject();
                navigate('/dashboard');
              }}
              disabled={isSaving || !projectName.trim()}
            >
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde...</> : 'Sauvegarder et quitter'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal d'aperçu */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        config={generatedConfig}
        homepageBlocks={homepageBlocks}
        authBlock={authBlock}
        bookingBlocks={bookingBlocks}
      />
    </div>
  );
};

export default SiteCreator;
