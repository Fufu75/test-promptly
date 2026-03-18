import { useEffect, useState } from 'react';
import { useSearchParams, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Head } from '@/components/Head';
import Index from './Index';
import Auth from './Auth';
import AdminDashboard from './AdminDashboard';
import ClientBookings from './ClientBookings';
import NotFound from './NotFound';
import type { Config } from '@/hooks/useConfig';

// Hook personnalisé pour charger le config depuis l'URL
const usePreviewConfig = () => {
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configParam = searchParams.get('config');
    if (configParam) {
      try {
        const decoded = JSON.parse(atob(configParam));
        localStorage.setItem('preview_config', JSON.stringify(decoded));
        setConfig(decoded);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error decoding config:', error);
      }
    }

    // Lire depuis localStorage
    const stored = localStorage.getItem('preview_config');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (err) {
        console.error('Error reading preview_config:', err);
      }
    }
    setLoading(false);
  }, [searchParams]);

  return { config, loading };
};

// Composant App avec config dynamique
const PreviewApp = () => {
  const { config, loading } = usePreviewConfig();
  const queryClient = new QueryClient();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration introuvable</h1>
          <p className="text-muted-foreground">
            Aucune configuration n'a été fournie pour l'aperçu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <Head />
            <Routes>
              {/* Routes du site généré (template Barber avec config personnalisé) */}
              {/* Utiliser des chemins relatifs car on est dans /preview/* */}
              <Route index element={<Index />} />
              <Route path="auth" element={<Auth />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="bookings"
                element={
                  <ProtectedRoute>
                    <ClientBookings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

const SitePreview = () => {
  return <PreviewApp />;
};

export default SitePreview;
