import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Percorso di destinazione dopo il login (salvato da ProtectedRoute)
  const from = location.state?.from || '/dashboard';

  // Se già autenticato, reindirizza
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Pulisci errori quando l'utente modifica i campi
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.username, formData.password]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      throw new Error('Username o email richiesti');
    }
    if (!formData.password.trim()) {
      throw new Error('Password richiesta');
    }
    if (formData.password.length < 3) {
      throw new Error('Password troppo corta');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      validateForm();
      
      await login({
        username: formData.username.trim(),
        password: formData.password
      });
      
      // Il reindirizzamento sarà gestito dall'useEffect
      
    } catch (error) {
      // L'errore è già gestito dal context
      console.error('Errore login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-container">
      <div className="container">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">🔐 Accesso Quizzer</h1>
              <p className="login-subtitle">
                Accedi al tuo account per entrare nella tua area personale
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="form-error">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username o Email *</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Inserisci username o email"
                  className="form-input"
                  disabled={isSubmitting}
                  autoComplete="username"
                  autoFocus
                />
                <small className="input-help">
                  Puoi usare sia il tuo username che l'indirizzo email
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Inserisci la tua password"
                    className="form-input"
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="password-toggle"
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-large login-btn"
                  disabled={isSubmitting || !formData.username.trim() || !formData.password.trim()}
                >
                  {isSubmitting ? '⏳ Accesso in corso...' : '🚀 Accedi'}
                </button>
              </div>

              <div className="login-info">
                <div className="remember-me-info">
                  <span className="info-icon">💾</span>
                  <small>
                    Il sistema ricorderà automaticamente le tue credenziali per accessi futuri
                  </small>
                </div>
              </div>
            </form>

            <div className="oauth-divider">
              <span>Oppure</span>
            </div>

            <div className="oauth-buttons">
              <a
                href="http://localhost:8080/oauth2/authorization/google"
                className="btn-google"
                aria-label="Accedi con Google"
                onClick={() => {
                  try {
                    sessionStorage.setItem('postLoginRedirect', from);
                  } catch {}
                }}
              >
                <span className="btn-google-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
                    <path fill="#FFC107" d="M43.611,20.083h-1.611V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12   s5.373-12,12-12c3.059,0,5.842,1.151,7.961,3.039l5.657-5.657C35.202,6.053,29.905,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20   s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.151,7.961,3.039l5.657-5.657   C35.202,6.053,29.905,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.191-5.238C29.211,35.091,26.715,36,24,36   c-5.202,0-9.616-3.317-11.284-7.955l-6.51,5.02C9.499,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083h-1.611V20H24v8h11.303c-0.792,2.237-2.231,4.166-3.985,5.571   c0.001-0.001,0.002-0.001,0.003-0.002l6.191,5.238C36.996,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                </span>
                <span className="btn-google-text">Accedi con Google</span>
              </a>
              <div className="login-hint">
                <small>Accedi con il tuo account Google</small>
              </div>
            </div>

            <div className="login-footer">
              <p>
                Non hai ancora un account? <Link to="/register">Registrati qui</Link>
              </p>
              <Link to="/" className="btn btn-secondary">
                ← Torna alla Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

