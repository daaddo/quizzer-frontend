// Re-export del hook dal context per convenienza
import { useAuth as useAuthContext } from '../contexts/AuthContext';

export const useAuth = useAuthContext;

// Hook aggiuntivi per casi d'uso specifici

/**
 * Hook per verificare se l'utente ha permessi specifici
 * (Per future implementazioni di ruoli/permessi)
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuthContext();
  
  return {
    isAdmin: isAuthenticated && user?.role === 'admin',
    isUser: isAuthenticated && user?.role === 'user',
    canCreateQuestions: isAuthenticated,
    canDeleteQuestions: isAuthenticated,
    canTakeQuiz: isAuthenticated
  };
};

/**
 * Hook per gestire redirect dopo login
 */
export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuthContext();
  
  const redirectAfterLogin = (intendedPath = '/') => {
    if (isAuthenticated) {
      return intendedPath;
    }
    return '/login';
  };
  
  return { redirectAfterLogin };
};
