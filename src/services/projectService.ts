/**
 * Service de gestion des projets dans Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import type { Config } from '@/hooks/useConfig';

export interface Project {
  id: string;
  user_id: string;
  site_name: string;
  slug: string;
  config_url: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'suspended';
  deployment_url: string | null;
  container_port: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Créer un nouveau projet
 */
export async function createProject(
  siteName: string,
  config: Config
): Promise<{ data: Project | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('Non authentifié') };
    }

    // Générer un slug
    const slug = siteName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        site_name: siteName,
        slug,
        config_url: JSON.stringify(config),
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Project, error: null };
  } catch (error) {
    console.error('Erreur création projet:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Mettre à jour un projet existant
 */
export async function updateProject(
  projectId: string,
  siteName: string,
  config: Config
): Promise<{ data: Project | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        site_name: siteName,
        config_url: JSON.stringify(config),
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Project, error: null };
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Charger un projet par son ID
 */
export async function loadProject(
  projectId: string
): Promise<{ data: { project: Project; config: Config } | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;

    const project = data as Project;
    const config = JSON.parse(project.config_url) as Config;

    return { data: { project, config }, error: null };
  } catch (error) {
    console.error('Erreur chargement projet:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Supprimer un projet
 */
export async function deleteProject(
  projectId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', projectId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    return { error: error as Error };
  }
}

/**
 * Lister tous les projets de l'utilisateur connecté
 */
export async function listProjects(): Promise<{ data: Project[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('Non authentifié') };
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as Project[], error: null };
  } catch (error) {
    console.error('Erreur listage projets:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Sauvegarder automatiquement (create si nouveau, update si existant)
 */
export async function saveProject(
  projectId: string | null,
  siteName: string,
  config: Config
): Promise<{ data: Project | null; error: Error | null; isNew: boolean }> {
  if (projectId) {
    // Mise à jour d'un projet existant
    const result = await updateProject(projectId, siteName, config);
    return { ...result, isNew: false };
  } else {
    // Création d'un nouveau projet
    const result = await createProject(siteName, config);
    return { ...result, isNew: true };
  }
}
