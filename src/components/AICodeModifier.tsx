/**
 * Composant AICodeModifier
 * Permet de demander à l'IA de modifier directement le code source (TSX, CSS)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Code, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { modifyCodeWithAI, type CodeModificationRequest, type ModificationResult } from '@/services/aiCodeModifier';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AICodeModifierProps {
  clientId?: string;
  onSuccess?: (result: ModificationResult) => void;
}

export function AICodeModifier({ clientId, onSuccess }: AICodeModifierProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [targetFile, setTargetFile] = useState('src/pages/Index.tsx');
  const [isModifying, setIsModifying] = useState(false);
  const [lastResult, setLastResult] = useState<ModificationResult | null>(null);

  const handleModify = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez décrire la modification souhaitée');
      return;
    }

    setIsModifying(true);
    setLastResult(null);

    try {
      const request: CodeModificationRequest = {
        clientId,
        userPrompt: prompt,
        targetFile: targetFile || undefined,
      };

      console.log('[AI Code Modifier] Démarrage de la modification...', request);
      toast.info('Modification en cours... L\'IA va générer le code.');

      const result = await modifyCodeWithAI(request, 3);
      setLastResult(result);

      if (result.success) {
        toast.success(`Code modifié avec succès ! (${result.iterations} itération(s))`);
        onSuccess?.(result);
      } else {
        toast.error(`Échec de la modification après ${result.iterations} tentative(s)`);
      }
    } catch (error) {
      console.error('[AI Code Modifier] Erreur:', error);
      toast.error('Erreur lors de la modification du code');
    } finally {
      setIsModifying(false);
    }
  };

  const quickPrompts = [
    'Change la couleur d\'arrière-plan du hero en dégradé bleu',
    'Ajoute une section "Témoignages clients" avec 3 cartes',
    'Modifie le bouton CTA pour qu\'il soit plus grand et arrondi',
    'Ajoute une animation fade-in sur le titre principal',
  ];

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Modification de Code par IA</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Réduire' : 'Développer'}
          </Button>
        </div>
        <CardDescription>
          Demandez à l'IA de modifier directement le code source de votre site (TSX, CSS)
        </CardDescription>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          {/* Fichier cible */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fichier cible</label>
            <Input
              type="text"
              placeholder="src/pages/Index.tsx"
              value={targetFile}
              onChange={(e) => setTargetFile(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Laissez vide pour que l'IA détermine automatiquement les fichiers à modifier
            </p>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modification souhaitée</label>
            <Input
              type="text"
              placeholder="Ex: Ajoute une section galerie avec 6 images"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isModifying) {
                  handleModify();
                }
              }}
              disabled={isModifying}
            />
          </div>

          {/* Prompts rapides */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Suggestions rapides :</label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((quickPrompt, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setPrompt(quickPrompt)}
                >
                  {quickPrompt}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bouton d'action */}
          <Button
            onClick={handleModify}
            disabled={isModifying || !prompt.trim()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isModifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Modification en cours...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Modifier le code
              </>
            )}
          </Button>

          {/* Résultat */}
          {lastResult && (
            <Card className={lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {lastResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <CardTitle className="text-base">
                    {lastResult.success ? 'Modification réussie !' : 'Échec de la modification'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">Itérations :</span>
                  <span className="font-medium">{lastResult.iterations}</span>
                </div>

                {lastResult.explanation && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Explication :</span>
                    <p className="text-sm text-muted-foreground">{lastResult.explanation}</p>
                  </div>
                )}

                {lastResult.changes && lastResult.changes.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Fichiers modifiés :</span>
                    <ScrollArea className="h-[100px] rounded-md border bg-white p-2">
                      <ul className="space-y-1 text-xs font-mono">
                        {lastResult.changes.map((change, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            {change.filePath}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {lastResult.errors && lastResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-red-600">Erreurs :</span>
                    <ScrollArea className="h-[100px] rounded-md border bg-white p-2">
                      <ul className="space-y-1 text-xs">
                        {lastResult.errors.map((error, index) => (
                          <li key={index} className="text-red-600">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Warning */}
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-900">
                  Fonctionnalité expérimentale
                </p>
                <p className="text-xs text-yellow-800">
                  L'IA va modifier directement le code source. Assurez-vous d'avoir une sauvegarde
                  ou un système de contrôle de version (Git) actif.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
