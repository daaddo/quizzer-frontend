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

            <div className="login-footer">
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

