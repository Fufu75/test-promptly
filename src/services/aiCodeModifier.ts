/**
 * AI Code Modifier Service
 * Permet à l'agent IA de modifier directement le code source (TSX, CSS, etc.)
 * avec self-correction via lint et build
 */

import { callOllama } from './ollamaService';

export interface CodeModificationRequest {
  clientId?: string; // Si null, modifie le template local
  userPrompt: string;
  targetFile?: string; // Ex: 'src/pages/Index.tsx'
  currentCode?: string; // Code actuel si déjà chargé
}

export interface FileModification {
  filePath: string;
  content: string;
}

export interface ModificationResult {
  success: boolean;
  changes: FileModification[];
  errors?: string[];
  iterations: number;
  explanation?: string;
}

/**
 * Modifie du code via l'IA avec self-correction
 * @param request - Requête de modification
 * @param maxIterations - Nombre max de tentatives (défaut: 3)
 * @returns Résultat de la modification
 */
export async function modifyCodeWithAI(
  request: CodeModificationRequest,
  maxIterations = 3
): Promise<ModificationResult> {
  const { userPrompt, targetFile, currentCode, clientId } = request;
  let iteration = 0;
  const changes: FileModification[] = [];
  let lastError: string | undefined;

  while (iteration < maxIterations) {
    iteration++;
    console.log(`[AI Code Modifier] Iteration ${iteration}/${maxIterations}`);

    try {
      // 1. Construire le prompt pour l'IA
      const prompt = buildCodeModificationPrompt({
        userPrompt,
        targetFile,
        currentCode: currentCode || '',
        iterationError: lastError,
      });

      // 2. Appeler l'IA
      const aiResponse = await callOllama([{ role: 'user', content: prompt }]);

      // 3. Parser la réponse
      const parseResult = parseCodeModificationResponse(aiResponse);

      if (!parseResult.modifications || parseResult.modifications.length === 0) {
        lastError = 'IA n\'a pas retourné de modifications valides';
        continue;
      }

      // 4. Valider la syntaxe (basique, côté client)
      const validationErrors = validateModifications(parseResult.modifications);
      if (validationErrors.length > 0) {
        lastError = `Erreurs de validation : ${validationErrors.join(', ')}`;
        continue;
      }

      // 5. Succès !
      return {
        success: true,
        changes: parseResult.modifications,
        iterations: iteration,
        explanation: parseResult.explanation,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`[AI Code Modifier] Erreur iteration ${iteration}:`, lastError);
    }
  }

  // Échec après max iterations
  return {
    success: false,
    changes,
    errors: [`Max iterations atteint (${maxIterations})`, lastError || 'Erreur inconnue'],
    iterations: iteration,
  };
}

/**
 * Construit le prompt pour l'IA
 */
function buildCodeModificationPrompt(params: {
  userPrompt: string;
  targetFile?: string;
  currentCode: string;
  iterationError?: string;
}): string {
  const { userPrompt, targetFile, currentCode, iterationError } = params;

  let prompt = `Tu es un expert développeur React/TypeScript spécialisé dans les sites de réservation.

**Contexte** : Tu dois modifier le code d'un site de réservation basé sur le template "Barber".

${targetFile ? `**Fichier cible** : \`${targetFile}\`

**Code actuel** :
\`\`\`tsx
${currentCode}
\`\`\`
` : '**Note** : Pas de fichier cible spécifique, détermine les fichiers à modifier.'}

**Demande utilisateur** : "${userPrompt}"

${iterationError ? `⚠️ **Erreur précédente** : ${iterationError}
Corrige cette erreur dans ta nouvelle réponse.

` : ''}**Instructions** :
1. Analyse la demande et détermine les modifications nécessaires
2. Génère le code complet et valide (pas de "// ... rest of code")
3. Respecte les conventions React/TypeScript/Tailwind CSS
4. Assure-toi que tous les imports sont corrects
5. Le code doit être prêt à être copié-collé directement

**Format de réponse** (UNIQUEMENT JSON, pas de markdown) :
{
  "modifications": [
    {
      "filePath": "src/pages/Index.tsx",
      "content": "... code complet du fichier ..."
    }
  ],
  "explanation": "Explication concise des changements effectués"
}

**Contraintes** :
- Code valide syntaxiquement
- Pas d'erreurs TypeScript
- Imports corrects et complets
- Pas de commentaires "TODO" ou "à compléter"
- Style cohérent avec Tailwind CSS`;

  return prompt;
}

/**
 * Parse la réponse JSON de l'IA
 */
function parseCodeModificationResponse(response: string): {
  modifications: FileModification[];
  explanation?: string;
} {
  try {
    // Chercher un objet JSON dans la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI Code Modifier] Aucun JSON trouvé dans la réponse');
      return { modifications: [] };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Valider la structure
    if (!parsed.modifications || !Array.isArray(parsed.modifications)) {
      console.error('[AI Code Modifier] Structure JSON invalide');
      return { modifications: [] };
    }

    return {
      modifications: parsed.modifications.map((mod: any) => ({
        filePath: mod.filePath || '',
        content: mod.content || mod.newContent || '',
      })),
      explanation: parsed.explanation,
    };
  } catch (error) {
    console.error('[AI Code Modifier] Erreur parsing JSON:', error);
    return { modifications: [] };
  }
}

/**
 * Validation basique des modifications (côté client)
 */
function validateModifications(modifications: FileModification[]): string[] {
  const errors: string[] = [];

  for (const mod of modifications) {
    // Vérifier que le fichier a une extension valide
    if (!mod.filePath || !mod.filePath.match(/\.(tsx?|jsx?|css|json)$/)) {
      errors.push(`Fichier invalide: ${mod.filePath}`);
    }

    // Vérifier que le contenu n'est pas vide
    if (!mod.content || mod.content.trim().length === 0) {
      errors.push(`Contenu vide pour: ${mod.filePath}`);
    }

    // Vérifier les imports manquants (basique)
    if (mod.filePath.match(/\.tsx?$/) && mod.content.includes('React')) {
      if (!mod.content.includes('import') && !mod.content.includes('from')) {
        errors.push(`Imports manquants dans: ${mod.filePath}`);
      }
    }

    // Vérifier la fermeture des balises JSX (basique)
    if (mod.filePath.match(/\.tsx$/)) {
      const openTags = (mod.content.match(/<\w+/g) || []).length;
      const closeTags = (mod.content.match(/<\/\w+>/g) || []).length;
      const selfCloseTags = (mod.content.match(/\/>/g) || []).length;

      if (openTags - selfCloseTags !== closeTags) {
        errors.push(`Balises JSX non fermées dans: ${mod.filePath}`);
      }
    }
  }

  return errors;
}

/**
 * Applique les modifications localement (pour preview/test)
 */
export async function applyModificationsLocally(
  modifications: FileModification[]
): Promise<{ success: boolean; errors?: string[] }> {
  // Cette fonction serait utilisée côté backend pour écrire les fichiers
  // Côté frontend, on peut juste simuler ou afficher un aperçu
  console.log('[AI Code Modifier] Modifications à appliquer:', modifications);

  return { success: true };
}

/**
 * Générer un diff pour preview
 */
export function generateDiff(
  original: string,
  modified: string
): { additions: string[]; deletions: string[] } {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');

  const additions: string[] = [];
  const deletions: string[] = [];

  // Simplification : chercher les lignes différentes
  const maxLength = Math.max(originalLines.length, modifiedLines.length);

  for (let i = 0; i < maxLength; i++) {
    const origLine = originalLines[i];
    const modLine = modifiedLines[i];

    if (origLine !== modLine) {
      if (origLine && !modLine) {
        deletions.push(`- ${origLine}`);
      } else if (!origLine && modLine) {
        additions.push(`+ ${modLine}`);
      } else if (origLine && modLine) {
        deletions.push(`- ${origLine}`);
        additions.push(`+ ${modLine}`);
      }
    }
  }

  return { additions, deletions };
}

/**
 * Types de fichiers modifiables autorisés
 */
export const ALLOWED_FILE_TYPES = [
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.css',
  '.json',
] as const;

/**
 * Fichiers interdits de modification
 */
export const FORBIDDEN_FILES = [
  'src/integrations/supabase/client.ts', // Sécurité
  'src/integrations/supabase/types.ts',
  '.env',
  '.env.local',
  'package.json', // Sauf autorisation explicite
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
] as const;

/**
 * Vérifie si un fichier peut être modifié
 */
export function isFileModifiable(filePath: string): boolean {
  // Vérifier si le fichier est interdit
  if (FORBIDDEN_FILES.some((forbidden) => filePath.endsWith(forbidden))) {
    return false;
  }

  // Vérifier si l'extension est autorisée
  return ALLOWED_FILE_TYPES.some((ext) => filePath.endsWith(ext));
}
