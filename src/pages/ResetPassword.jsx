import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import FloatingLabelInput from '../components/FloatingLabelInput'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = useMemo(() => {
    let t = searchParams.get('token') || ''
    // Nel caso in cui venga passato un URL completo nel token
    if (t.includes('/api/v1/users/reset-password?token=')) {
      const parts = t.split('token=')
      if (parts.length > 1) t = parts[parts.length - 1]
    }
    return t
  }, [searchParams])

  useEffect(() => {
    if (!token) {
      setError('Token di reset mancante o non valido')
    }
  }, [token])

  const isValidPassword = passwordRegex.test(newPassword)
  const canSubmit = !!token && isValidPassword && newPassword === confirmPassword && !isSubmitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const resMsg = await authService.resetPassword(token, newPassword)
      setMessage(resMsg || 'Password aggiornata correttamente')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message || 'Errore durante il reset della password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page auth-bg">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-card" style={{ maxWidth: 480, width: '100%' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Reimposta password</h1>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Inserisci una nuova password. Requisiti: almeno 8 caratteri, 1 maiuscola, 1 minuscola e 1 numero.
          </p>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
            {message && <div className="form-success" style={{ marginBottom: '0.75rem' }}>{message}</div>}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <div className="password-input-wrapper">
                <FloatingLabelInput
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nuova password"
                  label="Nuova password"
                  className=""
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  autoFocus
                />
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
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <div className="password-input-wrapper">
                <FloatingLabelInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Conferma nuova password"
                  label="Conferma nuova password"
                  className=""
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
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
              </div>
            </div>
            {!isValidPassword && newPassword && (
              <div className="form-hint" style={{ marginBottom: '0.75rem' }}>
                La password deve contenere almeno 1 minuscola, 1 maiuscola e 1 numero e avere almeno 8 caratteri.
              </div>
            )}
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="form-hint" style={{ marginBottom: '0.75rem' }}>
                Le password non coincidono.
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {isSubmitting ? 'Aggiornamento…' : 'Conferma nuova password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword


