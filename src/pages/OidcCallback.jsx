import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storeToken, getStoredToken } from '../utils/jwt.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const OidcCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus, error: authError, clearError } = useAuth();
  const [status, setStatus] = useState('Elaborazione login...');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    // Try token in query first
    let token = url.searchParams.get('token');
    // Fallback: sometimes placed in hash
    if (!token && url.hash) {
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
      token = hashParams.get('token');
    }

    const finalize = async () => {
      try {
        if (token) {
          // Se il backend fornisce anche JWT, supportalo
          storeToken(token);
        }
        // In ogni caso, verifica lo stato (sessione o JWT)
        await checkAuthStatus();

        // Determine redirect target
        const saved = sessionStorage.getItem('postLoginRedirect');
        const target = saved || '/dashboard';
        sessionStorage.removeItem('postLoginRedirect');

        setStatus('Login completato, reindirizzamento in corso...');
        navigate(target, { replace: true });
      } catch (err) {
        console.error('OIDC callback error:', err);
        setLocalError(err.message || 'Errore durante la gestione della callback');
      }
    };

    // Clear previous errors and start
    if (authError) clearError();
    finalize();
  }, []);

  return (
    <div className="auth-loading">
      <div className="container">
        <div className="loading-spinner"></div>
        {!localError ? (
          <p>{status}</p>
        ) : (
          <div className="error-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <p><strong>Accesso con Google non riuscito</strong></p>
              <div className="error-message">{localError}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OidcCallback;


