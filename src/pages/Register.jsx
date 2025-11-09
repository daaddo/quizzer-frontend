import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import logo from '../assets/logo.png'
import FloatingLabelInput from '../components/FloatingLabelInput'
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            <img src={logo} alt="Quizzer" width="88" height="88" style={{ display: 'block', margin: '0 auto 0.5rem' }} />
            <h1 className="login-title" style={{ marginBottom: '0.5rem' }}>Registrazione</h1>
            <p className="login-subtitle" style={{ marginBottom: '1.25rem' }}>Crea il tuo account per iniziare</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="form-error general-error">
                {errors.general}
              </div>
            )}

            {/* Row 1: Username (full width) + Email (full width) */}
            <div className="register-grid" style={{ rowGap: '1.25rem' }}>
              <div className="form-group col-span-2" style={{ marginBottom: 0 }}>
                <FloatingLabelInput
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  label="Username"
                  disabled={loading}
                  maxLength={20}
                  autoComplete="username"
                  error={errors.username}
                />
              </div>
              <div className="form-group col-span-2" style={{ marginBottom: '1.75rem' }}>
                <FloatingLabelInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  label="Email"
                  disabled={loading}
                  autoComplete="email"
                  error={errors.email}
                />
              </div>
            </div>

            {/* Row 2: Password + Conferma Password */}
            <div className="register-grid">
              <div className="form-group col-span-2">
                <FloatingLabelInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  label="Password *"
                  disabled={loading}
                  autoComplete="new-password"
                  error={errors.password}
                  endButton={
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(p => !p)}
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
                  }
                />
              </div>
              <div className="form-group col-span-2">
                <FloatingLabelInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Conferma Password"
                  label="Conferma Password *"
                  disabled={loading}
                  autoComplete="new-password"
                  error={errors.confirmPassword}
                  endButton={
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      aria-label={showConfirmPassword ? 'Nascondi password' : 'Mostra password'}
                    >
                      {showConfirmPassword ? (
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
                  }
                />
              </div>
            </div>

            {/* Password policy hint wide */}
            <div className="form-hint" style={{ marginTop: 0, marginBottom: '1rem' }}>
              Minimo 8 caratteri con almeno 1 minuscola, 1 maiuscola e 1 numero
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn-auth-wide btn btn-primary btn-auth "
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
