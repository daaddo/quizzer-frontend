import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'

const Welcome = () => {
  const { isAuthenticated, username } = useAuth();

  return (
    <div className="welcome-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="logo-container">
              <span className="logo-badge large">
                <img src={logo} alt="Quizzer" />
              </span>
            </div>
            <h1 className="hero-title">
              {isAuthenticated ? `Bentornato, ${username}!` : 'Benvenuto su Quizzer'}
            </h1>
            <p className="hero-subtitle">
              La piattaforma completa per creare, gestire e condividere quiz interattivi
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Vai alla Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    Inizia Ora
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-large">
                    Accedi
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Cosa puoi fare con Quizzer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Crea Quiz Personalizzati</h3>
              <p className="feature-description">
                Crea quiz su misura con domande a risposta singola o multipla. 
                Organizza le tue domande e condividile con il mondo.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-title">Genera Link Condivisibili</h3>
              <p className="feature-description">
                Genera link unici per i tuoi quiz con configurazioni personalizzate: 
                durata, numero di domande, data di scadenza e molto altro.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Monitora i Risultati</h3>
              <p className="feature-description">
                Visualizza statistiche dettagliate sui tentativi degli utenti, 
                analizza le performance e scarica i risultati in formato CSV.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Quiz Pubblici</h3>
              <p className="feature-description">
                Esplora quiz pubblici creati dalla community, 
                mettiti alla prova e scopri nuovi argomenti interessanti.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3 className="feature-title">Test Cronometrati</h3>
              <p className="feature-description">
                Imposta limiti di tempo per i tuoi quiz e crea sfide avvincenti 
                per testare le conoscenze degli utenti.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✏️</div>
              <h3 className="feature-title">Gestione Completa</h3>
              <p className="feature-description">
                Modifica, elimina e organizza i tuoi quiz in qualsiasi momento. 
                Gestisci domande e risposte con facilità.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2 className="cta-title">Pronto a iniziare?</h2>
          <p className="cta-description">
            Unisciti a Quizzer oggi e inizia a creare quiz coinvolgenti in pochi minuti
          </p>
          <div className="cta-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Vai alla Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Registrati Gratuitamente
                </Link>
                <Link to="/public-quizzes" className="btn btn-secondary btn-large">
                  Esplora Quiz Pubblici
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Welcome 