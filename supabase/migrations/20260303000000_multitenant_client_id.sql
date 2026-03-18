-- ============================================================================
-- MIGRATION : Multi-tenant client_id
-- ============================================================================
-- À appliquer sur une base existante qui tourne déjà.
-- Pour une base neuve, utiliser uniquement 00000000000000_initial_schema.sql.
--
-- Ce que cette migration fait :
--   1. Ajoute profiles.client_id  (nullable — NULL = créateur plateforme)
--   2. Ajoute bookings.client_id  (obligatoire pour les nouvelles réservations)
--   3. Met à jour les RLS bookings et profiles
--   4. Remplace la contrainte de non-chevauchement pour l'isoler par client_id
--   5. Ajoute les fonctions et tables SaaS si elles n'existent pas déjà
-- ============================================================================


-- ============================================================================
-- 1. FONCTIONS SUPPLÉMENTAIRES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Helper pour lire client_id de l'utilisateur courant sans récursion RLS
CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Étendre is_admin() pour inclure super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;


-- ============================================================================
-- 2. TABLES SAAS (idempotent — ne recrée pas si elles existent déjà)
-- ============================================================================

-- Ajouter super_admin au CHECK de profiles.role si pas déjà fait
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'client', 'super_admin'));

-- Table clients
CREATE TABLE IF NOT EXISTS public.clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name         TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  description       TEXT,
  config_url        TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'deploying', 'deployed', 'failed', 'suspended')),
  deployment_url    TEXT,
  container_id      TEXT,
  container_port    INTEGER,
  template_version  TEXT DEFAULT '1.0.0',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at       TIMESTAMPTZ,
  last_activity_at  TIMESTAMPTZ
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Table client_admins
CREATE TABLE IF NOT EXISTS public.client_admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, user_id)
);

ALTER TABLE public.client_admins ENABLE ROW LEVEL SECURITY;

-- Table deployment_logs
CREATE TABLE IF NOT EXISTS public.deployment_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  level      TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message    TEXT NOT NULL,
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;

-- Table ai_modifications
CREATE TABLE IF NOT EXISTS public.ai_modifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  user_prompt  TEXT NOT NULL,
  target_files TEXT[],
  changes      JSONB NOT NULL,
  success      BOOLEAN NOT NULL,
  iterations   INTEGER DEFAULT 1,
  error_logs   TEXT,
  model_used   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_modifications ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. TRIGGERS SAAS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.client_admins (client_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_client_created ON public.clients;
CREATE TRIGGER on_client_created
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();

DROP TRIGGER IF EXISTS set_updated_at_clients ON public.clients;
CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- 4. COLONNE client_id SUR profiles
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.profiles.client_id IS
  'NULL = utilisateur de la plateforme. Non-null = client final du site déployé.';

CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON public.profiles(client_id);


-- ============================================================================
-- 5. COLONNE client_id SUR bookings
-- ============================================================================

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.bookings.client_id IS
  'Site déployé auquel appartient cette réservation.';

CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);


-- ============================================================================
-- 6. MISE À JOUR DES RLS BOOKINGS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view confirmed bookings for availability" ON public.bookings;

-- Remplacer par une version filtrée par client_id
CREATE POLICY "Authenticated users can view confirmed bookings for availability"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'confirmed'
    AND (
      client_id IS NULL
      OR client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    )
  );


-- ============================================================================
-- 7. MISE À JOUR DES RLS PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view profiles of their site"
  ON public.profiles FOR SELECT
  USING (
    public.is_admin()
    AND (
      client_id IS NULL
      OR client_id = public.get_my_client_id()
    )
  );

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin());


-- ============================================================================
-- 8. CONTRAINTE DE NON-CHEVAUCHEMENT PAR client_id
-- ============================================================================

-- Supprimer l'ancienne contrainte globale (tous sites confondus)
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_no_time_overlap;

-- Recréer en isolant par client_id
-- (les réservations sans client_id = données legacy, pas de contrainte appliquée)
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_time_overlap
  EXCLUDE USING gist (
    client_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status = 'confirmed' AND client_id IS NOT NULL);


-- ============================================================================
-- 9. RLS SAAS TABLES (idempotent)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
CREATE POLICY "Users can create clients"
  ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins can manage all clients" ON public.clients;
CREATE POLICY "Super admins can manage all clients"
  ON public.clients FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Client admins can view deployment logs" ON public.deployment_logs;
CREATE POLICY "Client admins can view deployment logs"
  ON public.deployment_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_admins
      WHERE client_id = deployment_logs.client_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view AI modifications of their clients" ON public.ai_modifications;
CREATE POLICY "Users can view AI modifications of their clients"
  ON public.ai_modifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients WHERE id = client_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create AI modifications for their clients" ON public.ai_modifications;
CREATE POLICY "Users can create AI modifications for their clients"
  ON public.ai_modifications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.clients WHERE id = client_id AND user_id = auth.uid()
    )
  );


-- ============================================================================
-- 10. INDEX SAAS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_user_id            ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_slug               ON public.clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_status             ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_client_admins_client_id    ON public.client_admins(client_id);
CREATE INDEX IF NOT EXISTS idx_client_admins_user_id      ON public.client_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_client_id  ON public.deployment_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_created_at ON public.deployment_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_mods_client_id          ON public.ai_modifications(client_id);


-- ============================================================================
-- 11. STORAGE BUCKET client-configs
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-configs', 'client-configs', false, 1048576, ARRAY['application/json']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their client configs" ON storage.objects;
CREATE POLICY "Users can upload their client configs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'client-configs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can read their client configs" ON storage.objects;
CREATE POLICY "Users can read their client configs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-configs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their client configs" ON storage.objects;
CREATE POLICY "Users can update their client configs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'client-configs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
