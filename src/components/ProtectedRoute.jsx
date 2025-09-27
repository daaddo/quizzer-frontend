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

  // Durante il loading non mostra alcun container
  if (isLoading) {
    return null;
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

