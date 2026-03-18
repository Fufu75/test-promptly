import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'site-images';
const MAX_WIDTH = 1920;
const TARGET_QUALITY = 0.82;

// ─── Compression via Canvas ───────────────────────────────────────────────────

const compressImage = (file: File): Promise<{ blob: Blob; mime: string; ext: string }> => {
  // PNG → garder PNG (transparence logos)
  // WebP → garder WebP (meilleure compression)
  // Tout le reste → JPEG
  const isPng = file.type === 'image/png';
  const isWebp = file.type === 'image/webp';
  const outputMime = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';
  const outputExt = isPng ? 'png' : isWebp ? 'webp' : 'jpg';
  const outputQuality = isPng ? undefined : TARGET_QUALITY;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas non disponible'));

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob
          ? resolve({ blob, mime: outputMime, ext: outputExt })
          : reject(new Error('Compression échouée')),
        outputMime,
        outputQuality
      );
    };

    img.onerror = () => reject(new Error('Impossible de lire l\'image'));
    img.src = url;
  });
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export const deleteSiteImage = async (publicUrl: string): Promise<void> => {
  // Extraire le path depuis l'URL publique Supabase
  // Format : https://<ref>.supabase.co/storage/v1/object/public/site-images/{path}
  const marker = '/site-images/';
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
};

export const uploadSiteImage = async (
  file: File,
  userId: string,
  projectId: string
): Promise<string> => {
  const { blob, mime, ext } = await compressImage(file);
  const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.${ext}`;
  const path = `${userId}/${projectId || 'unsaved'}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: mime, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};
