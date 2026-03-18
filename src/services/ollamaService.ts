/**
 * Service pour communiquer avec Ollama API
 * Ollama doit être hébergé sur un serveur accessible (cloud ou local)
 */

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

// Configuration par défaut (peut être surchargée via .env)
const DEFAULT_CONFIG: OllamaConfig = {
  baseUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2',
};

/**
 * Appelle Ollama pour générer une réponse
 */
export async function callOllama(
  messages: OllamaMessage[],
  config: Partial<OllamaConfig> = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const response = await fetch(`${finalConfig.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: finalConfig.model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error calling Ollama:', error);
    throw error;
  }
}

/**
 * Génère un prompt système pour l'IA afin qu'elle génère le config.json
 */
export function createSystemPrompt(currentConfig: any): string {
  return `Tu es un assistant IA expert en génération de sites de réservation.

Contexte actuel (config JSON) :
${JSON.stringify(currentConfig, null, 2)}

Objectif : retourner UNIQUEMENT un objet JSON (sans texte, sans markdown, sans \`\`\`) de la forme :
{
  "changes": { ...modifications à appliquer... },
  "explanation": "Brève explication en français"
}

Règles :
- Si pas d'info exploitable : retourne {"changes": {}, "explanation": "Aucune information exploitable fournie. Merci de préciser services, horaires, prix, couleurs ou textes."}
- N'invente pas de services/couleurs/textes si absents ; si tu proposes quelque chose, justifie-le dans "explanation".
- Tu peux appliquer des services, horaires, couleurs, textes (hero/CTA/SEO), sections/visuels si le secteur est identifiable.
- Pas de prose hors JSON. La réponse doit être un JSON valide directement sérialisable.`;
}

/**
 * Parse la réponse de l'IA pour extraire les changements de config
 */
export function parseAIResponse(response: string): {
  changes: any;
  explanation: string;
} {
  try {
    // Essayer de parser directement le JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        changes: parsed.changes || parsed,
        explanation: parsed.explanation || 'Modifications appliquées',
      };
    }

    // Si pas de JSON valide, retourner une réponse par défaut
    return {
      changes: {},
      explanation: response,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      changes: {},
      explanation: response,
    };
  }
}

/**
 * Génère une réponse conversationnelle de l'IA
 */
export function createConversationalPrompt(userMessage: string, conversationHistory: any[]): string {
  return `Tu es un assistant IA amical qui aide les clients à créer leur site de réservation.

Historique de la conversation :
${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}

Message de l'utilisateur : ${userMessage}

Réponds de manière naturelle et conversationnelle en français. Pose des questions pour mieux comprendre leurs besoins si nécessaire.`;
}

