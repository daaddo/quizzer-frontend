import React, { useState } from 'react'
import { authService } from '../services/auth'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)
    try {
      await authService.forgotPassword(email)
      setMessage('Se l\'email è registrata, riceverai un link per reimpostare la password.')
    } catch (err) {
      setError(err.message || 'Errore durante la richiesta di reset')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page auth-bg">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-card" style={{ maxWidth: 480, width: '100%' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Password dimenticata</h1>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Inserisci la tua email per ricevere il link di reset.
          </p>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
            {message && <div className="form-success" style={{ marginBottom: '0.75rem' }}>{message}</div>}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="form-input"
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !email.trim()}>
              {isSubmitting ? 'Invio in corso…' : 'Invia link di reset'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword


