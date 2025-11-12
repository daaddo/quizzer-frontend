import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Pagina per visualizzare i risultati dei quiz pubblici
 */
const QuizResults = () => {
  return (
    <div className="quiz-results-page">
      <div className="container">
        {/* Hero Section */}
        <section className="results-hero">
          <div className="results-hero-content">
            <h1 className="results-title">Risultati dei Quiz</h1>
            <p className="results-subtitle">
              Esplora i risultati e le statistiche dei quiz pubblici completati
            </p>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="coming-soon-section">
          <div className="coming-soon-card">
            <div className="coming-soon-icon">📊</div>
            <h2 className="coming-soon-title">Funzionalità in Arrivo</h2>
            <p className="coming-soon-description">
              Questa sezione è attualmente in fase di sviluppo. 
              Presto potrai visualizzare statistiche dettagliate, classifiche e risultati dei quiz pubblici.
            </p>
            
            <div className="features-preview">
              <h3 className="preview-title">Cosa troverai qui:</h3>
              <ul className="preview-list">
                <li>
                  <span className="preview-icon">📈</span>
                  <span className="preview-text">Statistiche globali dei quiz pubblici</span>
                </li>
                <li>
                  <span className="preview-icon">🏆</span>
                  <span className="preview-text">Classifiche e top performers</span>
                </li>
                <li>
                  <span className="preview-icon">📋</span>
                  <span className="preview-text">Storico dei tuoi tentativi</span>
                </li>
                <li>
                  <span className="preview-icon">📊</span>
                  <span className="preview-text">Analisi dettagliate delle performance</span>
                </li>
                <li>
                  <span className="preview-icon">🎯</span>
                  <span className="preview-text">Confronto con altri utenti</span>
                </li>
              </ul>
            </div>

            <div className="coming-soon-actions">
              <Link to="/public-quizzes" className="btn btn-primary btn-large">
                Esplora Quiz Pubblici
              </Link>
              <Link to="/dashboard" className="btn btn-secondary btn-large">
                Vai alla Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="info-section">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🔔</div>
              <h3 className="info-title">Resta Aggiornato</h3>
              <p className="info-description">
                Stiamo lavorando per offrirti la migliore esperienza possibile. 
                Questa funzionalità sarà disponibile a breve.
              </p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">💡</div>
              <h3 className="info-title">Nel Frattempo</h3>
              <p className="info-description">
                Continua a creare e completare quiz per costruire il tuo storico personale 
                e prepararti alle nuove funzionalità.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuizResults;

