-- ============================================================================
-- MIGRATION : handle_new_user lit désormais client_id depuis les metadata
-- ============================================================================
-- Nécessaire pour que les clients des sites déployés (template) reçoivent
-- automatiquement leur client_id lors de l'inscription.
--
-- Plateforme  : raw_user_meta_data = { full_name, role: 'admin' }
--               → client_id = NULL  (créateur, pas encore de site)
-- Template    : raw_user_meta_data = { full_name, role: 'client', client_id: '<uuid>' }
--               → client_id = <uuid> (client final d'un site déployé)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, client_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    CASE
      WHEN NEW.raw_user_meta_data->>'client_id' IS NOT NULL
        AND NEW.raw_user_meta_data->>'client_id' != 'null'
      THEN (NEW.raw_user_meta_data->>'client_id')::UUID
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;
