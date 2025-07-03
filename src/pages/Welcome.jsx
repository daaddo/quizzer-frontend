import React from 'react'
import { Link } from 'react-router-dom'

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="container">
        <h1 className="welcome-title">Benvenuto su Quizzer!</h1>
        <p className="welcome-subtitle">
          La piattaforma definitiva per creare e gestire quiz interattivi
        </p>
        
        <div className="welcome-cta">
          <Link to="/quiz" className="btn btn-large cta-button">
            🧠 Inizia un Nuovo Quiz
          </Link>
          <Link to="/admin" className="btn btn-secondary">
            ⚙️ Dashboard Admin
          </Link>
        </div>

        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">Quiz Intelligenti</h3>
            <p className="feature-description">
              Crea quiz personalizzati con domande multiple choice, vero/falso e risposta aperta. 
              Il nostro sistema ti aiuta a creare contenuti educativi di qualità.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Analisi Dettagliate</h3>
            <p className="feature-description">
              Monitora le performance dei tuoi studenti con grafici e statistiche avanzate. 
              Identifica aree di miglioramento e traccia i progressi nel tempo.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Gestione Semplice</h3>
            <p className="feature-description">
              Interfaccia intuitiva per amministratori ed educatori. Gestisci utenti, 
              contenuti e impostazioni con facilità dalla dashboard admin.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Mobile Friendly</h3>
            <p className="feature-description">
              Accesso completo da qualsiasi dispositivo. I tuoi quiz funzionano perfettamente 
              su desktop, tablet e smartphone per massima flessibilità.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Risultati Istantanei</h3>
            <p className="feature-description">
              Feedback immediato per studenti e insegnanti. Visualizza i risultati in tempo reale 
              e ricevi notifiche automatiche sui progressi.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Sicuro e Affidabile</h3>
            <p className="feature-description">
              I tuoi dati sono protetti con le più moderne tecnologie di sicurezza. 
              Backup automatici e protezione completa della privacy degli utenti.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome 