import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente per proteggere le route che richiedono autenticazione
 * Reindirizza al login se l'utente non è autenticato
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostra un loading spinner mentre verifica l'autenticazione
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="container">
          <div className="loading-spinner"></div>
          <p>Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  // Se non autenticato, reindirizza al login salvando la destinazione originale
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // Se autenticato, mostra il contenuto protetto
  return children;
};

export default ProtectedRoute;

