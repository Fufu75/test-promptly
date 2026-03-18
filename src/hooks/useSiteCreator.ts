import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { downloadSiteZip, generateSiteZipBackend } from '@/services/siteGenerator';
import type { GeneratedSiteConfig, ChatMessage, AIGenerationState } from '@/types/siteConfig';
import type { QuestionnaireAnswer, ServiceAnswer } from '@/types/questionnaire';
import configTemplate from '@/config/config.json';
import homepageConfigDefault from '@/config/pages/homepage-config.json';
import authConfigDefault from '@/config/pages/auth-config.json';
import bookingConfigDefault from '@/config/pages/booking-config.json';
import type { PageBlock } from '@/components/PageRenderer';
import { INITIAL_QUESTIONNAIRE } from '@/types/questionnaire';
import { generateInitialConfigs, updateConfigsFromChat, type AIGeneratedConfigs } from '@/services/ai/openaiService';
import { uploadSiteImage, deleteSiteImage } from '@/services/imageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PRE_PROMPT_KEY = 'pre_creator_prompt';
const SESSION_KEY = 'creator-session';

// ─── Session storage ───────────────────────────────────────────────────────────

interface CreatorSession {
  generatedConfig: GeneratedSiteConfig;
  homepageBlocks: PageBlock[];
  authBlock: { variant: string; props: Record<string, any> };
  bookingBlocks: PageBlock[];
  businessContext: string;
  projectName: string;
  currentProjectId: string | null;
  questionnaireCompleted: boolean;
  // chatMessages intentionnellement absent : le chat est éphémère, jamais persisté
}

const saveSession = (session: CreatorSession) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
};

const normalizeServices = (config: GeneratedSiteConfig): GeneratedSiteConfig => ({
  ...config,
  services: (config.services || []).map((s: any) => ({ ...s, enabled: s.enabled !== false })),
});

const loadSession = (): CreatorSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as CreatorSession;
    // Normalise les services au chargement pour éviter qu'ils soient filtrés comme désactivés
    session.generatedConfig = normalizeServices(session.generatedConfig);
    return session;
  } catch {
    return null;
  }
};

const clearSession = () => localStorage.removeItem(SESSION_KEY);

const EMPTY_CONFIG: GeneratedSiteConfig = {
  ...(configTemplate as unknown as GeneratedSiteConfig),
  brandName: '',
  businessSector: '',
  contact: { ...configTemplate.contact, email: '', phone: '', address: '' },
  services: [],
  openingHours: {
    monday: 'Closed', tuesday: 'Closed', wednesday: 'Closed',
    thursday: 'Closed', friday: 'Closed', saturday: 'Closed', sunday: 'Closed',
  },
  conversationHistory: [],
  generatedAt: new Date().toISOString(),
  templateVersion: '1.0.0',
};

// ─── Message de bienvenue contextuel ─────────────────────────────────────────

const buildWelcomeMessage = (config: GeneratedSiteConfig): string => {
  const name = config.brandName || 'votre projet';
  const sector = config.businessSector ? ` dans le secteur **${config.businessSector}**` : '';
  const services = (config.services || []).filter((s: any) => s.enabled !== false);

  let msg = `Bonjour ! Voici votre projet **${name}**${sector}.\n\n`;

  if (services.length) {
    msg += `**Services configurés :**\n`;
    services.forEach((s: any) => {
      msg += `- **${s.name}** — ${s.duration} min · ${s.price}€\n`;
    });
    msg += '\n';
  }

  msg += `Dites-moi ce que vous souhaitez modifier : couleurs, textes, composants, services... Je m'en occupe.`;

  return msg;
};

// ─── Sérialisation des réponses du questionnaire ──────────────────────────────
// Produit une description textuelle lisible par l'IA

const buildBusinessDescription = (answers: Record<string, QuestionnaireAnswer>): string => {
  return Object.entries(answers)
    .map(([key, answer]) => {
      const question = INITIAL_QUESTIONNAIRE.find((q) => q.id === key);
      const label = question?.label || key;

      let valueStr: string;
      if (Array.isArray(answer.value)) {
        if (answer.value.length > 0 && typeof answer.value[0] === 'object') {
          // Services : tableau d'objets { name, duration, price }
          valueStr = (answer.value as ServiceAnswer[])
            .filter((s) => s.name?.trim())
            .map((s) => `${s.name} (${s.duration} min, ${s.price}€)`)
            .join(' | ');
        } else {
          valueStr = (answer.value as string[]).join(', ');
        }
      } else {
        valueStr = String(answer.value);
      }

      return `${label} : ${valueStr}`;
    })
    .join('\n');
};

// ─── Hook principal ───────────────────────────────────────────────────────────

export const useSiteCreator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const projectId = searchParams.get('projectId');
  const isNew = searchParams.get('new') === '1';

  // Nouveau projet : effacer la session existante pour partir vierge
  if (isNew) clearSession();

  // Restaurer depuis sessionStorage si disponible (pas de projectId ni ?new=1 en URL)
  const session = !projectId && !isNew ? loadSession() : null;

  // Questionnaire
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(
    session?.questionnaireCompleted ?? false
  );
  const [businessContext, setBusinessContext] = useState(session?.businessContext ?? '');

  // Projet Supabase
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    session?.currentProjectId ?? projectId
  );
  const [projectName, setProjectName] = useState(session?.projectName ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Configs IA (flat config + page blocks)
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedSiteConfig>(
    session?.generatedConfig ?? EMPTY_CONFIG
  );
  const configRef = useRef<GeneratedSiteConfig>(session?.generatedConfig ?? EMPTY_CONFIG);
  const [homepageBlocks, setHomepageBlocks] = useState<PageBlock[]>(
    session?.homepageBlocks ?? (homepageConfigDefault.pageBlocks as PageBlock[])
  );
  const [authBlock, setAuthBlock] = useState<{ variant: string; props: Record<string, any> }>(
    session?.authBlock ?? { variant: authConfigDefault.variant, props: authConfigDefault.props }
  );
  const [bookingBlocks, setBookingBlocks] = useState<PageBlock[]>(
    session?.bookingBlocks ?? (bookingConfigDefault.pageBlocks as PageBlock[])
  );

  // Chat — toujours vide à l'ouverture, jamais persisté
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiState, setAiState] = useState<AIGenerationState>({
    isGenerating: false, progress: 0, currentStep: '',
  });
  const projectLoadedRef = useRef(false);

  // Preview
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Changements non sauvegardés
  const [isDirty, setIsDirty] = useState(false);

  // ── Helpers session ────────────────────────────────────────────────────────

  const persistSession = (overrides?: Partial<CreatorSession>) => {
    saveSession({
      generatedConfig: configRef.current,
      homepageBlocks,
      authBlock,
      bookingBlocks,
      businessContext,
      projectName,
      currentProjectId,
      questionnaireCompleted,
      ...overrides,
    });
  };

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => { configRef.current = generatedConfig; }, [generatedConfig]);


  useEffect(() => {
    const stored = localStorage.getItem(PRE_PROMPT_KEY);
    if (stored?.trim()) {
      setChatInput(stored);
      localStorage.removeItem(PRE_PROMPT_KEY);
      toast.info("Prompt pré-rempli depuis la page d'accueil.");
    }
  }, []);

  useEffect(() => {
    if (projectId && user && !projectLoadedRef.current) {
      projectLoadedRef.current = true;
      loadExistingProject(projectId);
    }
  }, [projectId, user]);

  // ── Projet : chargement ────────────────────────────────────────────────────

  const loadExistingProject = async (id: string) => {
    clearSession();
    try {
      const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const raw = JSON.parse((data as any).config_url) as GeneratedSiteConfig & {
          _pageBlocks?: {
            homepage: PageBlock[];
            auth: { variant: string; props: Record<string, any> };
            booking: PageBlock[];
          };
          _chatState?: {
            businessContext: string;
            messages: Array<{ role: 'user' | 'agent'; content: string }>;
          };
        };

        const { _pageBlocks, _chatState, ...loadedConfig } = raw;

        const normalizedLoadedConfig = normalizeServices({
          ...loadedConfig,
          conversationHistory: loadedConfig.conversationHistory || [],
          generatedAt: loadedConfig.generatedAt || (data as any).created_at,
          templateVersion: loadedConfig.templateVersion || '1.0.0',
        });
        setGeneratedConfig(normalizedLoadedConfig);
        configRef.current = normalizedLoadedConfig;

        if (_pageBlocks) {
          setHomepageBlocks(_pageBlocks.homepage);
          setAuthBlock(_pageBlocks.auth);
          setBookingBlocks(_pageBlocks.booking);
        }

        if (_chatState?.businessContext) {
          setBusinessContext(_chatState.businessContext);
        }

        // Message de bienvenue contextuel au chargement du projet
        setChatMessages([{
          id: 'welcome-loaded',
          role: 'agent',
          content: buildWelcomeMessage(normalizedLoadedConfig),
          timestamp: new Date().toISOString(),
        }]);

        setProjectName((data as any).site_name);
        setCurrentProjectId(id);
        setQuestionnaireCompleted(true);
        toast.success(`Projet "${(data as any).site_name}" chargé`);
      }
    } catch (error) {
      console.error('[Project] Erreur chargement :', error);
      toast.error('Erreur lors du chargement du projet');
    }
  };

  // ── Projet : sauvegarde ────────────────────────────────────────────────────

  const handleSaveProject = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder');
      navigate('/auth?redirect=creator');
      return;
    }
    if (!projectName.trim()) {
      toast.error('Veuillez donner un nom à votre projet');
      return;
    }

    const configToSave = {
      ...configRef.current,
      _pageBlocks: { homepage: homepageBlocks, auth: authBlock, booking: bookingBlocks },
      _chatState: { businessContext },
    };

    setIsSaving(true);
    try {
      if (currentProjectId) {
        const { error } = await supabase
          .from('clients' as any)
          .update({
            site_name: projectName,
            config_url: JSON.stringify(configToSave),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentProjectId);
        if (error) throw error;
        toast.success('Projet mis à jour');
      } else {
        const slug = projectName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const { data, error } = await supabase
          .from('clients' as any)
          .insert({
            user_id: user.id,
            site_name: projectName,
            slug,
            config_url: JSON.stringify(configToSave),
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCurrentProjectId((data as any).id);
          toast.success('Projet créé et sauvegardé');
        }
      }
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('[Project] Erreur sauvegarde :', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Questionnaire ──────────────────────────────────────────────────────────

  const handleQuestionnaireComplete = async (answers: Record<string, QuestionnaireAnswer>) => {
    setQuestionnaireCompleted(true);
    setAiState({ isGenerating: true, progress: 20, currentStep: 'Génération du site en cours...' });

    const description = buildBusinessDescription(answers);
    setBusinessContext(description);

    console.log('[AI] Réponses brutes :', answers);
    console.log('[AI] Description envoyée à OpenAI :\n', description);

    try {
      setAiState({ isGenerating: true, progress: 50, currentStep: "L'IA compose votre site..." });

      const result = await generateInitialConfigs(description);

      console.log('[AI] Résultat OpenAI (génération initiale) :', result);

      // Garantir que tous les services ont enabled: true (l'IA peut omettre ce champ)
      const normalizedServices = (result.globalConfig.services || []).map((s: any) => ({
        ...s,
        enabled: s.enabled !== false,
      }));
      const normalizedGlobalConfig = { ...result.globalConfig, services: normalizedServices };

      setGeneratedConfig((prev) => ({
        ...prev,
        ...normalizedGlobalConfig,
        // Mapper accentColor → theme.primaryColor pour que toute l'app utilise la bonne couleur
        theme: { ...prev.theme, primaryColor: normalizedGlobalConfig.accentColor },
        conversationHistory: [],
        generatedAt: new Date().toISOString(),
      }));
      configRef.current = {
        ...configRef.current,
        ...normalizedGlobalConfig,
        theme: { ...configRef.current.theme, primaryColor: normalizedGlobalConfig.accentColor },
      };
      setHomepageBlocks(result.homepageBlocks);
      setAuthBlock(result.authBlock);
      setBookingBlocks(result.bookingBlocks);
      setIsDirty(true);

      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'agent',
        content: buildWelcomeMessage({ ...configRef.current, ...normalizedGlobalConfig }),
        timestamp: new Date().toISOString(),
      };
      setChatMessages([welcomeMsg]);

      persistSession({
        generatedConfig: configRef.current,
        homepageBlocks: result.homepageBlocks,
        authBlock: result.authBlock,
        bookingBlocks: result.bookingBlocks,
        businessContext: description,
        questionnaireCompleted: true,
      });
    } catch (error) {
      console.error('[AI] Erreur génération initiale :', error);
      toast.error('Erreur lors de la génération. Vérifiez votre clé OpenAI.');
      setChatMessages([{
        id: 'welcome-error',
        role: 'agent',
        content: 'Une erreur est survenue. Vous pouvez quand même utiliser le chat pour décrire votre site.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setAiState({ isGenerating: false, progress: 0, currentStep: '' });
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  const handleSkipQuestionnaire = () => {
    setQuestionnaireCompleted(true);
    toast.info("Questionnaire passé. Utilisez le chat pour décrire votre site.");
  };

  // ── Chat ───────────────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!chatInput.trim() || aiState.isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setAiState({ isGenerating: true, progress: 0, currentStep: 'Analyse de vos besoins...' });

    try {
      setAiState({ isGenerating: true, progress: 40, currentStep: 'Modification en cours...' });

      const currentConfigs: AIGeneratedConfigs = {
        globalConfig: {
          brandName: configRef.current.brandName || '',
          businessSector: configRef.current.businessSector || '',
          accentColor: configRef.current.theme?.primaryColor || '#8B5CF6',
          services: configRef.current.services || [],
          openingHours: configRef.current.openingHours || {},
          contact: configRef.current.contact || { email: '', phone: '', address: '' },
        },
        homepageBlocks,
        authBlock,
        bookingBlocks,
      };

      // On envoie seulement les 6 derniers messages — la config actuelle dans le system prompt
      // suffit comme mémoire long terme, l'historique court sert uniquement à la continuité
      const conversationHistory = chatMessages.slice(-6).map((msg) => ({
        role: msg.role as 'user' | 'agent',
        content: msg.content,
      }));

      console.log('[AI] Message envoyé :', currentInput);
      console.log('[AI] Historique conversation :', conversationHistory.length, 'messages');

      const result = await updateConfigsFromChat(
        currentInput,
        currentConfigs,
        conversationHistory,
        businessContext
      );

      console.log('[AI] Réponse IA (chat) :', result);

      if (result._action === 'modify') {
        setIsDirty(true);
        if (result.globalConfig) {
          const g = result.globalConfig;
          setGeneratedConfig((prev) => {
            const updated = { ...prev };
            // Ne merger que les champs explicitement retournés par l'IA
            if (g.brandName)       updated.brandName = g.brandName;
            if (g.businessSector)  updated.businessSector = g.businessSector;
            if (g.accentColor)     updated.theme = { ...prev.theme, primaryColor: g.accentColor };
            if (g.openingHours)    updated.openingHours = g.openingHours;
            if (g.contact)         updated.contact = { ...prev.contact, ...g.contact };
            // Services : ne remplacer que si l'IA en retourne explicitement (liste non vide)
            if (g.services && g.services.length > 0) {
              updated.services = g.services.map((s: any) => ({ ...s, enabled: s.enabled !== false }));
            }
            configRef.current = updated;
            return updated;
          });
        }
        if (result.homepageBlocks) setHomepageBlocks(result.homepageBlocks);
        if (result.authBlock) setAuthBlock(result.authBlock);
        if (result.bookingBlocks) setBookingBlocks(result.bookingBlocks);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: result._message,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error('[AI] Erreur chat :', error);
      toast.error('Erreur lors de la génération IA.');
    } finally {
      setAiState({ isGenerating: false, progress: 0, currentStep: '' });
    }
  };

  // ── Édition inline de la config ────────────────────────────────────────────

  const updateConfigField = (field: string, value: string) => {
    if (!value.trim()) return;
    setIsDirty(true);
    const parts = field.split('.');
    setGeneratedConfig((prev) => {
      let updated: GeneratedSiteConfig;
      if (parts.length === 1) {
        updated = { ...prev, [parts[0]]: value };
      } else if (parts[0] === 'theme') {
        updated = { ...prev, theme: { ...prev.theme, [parts[1]]: value } };
      } else if (parts[0] === 'contact') {
        updated = { ...prev, contact: { ...prev.contact, [parts[1]]: value } };
      } else {
        updated = prev;
      }
      configRef.current = updated;
      return updated;
    });
  };

  // ── Services ───────────────────────────────────────────────────────────────

  const updateServiceField = (
    index: number,
    field: 'name' | 'duration' | 'price',
    value: string
  ) => {
    setIsDirty(true);
    setGeneratedConfig((prev) => {
      const nextServices = [...prev.services];
      const current = nextServices[index];
      if (!current) return prev;
      nextServices[index] = {
        ...current,
        [field]: field === 'duration' || field === 'price' ? Number(value) || 0 : value,
      };
      const updated = { ...prev, services: nextServices };
      configRef.current = updated;
      return updated;
    });
  };

  const addService = () => {
    setIsDirty(true);
    setGeneratedConfig((prev) => {
      const next = {
        ...prev,
        services: [
          ...prev.services,
          {
            id: `service-${prev.services.length + 1}`,
            name: '',
            description: '',
            duration: 30,
            price: 0,
            enabled: true,
          },
        ],
      };
      configRef.current = next;
      return next;
    });
  };

  const removeService = (index: number) => {
    setIsDirty(true);
    setGeneratedConfig((prev) => {
      if (prev.services.length <= 1) return prev;
      const updated = { ...prev, services: prev.services.filter((_, i) => i !== index) };
      configRef.current = updated;
      return updated;
    });
  };

  // ── Images ─────────────────────────────────────────────────────────────────

  const handleUploadImage = async (blockType: string, propName: string, file: File) => {
    if (!user) { toast.error('Connectez-vous pour uploader des images'); return; }
    try {
      const url = await uploadSiteImage(file, user.id, currentProjectId || 'unsaved');
      updateBlockProp(blockType, propName, url);
      toast.success('Image uploadée');
    } catch (err) {
      console.error('[Image] Erreur upload :', err);
      toast.error("Erreur lors de l'upload");
    }
  };

  const handleRemoveImage = async (blockType: string, propName: string) => {
    const currentUrl = blockType === 'Auth'
      ? authBlock?.props?.[propName] as string | undefined
      : homepageBlocks.find((b) => b.type === blockType)?.props?.[propName] as string | undefined;

    updateBlockProp(blockType, propName, '');

    if (currentUrl) {
      try {
        await deleteSiteImage(currentUrl);
      } catch (err) {
        console.error('[Image] Erreur suppression storage :', err);
      }
    }
  };

  const updateBlockProp = (blockType: string, propName: string, value: string) => {
    if (blockType === 'Auth') {
      setAuthBlock((prev) => {
        const next = { ...prev, props: { ...prev.props, [propName]: value } };
        persistSession({ authBlock: next });
        return next;
      });
    } else {
      setHomepageBlocks((prev) => {
        const next = prev.map((block) =>
          block.type === blockType
            ? { ...block, props: { ...block.props, [propName]: value } }
            : block
        );
        // Le logo est partagé entre Header et Auth — on synchronise les deux
        if (blockType === 'Header' && propName === 'logoUrl') {
          setAuthBlock((prevAuth) => {
            const nextAuth = { ...prevAuth, props: { ...prevAuth.props, logoUrl: value } };
            persistSession({ homepageBlocks: next, authBlock: nextAuth });
            return nextAuth;
          });
        } else {
          persistSession({ homepageBlocks: next });
        }
        return next;
      });
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handlePreviewSite = () => {
    setIsPreviewOpen(true);
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([JSON.stringify(configRef.current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration téléchargée !');
  };

  const handleGenerateSite = async () => {
    const siteName = (generatedConfig.brandName || 'site-reservation').trim();
    try {
      setAiState({ isGenerating: true, progress: 0, currentStep: 'Contact du serveur de génération...' });
      await generateSiteZipBackend(generatedConfig as any, siteName);
      toast.success('Site généré et téléchargé via le backend !');
    } catch {
      toast.warning('Backend indisponible, tentative en local...');
      try {
        await downloadSiteZip(generatedConfig, siteName);
        toast.success('Site généré en local.');
      } catch {
        toast.error('Échec de la génération du site.');
      }
    } finally {
      setAiState({ isGenerating: false, progress: 0, currentStep: '' });
    }
  };

  // ── Retour ─────────────────────────────────────────────────────────────────

  return {
    // Auth
    user,
    // Questionnaire
    questionnaireCompleted,
    handleQuestionnaireComplete,
    handleSkipQuestionnaire,
    // Projet
    currentProjectId,
    projectName,
    setProjectName,
    isSaving,
    isDirty,
    lastSaved,
    handleSaveProject,
    // Configs IA
    generatedConfig,
    homepageBlocks,
    authBlock,
    bookingBlocks,
    // Chat
    chatMessages,
    chatInput,
    setChatInput,
    aiState,
    handleSendMessage,
    handleClearChat,
    // Édition config
    updateConfigField,
    updateServiceField,
    addService,
    removeService,
    updateBlockProp,
    handleUploadImage,
    handleRemoveImage,
    // Preview & actions
    isPreviewOpen,
    setIsPreviewOpen,
    handlePreviewSite,
    handleDownloadConfig,
    handleGenerateSite,
  };
};
