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

  // Se non autenticato, reindirizza al login salvo che la rotta sia già login o register
  if (!isAuthenticated) {
    if (location.pathname === '/login' || location.pathname === '/register') {
      return children;
    }
    const fullUri = `${location.pathname}${location.search}${location.hash}`;
    console.log('[ProtectedRoute] Redirect a /login. URI richiesto:', fullUri);
    localStorage.setItem('postLoginRedirect', fullUri);
    try {
      if (location.pathname === '/takingquiz' && location.search) {
        const token = new URLSearchParams(location.search).get('token');
        if (token) {
          localStorage.setItem('pendingTakingQuizToken', token);
          console.log('[ProtectedRoute] Token takingquiz salvato per post-login:', token);
        }
      }
    } catch {}
    return (
      <Navigate 
        to="/login" 
        state={{ from: fullUri }}
        replace 
      />
    );
  }

  // Se autenticato, mostra il contenuto protetto
  return children;
};

export default ProtectedRoute;

