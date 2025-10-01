import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/auth.js';

// Creazione del Context
const AuthContext = createContext(null);

// Hook personalizzato per usare il Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};

// Provider del Context di autenticazione
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verifica lo stato di autenticazione SOLO una volta al mount
  const hasCheckedRef = useRef(false);
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    checkAuthStatus();
  }, []);

  /**
   * Verifica lo stato di autenticazione corrente basandosi sul JWT token
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authStatus = await authService.checkAuthStatus();
      
      if (authStatus.authenticated && authStatus.user) {
        setUser({
          id: authStatus.user.id,
          username: authStatus.user.username,
          email: authStatus.user.email,
          exp: authStatus.user.exp,
          iat: authStatus.user.iat
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // Se c'è un messaggio di errore specifico (es. token scaduto), mostralo
        if (authStatus.message && authStatus.message !== 'Nessun token di autenticazione') {
          setError(authStatus.message);
        }
      }
    } catch (error) {
      console.error('Errore verifica autenticazione:', error);
      setError('Errore di connessione al server');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effettua il login con le credenziali fornite
   * @param {Object} credentials - {username: string, password: string}
   */
  const login = async (credentials) => {
    try {
      setError(null);
      
      const loginResult = await authService.login(credentials);
      
      if (loginResult.success && loginResult.user) {
        // Aggiorna immediatamente lo stato con i dati dal JWT
        setUser({
          id: loginResult.user.id,
          username: loginResult.user.username,
          email: loginResult.user.email,
          exp: loginResult.user.exp,
          iat: loginResult.user.iat
        });
        setIsAuthenticated(true);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Errore login:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Effettua il logout
   */
  const logout = async () => {
    try {
      setError(null);
      
      await authService.logout();
      
      // Pulisci lo stato locale
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Errore logout:', error);
      // Anche se il logout server-side fallisce, pulisci lo stato locale
      setUser(null);
      setIsAuthenticated(false);
      setError('Errore durante il logout, ma sei stato disconnesso localmente');
    }
  };

  /**
   * Pulisce gli errori
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Ricarica lo stato di autenticazione
   */
  const refreshAuth = async () => {
    await checkAuthStatus();
  };



  // Valore del context che sarà disponibile ai componenti figli
  const contextValue = {
    // Stato
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Azioni
    login,
    logout,
    checkAuthStatus: refreshAuth,
    clearError,
    
    // Utility
    username: user?.username || null,
    email: user?.email || null,
    userId: user?.id || null
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

