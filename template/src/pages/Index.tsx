import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { PageRenderer } from '@/components/PageRenderer';
import homepageConfig from '@/config/pages/homepage-config.json';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const config = useConfig();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/bookings');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageRenderer
      blocks={(homepageConfig as any).pageBlocks}
      config={{
        brandName: config.brandName,
        businessSector: config.businessSector,
        accentColor: config.theme?.primaryColor,
        services: config.services,
        openingHours: config.openingHours,
        contact: config.contact,
      }}
    />
  );
};

export default Index;
