import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

/**
 * Pagina di registrazione utente
 */
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Regex per validazione password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Handler per cambio input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Rimuovi errore quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validazione form
  const validateForm = () => {
    const newErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'Lo username è obbligatorio';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Lo username deve essere tra 3 e 20 caratteri';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'La email è obbligatoria';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'La email deve avere un formato valido';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'La password è obbligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La password deve essere di almeno 8 caratteri';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'La password deve contenere almeno 1 minuscola, 1 maiuscola e 1 numero';
    }

    // Conferma password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La conferma password è obbligatoria';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler per invio form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      // Chiamata API registrazione
      await authService.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      setSuccess(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Gestisci errori specifici del server
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('username already in use') || msg.includes('username')) {
        setErrors({ username: 'Username già in uso' });
      } else if (msg.includes('email already in use') || msg.includes('email')) {
        setErrors({ email: 'Email già registrata' });
      } else {
        setErrors({ general: error.message || 'Errore durante la registrazione' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Se registrazione completata con successo
  if (success) {
    return (
      <div className="auth-page" style={{ display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 140px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="auth-card success-card">
            <div className="success-icon">✅</div>
            <h1>Registrazione Completata!</h1>
            <div className="success-content">
              <p>La tua registrazione è stata completata con successo.</p>
              <p><strong>Controlla la tua email</strong> per confermare l'account.</p>
              <p>Clicca sul link di verifica che ti abbiamo inviato per attivare il tuo account.</p>
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

  return (
    <div className="auth-page auth-bg">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-card">
          <div className="auth-header" style={{ textAlign: 'center' }}>
            <h1 className="login-title" style={{ marginBottom: '0.5rem' }}>Registrazione</h1>
            <p className="login-subtitle">Crea il tuo account per iniziare</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="form-error general-error">
                {errors.general}
              </div>
            )}

            {/* Row 1: Username (full width) + Email (full width) */}
            <div className="register-grid" style={{ rowGap: '0.75rem' }}>
              <div className="form-group col-span-2" style={{ marginBottom: 0 }}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Username"
                  disabled={loading}
                  maxLength={20}
                  autoComplete="username"
                />
                {errors.username && (
                  <div className="form-error">{errors.username}</div>
                )}
              </div>
              <div className="form-group col-span-2" style={{ marginBottom: '0.5rem' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Email"
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && (
                  <div className="form-error">{errors.email}</div>
                )}
              </div>
            </div>

            {/* Row 2: Password + Conferma Password */}
            <div className="register-grid">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Inserisci la password"
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <div className="form-error">{errors.password}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Conferma Password *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Ripeti la password"
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <div className="form-error">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            {/* Password policy hint wide */}
            <div className="form-hint" style={{ marginTop: 0, marginBottom: '1rem' }}>
              Minimo 8 caratteri con almeno 1 minuscola, 1 maiuscola e 1 numero
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn btn-primary btn-auth btn-auth-wide"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Registrazione...
                </>
              ) : (
                'Registrati'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Hai già un account? <Link to="/login">Accedi qui</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
