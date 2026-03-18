-- Bucket pour les images des sites générés
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (les images sont affichées sur les sites publiés)
CREATE POLICY "Public read site images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');

-- Upload : uniquement dans son propre dossier /{user_id}/...
CREATE POLICY "Users upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression : uniquement ses propres images
CREATE POLICY "Users delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
