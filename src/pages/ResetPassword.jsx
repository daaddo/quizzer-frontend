import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nuova password"
                className="form-input"
                disabled={isSubmitting}
                autoComplete="new-password"
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Conferma nuova password"
                className="form-input"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
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


