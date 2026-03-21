-- ============================================================================
-- MIGRATION : Fix RLS client_admins — lecture de ses propres entrées
-- ============================================================================
-- Objectif : permettre à un utilisateur authentifié de lire ses propres
-- lignes dans client_admins. Nécessaire pour vérifier côté frontend si
-- l'utilisateur est bien admin d'un site donné (VITE_CLIENT_ID).
--
-- Type : additive — aucune policy existante n'est supprimée ou modifiée.
-- ============================================================================

CREATE POLICY "Users can view their own client_admins entries"
  ON public.client_admins FOR SELECT
  USING (user_id = auth.uid());
