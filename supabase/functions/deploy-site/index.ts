/**
 * Supabase Edge Function - Deploy Site
 * Triggered when a new client is created in the database
 * Calls the backend orchestrator to deploy a Docker container
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration
const ORCHESTRATOR_URL = Deno.env.get('ORCHESTRATOR_URL') || 'http://localhost:4001';
const DEPLOY_TOKEN = Deno.env.get('DEPLOY_TOKEN') || 'dev-token-123';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    // Parse request
    const { record } = await req.json();
    
    if (!record || !record.id) {
      return new Response(
        JSON.stringify({ error: 'invalid_request', message: 'Record manquant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const clientId = record.id;
    const config = record.config_url;
    const siteName = record.site_name;

    console.log(`[Deploy Site] Déploiement du client: ${clientId}`);

    // Créer le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Mettre à jour le statut à 'deploying'
    await supabase
      .from('clients')
      .update({ status: 'deploying' })
      .eq('id', clientId);

    // Parser le config si c'est une string JSON
    let configObject;
    try {
      configObject = typeof config === 'string' ? JSON.parse(config) : config;
    } catch (error) {
      console.error('[Deploy Site] Erreur parsing config:', error);
      await supabase
        .from('clients')
        .update({ status: 'failed' })
        .eq('id', clientId);
      
      return new Response(
        JSON.stringify({ error: 'invalid_config', message: 'Config JSON invalide' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Appeler le backend orchestrator
    try {
      const response = await fetch(`${ORCHESTRATOR_URL}/deploy-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Deploy-Token': DEPLOY_TOKEN,
        },
        body: JSON.stringify({
          clientId,
          config: configObject,
          siteName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Orchestrator error: ${errorData.message || 'Unknown error'}`);
      }

      const deploymentData = await response.json();

      // Mettre à jour le statut à 'deployed'
      await supabase
        .from('clients')
        .update({
          status: 'deployed',
          deployment_url: deploymentData.deployment_url,
          container_port: deploymentData.port,
          deployed_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      // Log dans deployment_logs
      await supabase.from('deployment_logs').insert({
        client_id: clientId,
        level: 'info',
        message: 'Déploiement réussi',
        details: deploymentData,
      });

      console.log(`[Deploy Site] Succès: ${deploymentData.deployment_url}`);

      return new Response(
        JSON.stringify({
          success: true,
          url: deploymentData.deployment_url,
          port: deploymentData.port,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('[Deploy Site] Erreur déploiement:', error);

      // Mettre à jour le statut à 'failed'
      await supabase
        .from('clients')
        .update({ status: 'failed' })
        .eq('id', clientId);

      // Log l'erreur
      await supabase.from('deployment_logs').insert({
        client_id: clientId,
        level: 'error',
        message: 'Échec du déploiement',
        details: { error: error.message, stack: error.stack },
      });

      return new Response(
        JSON.stringify({
          error: 'deployment_failed',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[Deploy Site] Erreur globale:', error);
    
    return new Response(
      JSON.stringify({
        error: 'internal_error',
        message: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
