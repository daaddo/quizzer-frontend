import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Welcome = () => {
  const { isAuthenticated, username, isLoading } = useAuth();

  return (
    <div className="welcome-container">
      <div className="container">
        <h1 className="welcome-title">
          {isAuthenticated ? `Bentornato, ${username}!` : 'Benvenuto su Quizzer!'}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <span className="logo-badge large">
            <img src="/src/assets/logo.png" alt="Quizzer" />
          </span>
        </div>
        <p className="welcome-subtitle">
          {isAuthenticated ? 
            'Benvenuto nella tua area personale' :
            'La tua piattaforma per l\'apprendimento e la crescita'
          }
        </p>
        
        <div className="welcome-cta">
          {isLoading ? (
            <div className="auth-loading">
              <div className="loading-spinner"></div>
              <p>Caricamento...</p>
            </div>
          ) : isAuthenticated ? (
            <div className="authenticated-welcome">
              <p>Sei già connesso! Esplora le funzionalità disponibili.</p>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-large cta-button">
                Accedi per Iniziare
              </Link>
              <div className="login-hint">
                <small>Effettua l'accesso per accedere alle tue funzionalità personali</small>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
          <Link to="/dashboard" className="btn btn-primary btn-large">
            Vai alla Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Welcome 