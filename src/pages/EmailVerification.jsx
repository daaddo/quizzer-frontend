import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';

/**
 * Pagina di verifica email tramite token
 */
const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Estrai il token dalla query string
        let tokenParam = searchParams.get('token');
        
        if (!tokenParam) {
          setStatus('error');
          setError('Token di verifica mancante');
          return;
        }

        console.log('🔍 Token raw ricevuto:', tokenParam);

        // Se il token contiene un URL completo, estrai solo il valore del token
        if (tokenParam.includes('/api/v1/auth/verify?token=')) {
          const urlParts = tokenParam.split('token=');
          if (urlParts.length > 1) {
            tokenParam = urlParts[urlParts.length - 1]; // Prendi l'ultimo valore dopo token=
            console.log('🔧 Token estratto dall\'URL:', tokenParam);
          }
        }

        setToken(tokenParam);
        console.log('✅ Token finale da usare:', tokenParam);
        
        // Chiama l'API di conferma
        await authService.confirmEmail(tokenParam);
        
        setStatus('success');
        
      } catch (error) {
        console.error('❌ Errore verifica email:', error);
        setStatus('error');
        setError(error.message || 'Errore durante la verifica dell\'email');
      }
    };

    verifyEmail();
  }, [searchParams]);

  // Stato di caricamento
  if (status === 'loading') {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="auth-card">
            <div className="verification-loading">
              <div className="loading-spinner-large"></div>
              <h1>Verifica Email</h1>
              <p>Stiamo verificando il tuo account...</p>
              <div className="form-hint">
                Token: {token || 'Estraendo token...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stato di successo
  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="auth-card success-card">
            <div className="success-icon">✅</div>
            <h1>Email Verificata!</h1>
            <div className="success-content">
              <p><strong>Congratulazioni!</strong> La tua email è stata verificata con successo.</p>
              <p>Il tuo account è ora attivo e puoi effettuare il login.</p>
            </div>
            <div className="success-actions">
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Vai al Login
              </button>
              <Link to="/" className="btn btn-secondary">
                Torna alla Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stato di errore
  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card error-card">
          <div className="error-icon">❌</div>
          <h1>Verifica Fallita</h1>
          <div className="error-content">
            <p>Si è verificato un errore durante la verifica della tua email:</p>
            <div className="error-message">
              {error}
            </div>
            
            <div className="error-details">
              <h4>Possibili cause:</h4>
              <ul>
                <li>Il link di verifica è scaduto</li>
                <li>Il token non è valido</li>
                <li>L'account è già stato verificato</li>
                <li>Problema temporaneo del server</li>
              </ul>
            </div>
          </div>
          
          <div className="error-actions">
            <Link to="/register" className="btn btn-primary">
              Registrati di Nuovo
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Prova il Login
            </Link>
            <Link to="/" className="btn btn-secondary">
              Torna alla Home
            </Link>
          </div>

          {token && (
            <div className="debug-info">
              <details>
                <summary>Informazioni tecniche</summary>
                <div className="debug-content">
                  <p><strong>Token:</strong> {token}</p>
                  <p><strong>Errore:</strong> {error}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
