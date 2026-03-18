import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Config } from '@/hooks/useConfig';

interface PageBlock {
  type: string;
  variant: string;
  props: Record<string, any>;
}

interface DeploymentManagerProps {
  config: Config;
  siteName: string;
  homepageBlocks: PageBlock[];
  authBlock: { variant: string; props: Record<string, any> };
  bookingBlocks: PageBlock[];
  existingClientId?: string | null;
  onDeploymentSuccess?: (clientId: string, url: string) => void;
}

type DeployStatus = 'idle' | 'deploying' | 'deployed' | 'failed';

const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL || 'http://localhost:4001';

export function DeploymentManager({
  config,
  siteName,
  homepageBlocks,
  authBlock,
  bookingBlocks,
  existingClientId,
  onDeploymentSuccess,
}: DeploymentManagerProps) {
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  // On mount: load existing status from Supabase
  useEffect(() => {
    if (!existingClientId) return;
    supabase
      .from('clients')
      .select('status, deployment_url')
      .eq('id', existingClientId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        if (data.status === 'deployed' && data.deployment_url) {
          setStatus('deployed');
          setDeployedUrl(data.deployment_url);
        } else if (data.status === 'failed') {
          setStatus('failed');
        }
      });
  }, [existingClientId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollCountRef.current = 0;
  };

  const startPolling = (clientId: string) => {
    stopPolling();
    pollCountRef.current = 0;

    pollingRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      // Max 60 polls = 5 minutes
      if (pollCountRef.current > 60) {
        stopPolling();
        setStatus('failed');
        addLog('Timeout: deployment took too long');
        toast.error('Deployment timeout');
        return;
      }

      try {
        const res = await fetch(`${ORCHESTRATOR_URL}/status/${clientId}`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.status === 'deployed' && data.url) {
          stopPolling();
          setStatus('deployed');
          setDeployedUrl(data.url);
          addLog(`Deployed: ${data.url}`);
          toast.success('Site deployed successfully!');

          await supabase
            .from('clients')
            .update({ status: 'deployed', deployment_url: data.url, deployed_at: new Date().toISOString() })
            .eq('id', clientId);

          onDeploymentSuccess?.(clientId, data.url);
        } else if (data.status === 'failed') {
          stopPolling();
          setStatus('failed');
          addLog(`Deployment failed: ${data.error || 'unknown error'}`);
          toast.error('Deployment failed');

          await supabase.from('clients').update({ status: 'failed' }).eq('id', clientId);
        }
      } catch {
        // Orchestrator not reachable yet, retry next tick
      }
    }, 5000);
  };

  const handleDeploy = async () => {
    if (!existingClientId) {
      toast.error('Sauvegardez d\'abord votre projet');
      return;
    }

    setStatus('deploying');
    setLogs(['Starting deployment...']);

    try {
      addLog(`Calling orchestrator at ${ORCHESTRATOR_URL}/deploy`);

      const res = await fetch(`${ORCHESTRATOR_URL}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: existingClientId,
          config,
          siteName,
          pageConfigs: {
            homepage: { pageBlocks: homepageBlocks },
            auth: { page: 'auth', variant: authBlock.variant, props: authBlock.props },
            booking: { page: 'booking', pageBlocks: bookingBlocks },
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Orchestrator error');
      }

      addLog(`Job started (id: ${result.jobId})`);
      addLog('Build in progress on Vercel (~1-2 min)...');
      toast.info('Build started, polling for status...');

      startPolling(result.jobId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('failed');
      addLog(`Error: ${message}`);
      toast.error(`Deployment failed: ${message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard');
  };

  const statusBadge = () => {
    if (status === 'idle') return null;
    const map = {
      deploying: { variant: 'default' as const, icon: Loader2, label: 'Deploying...', spin: true },
      deployed: { variant: 'default' as const, icon: CheckCircle2, label: 'Deployed', spin: false },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Failed', spin: false },
    };
    const { variant, icon: Icon, label, spin } = map[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${spin ? 'animate-spin' : ''}`} />
        {label}
      </Badge>
    );
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Déploiement Vercel</CardTitle>
          </div>
          {statusBadge()}
        </div>
        <CardDescription>
          Déployez votre site sur Vercel avec une URL publique dédiée
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deployed URL */}
        {status === 'deployed' && deployedUrl && (
          <div className="rounded-md border bg-white p-3 space-y-2">
            <p className="text-sm text-muted-foreground">URL déployée :</p>
            <div className="flex items-center gap-2">
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 font-medium text-primary hover:underline truncate text-sm"
              >
                {deployedUrl}
              </a>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(deployedUrl)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => window.open(deployedUrl, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="rounded-md border bg-black/90 p-3 h-[140px] overflow-y-auto font-mono text-xs text-green-400 space-y-0.5">
            {logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {status === 'deployed' ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(deployedUrl!, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir le site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeploy}
                className="text-xs text-muted-foreground"
              >
                <Rocket className="mr-1 h-3 w-3" />
                Redéployer
              </Button>
            </>
          ) : status === 'deploying' ? (
            <Button disabled className="flex-1">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Déploiement en cours...
            </Button>
          ) : (
            <Button
              onClick={handleDeploy}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Rocket className="mr-2 h-4 w-4" />
              {status === 'failed' ? 'Réessayer le déploiement' : 'Déployer sur Vercel'}
            </Button>
          )}
        </div>

        {!existingClientId && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
            Sauvegardez d'abord votre projet avant de déployer.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
