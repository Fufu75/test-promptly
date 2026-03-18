import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { AuthVariants } from '@/components/blocks/auth';
import { toast } from 'sonner';
import authConfig from '@/config/pages/auth-config.json';

const Auth = () => {
  const { signIn, signUp, user, profile } = useAuth();
  const config = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/bookings');
      }
    }
  }, [user, profile, navigate]);

  const variant = (authConfig as any).variant || 'centered-card';
  const AuthComponent = AuthVariants[variant] || AuthVariants['centered-card'];

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Connexion réussie !');
    }
    return { error: error ? { message: error.message } : undefined };
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Compte créé avec succès !');
    }
    return { error: error ? { message: error.message } : undefined };
  };

  return (
    <AuthComponent
      {...(authConfig as any).props}
      brandName={config.brandName}
      logoUrl={(authConfig as any).props?.logoUrl || config.logoUrl}
      accentColor={config.theme?.primaryColor || '#0EA5E9'}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
    />
  );
};

export default Auth;
