import type { Config } from '@/hooks/useConfig';

export type GeneratedSiteConfig = Config & {
  conversationHistory: ChatMessage[];
  generatedAt: string;
  templateVersion: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  configChanges?: Partial<Config>; // Changements de config suggérés par l'IA
};

export type AIGenerationState = {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
};
