import { useState, useRef } from 'react';
import { Code, Edit2, Check, X, Eye, FileArchive, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GeneratedSiteConfig } from '@/types/siteConfig';
import type { AIGenerationState } from '@/types/siteConfig';

export interface ImageSlot {
  blockType: string;
  propName: string;
  label: string;
  // Contexte visuel exact dans le composant
  context: string;
  // Ratio de l'aperçu dans le panel (reflète comment l'image est utilisée)
  aspectRatio: 'square' | 'video';
  // Conseil format/dimensions affiché sous le slot
  hint: string;
  // Types de fichiers acceptés
  accept: string;
  // Groupement par page pour l'UI
  page: 'homepage' | 'auth';
  currentUrl?: string;
}

interface ConfigPanelProps {
  generatedConfig: GeneratedSiteConfig;
  aiState: AIGenerationState;
  imageSlots: ImageSlot[];
  onUpdateField: (field: string, value: string) => void;
  onUpdateServiceField: (index: number, field: 'name' | 'duration' | 'price', value: string) => void;
  onAddService: () => void;
  onRemoveService: (index: number) => void;
  onUploadImage: (blockType: string, propName: string, file: File) => Promise<void>;
  onRemoveImage: (blockType: string, propName: string) => void | Promise<void>;
  onPreview: () => void;
  onExport: () => void;
}

// ─── Champ éditable inline ────────────────────────────────────────────────────

interface EditableFieldProps {
  label: string;
  field: string;
  value: string;
  type?: 'text' | 'color';
  onSave: (field: string, value: string) => void;
}

const EditableField = ({ label, field, value, type = 'text', onSave }: EditableFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    if (!draft.trim()) return;
    onSave(field, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div
      className="mb-4 p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors cursor-pointer group"
      onClick={() => { if (!editing) { setDraft(value); setEditing(true); } }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium mb-1">{label}</p>
        {!editing && <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>

      {editing ? (
        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          {type === 'color' && (
            <Input
              type="color"
              value={draft || '#000000'}
              onChange={(e) => setDraft(e.target.value)}
              className="h-8 w-16"
            />
          )}
          <Input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            className="text-sm h-8 flex-1"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : type === 'color' ? (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-8 h-8 rounded border" style={{ backgroundColor: value }} />
          <span className="text-xs">{value}</span>
        </div>
      ) : (
        <p className="text-sm">{value || <span className="text-muted-foreground italic">Non défini</span>}</p>
      )}
    </div>
  );
};

// ─── Champ upload image ───────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  slot: ImageSlot;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const ImageUploadField = ({ slot, isUploading, onUpload, onRemove }: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { label, context, aspectRatio, hint, accept, currentUrl } = slot;

  // Classes du conteneur d'aperçu selon le ratio réel du composant
  const previewClass = aspectRatio === 'square'
    ? 'w-16 h-16 rounded-xl'       // Logo : petit carré comme dans la navbar (~40px scaled up)
    : 'w-full aspect-video rounded-lg'; // Background : 16:9 comme background-size: cover

  return (
    <div className="mb-4">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{context}</p>
        </div>
        {currentUrl && (
          <button
            type="button"
            onClick={onRemove}
            title="Supprimer"
            className="text-muted-foreground hover:text-destructive transition-colors ml-2 mt-0.5 shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {currentUrl ? (
        // Aperçu avec bouton "Modifier" au survol
        <div
          className={`relative overflow-hidden border bg-muted/30 cursor-pointer group ${previewClass}`}
          onClick={() => inputRef.current?.click()}
        >
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <span className="text-white text-xs font-medium">Modifier</span>
          </div>
        </div>
      ) : (
        // Zone de dépôt vide, même ratio que l'aperçu
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors disabled:opacity-50 cursor-pointer ${previewClass}`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {isUploading ? 'Upload...' : 'Ajouter'}
          </span>
        </button>
      )}

      <p className="text-xs text-muted-foreground/70 mt-1.5">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label={`Uploader : ${label}`}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }}
      />
    </div>
  );
};

// ─── Panneau principal ────────────────────────────────────────────────────────

const ConfigPanel = ({
  generatedConfig,
  aiState,
  imageSlots,
  onUpdateField,
  onUpdateServiceField,
  onAddService,
  onRemoveService,
  onUploadImage,
  onRemoveImage,
  onPreview,
  onExport,
}: ConfigPanelProps) => {
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const handleUpload = async (blockType: string, propName: string, file: File) => {
    const key = `${blockType}-${propName}`;
    setUploadingSlot(key);
    try {
      await onUploadImage(blockType, propName, file);
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Config */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="h-4 w-4" />
              Configuration
            </CardTitle>
            <Button onClick={onPreview} size="sm" className="h-8 gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Aperçu
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-4 py-4">

              <EditableField
                label="Nom du site"
                field="brandName"
                value={generatedConfig.brandName}
                onSave={onUpdateField}
              />

              <EditableField
                label="Secteur d'activité"
                field="businessSector"
                value={generatedConfig.businessSector}
                onSave={onUpdateField}
              />

              <EditableField
                label="Couleur principale"
                field="theme.primaryColor"
                value={generatedConfig.theme?.primaryColor || ''}
                type="color"
                onSave={onUpdateField}
              />

              {/* Services */}
              <div className="mb-4 p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium">
                    Services ({generatedConfig.services.length})
                  </p>
                  <Button variant="outline" size="sm" onClick={onAddService}>
                    + Ajouter
                  </Button>
                </div>

                <div className="space-y-2 mt-1">
                  {generatedConfig.services.map((service, idx) => (
                    <div key={service.id} className="p-3 rounded-lg border bg-background space-y-2">
                      {/* Nom + supprimer */}
                      <div className="flex items-center gap-2">
                        <Input
                          value={service.name}
                          onChange={(e) => onUpdateServiceField(idx, 'name', e.target.value)}
                          placeholder="Nom du service"
                          className="flex-1 h-8 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveService(idx)}
                          disabled={generatedConfig.services.length <= 1}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {/* Durée + Prix */}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Durée (min)</p>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={service.duration || ''}
                            onChange={(e) => onUpdateServiceField(idx, 'duration', e.target.value)}
                            placeholder="—"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Prix (€)</p>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={service.price || ''}
                            onChange={(e) => onUpdateServiceField(idx, 'price', e.target.value)}
                            placeholder="—"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {generatedConfig.services.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Aucun service. Ajoutez-en un ou demandez à l'IA.
                    </p>
                  )}
                </div>
              </div>

              {/* Images */}
              {imageSlots.length > 0 && (() => {
                const homepageSlots = imageSlots.filter(s => s.page === 'homepage');
                const authSlots = imageSlots.filter(s => s.page === 'auth');
                return (
                  <div className="mb-4 space-y-4">
                    {homepageSlots.length > 0 && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs font-semibold mb-3">Images — Page d'accueil</p>
                        {homepageSlots.map((slot) => (
                          <ImageUploadField
                            key={`${slot.blockType}-${slot.propName}`}
                            slot={slot}
                            isUploading={uploadingSlot === `${slot.blockType}-${slot.propName}`}
                            onUpload={(file) => handleUpload(slot.blockType, slot.propName, file)}
                            onRemove={() => onRemoveImage(slot.blockType, slot.propName)}
                          />
                        ))}
                      </div>
                    )}
                    {authSlots.length > 0 && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs font-semibold mb-3">Images — Page connexion</p>
                        {authSlots.map((slot) => (
                          <ImageUploadField
                            key={`${slot.blockType}-${slot.propName}`}
                            slot={slot}
                            isUploading={uploadingSlot === `${slot.blockType}-${slot.propName}`}
                            onUpload={(file) => handleUpload(slot.blockType, slot.propName, file)}
                            onRemove={() => onRemoveImage(slot.blockType, slot.propName)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Export */}
              <div className="mt-2 pt-4 border-t">
                <Button
                  onClick={onExport}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={aiState.isGenerating}
                >
                  {aiState.isGenerating ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Génération...</>
                  ) : (
                    <><FileArchive className="h-3.5 w-3.5 mr-2" />Exporter le site (ZIP)</>
                  )}
                </Button>
              </div>

            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigPanel;
