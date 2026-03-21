import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, loading } = useAuth();
  const [isClientAdmin, setIsClientAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!requireAdmin || !user) {
      setIsClientAdmin(null);
      return;
    }

    supabase
      .from('client_admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('client_id', CLIENT_ID)
      .maybeSingle()
      .then(({ data }) => {
        setIsClientAdmin(!!data);
      });
  }, [user, requireAdmin]);

  if (loading || (requireAdmin && user && isClientAdmin === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isClientAdmin) {
    return <Navigate to="/bookings" replace />;
  }

  return <>{children}</>;
};
