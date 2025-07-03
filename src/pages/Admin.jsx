import React from 'react'
import { Link } from 'react-router-dom'
import QuestionsList from '../components/QuestionsList'

const Admin = () => {
  return (
    <div className="admin-container">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">Dashboard Amministratore</h1>
          <p className="admin-subtitle">
            Gestisci quiz, utenti e contenuti dalla tua dashboard centralizzata
          </p>
        </div>

        {/* Sezione per la gestione delle domande */}
        <QuestionsList />

        {/* Manteniamo i card originali per le altre funzionalità */}
        <div className="admin-dashboard">
          <div className="admin-card">
            <div className="admin-card-icon">👥</div>
            <h3 className="admin-card-title">Gestione Utenti</h3>
            <p className="admin-card-description">
              Amministra account utente, assegna ruoli e monitora l'attività della piattaforma.
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">📈</div>
            <h3 className="admin-card-title">Statistiche</h3>
            <p className="admin-card-description">
              Visualizza rapporti dettagliati su performance, utilizzo e tendenze degli utenti.
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🏷️</div>
            <h3 className="admin-card-title">Categorie</h3>
            <p className="admin-card-description">
              Organizza i contenuti per materia, argomento e livello di difficoltà.
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">⚙️</div>
            <h3 className="admin-card-title">Impostazioni</h3>
            <p className="admin-card-description">
              Configura le impostazioni generali, notifiche e personalizzazioni del sistema.
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">📊</div>
            <h3 className="admin-card-title">Report</h3>
            <p className="admin-card-description">
              Genera ed esporta report personalizzati su attività e performance.
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">🔔</div>
            <h3 className="admin-card-title">Notifiche</h3>
            <p className="admin-card-description">
              Gestisci le comunicazioni e gli avvisi automatici per gli utenti.
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">💾</div>
            <h3 className="admin-card-title">Backup</h3>
            <p className="admin-card-description">
              Gestisci backup dei dati e ripristino delle informazioni del sistema.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/" className="btn">
            Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Admin 