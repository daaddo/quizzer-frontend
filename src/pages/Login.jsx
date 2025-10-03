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
    <div className="auth-page auth-bg">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-card login-card">
            <div className="login-header">
              <img src="/src/assets/logo.png" alt="Quizzer" width="88" height="88" style={{ display: 'block', margin: '0 auto 0.5rem' }} />
              <h1 className="login-title" style={{ textAlign: 'center' }}>Accesso Quizzer</h1>
              <p className="login-subtitle" style={{ textAlign: 'center' }}>
                Accedi al tuo account per entrare nella tua area personale
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Username o email"
                  className="form-input"
                  disabled={isSubmitting}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Password"
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
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 5C7 5 3.1 8.1 1.5 12c.6 1.4 1.6 2.8 2.8 3.9M20.7 16c1-1.1 1.8-2.3 2.3-4-1.6-3.9-5.6-7-11-7-1.2 0-2.4.2-3.5.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 5C6.5 5 2 9 1 12c1 3 5.5 7 11 7s10-4 11-7c-1-3-5.5-7-11-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '0.125rem' }}>
                <button 
                  type="submit" 
                  className="btn login-btn"
                  disabled={isSubmitting || !formData.username.trim() || !formData.password.trim()}
                >
                  {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
                </button>
              </div>

              
            </form>

            
            <div className="oauth-divider">
              <span>Oppure con</span>
            </div>

            <div className="oauth-buttons" style={{ marginTop: 0 }}>
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
              
            </div>

            <div className="login-footer">
              <p>
                Non hai ancora un account? <Link to="/register">Registrati qui</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;

