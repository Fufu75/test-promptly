import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthVariants, AuthVariantKey } from '@/components/blocks/auth';
import authConfig from '@/config/pages/auth-config.json';
import { useEffect } from 'react';
import { USER_ROLES } from '@/constants';
import { toast } from 'sonner';

const AuthTest = () => {
  const { signIn, signUp, user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  // Redirect if already authenticated
  useEffect(() => {
    if (user && profile) {
      if (redirect === 'creator') {
        navigate('/creator');
        return;
      }
      if (profile.role === USER_ROLES.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/bookings');
      }
    }
  }, [user, profile, navigate, redirect]);

  // Get the variant component from config
  const variant = authConfig.variant as AuthVariantKey;
  const AuthComponent = AuthVariants[variant];

  if (!AuthComponent) {
    return <div>Variant "{variant}" not found</div>;
  }

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error) {
      toast.success('Connexion réussie !');
    }
    return result;
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    const result = await signUp(email, password, fullName);
    if (!result.error) {
      toast.success('Compte créé avec succès !');
    }
    return result;
  };

  return (
    <AuthComponent
      {...authConfig.props}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
    />
  );
};

export default AuthTest;
