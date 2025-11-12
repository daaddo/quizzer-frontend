import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';

/**
 * Pagina risultati dei quiz (risposte private salvate)
 * Effettua GET /api/v1/quizzes/getPrivateAnswers all'apertura
 * Supporta sia il nuovo formato (titolo/descrizione/risposte) sia fallback al vecchio.
 */
const QuizResults = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getPrivateAnswers();
        // Normalizza: può arrivare direttamente l'array, oppure un wrapper { domande: [...] } o { questions: [...] }
        let q = [];
        if (Array.isArray(data)) {
          q = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.domande)) q = data.domande;
          else if (Array.isArray(data.questions)) q = data.questions;
        }
        setQuestions(Array.isArray(q) ? q : []);
      } catch (e) {
        setError(e.message || 'Errore nel caricamento dei risultati');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="quiz-grid">
          <div className="quiz-section-header">
            <h2 className="quiz-section-title">Risultati quiz</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
            </div>
          </div>

          {loading && (
            <div className="dashboard-loading" style={{ marginTop: 0 }}>
              <div className="loading-content">
                <div className="loading-spinner-large"></div>
                <h2>Caricamento risultati</h2>
                <p>Recupero dei dati...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="dashboard-error" style={{ marginTop: 0 }}>
              <div className="error-content">
                <h2>Impossibile caricare</h2>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (!questions || questions.length === 0) && (
            <div className="quiz-grid-empty">
              <h3>Nessun risultato disponibile</h3>
            </div>
          )}

          {!loading && !error && questions && questions.length > 0 && (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              {/* Legenda */}
              <table className="table table-gray" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', width: '120px' }}>Stato</th>
                    <th style={{ textAlign: 'left' }}>Significato</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#0b7' }}></span></td>
                    <td>Risposte giuste selezionate</td>
                  </tr>
                  <tr>
                    <td><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#0d6efd' }}></span></td>
                    <td>Risposte giuste non selezionate</td>
                  </tr>
                  <tr>
                    <td><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#dc3545' }}></span></td>
                    <td>Risposte sbagliate selezionate</td>
                  </tr>
                </tbody>
              </table>

              <table className="table table-gray" style={{ width: '100%', borderCollapse: 'collapse' }} cellPadding="4" cellSpacing="0">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Titolo</th>
                    <th style={{ textAlign: 'left' }}>Domanda</th>
                    <th style={{ textAlign: 'left' }}>Risposte</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, qIdx) => {
                    const title = q?.titolo ?? q?.title ?? '-';
                    const questionText = q?.descrizione ?? q?.question ?? '-';
                    const answers = Array.isArray(q?.risposte) ? q.risposte : (Array.isArray(q?.answers) ? q.answers : []);
                    return (
                      <tr key={q?.id ?? qIdx}>
                        <td style={{ paddingTop: 2, paddingBottom: 2, lineHeight: 1.2 }}>{title}</td>
                        <td style={{ whiteSpace: 'pre-wrap', paddingTop: 2, paddingBottom: 2, lineHeight: 1.2 }}>{questionText}</td>
                        <td>
                          <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                            {answers.map((a, aIdx) => {
                              const isSelected = a?.chosen === true;
                              const isCorrect = a?.corretta === true || a?.correct === true;
                              let color;
                              if (isCorrect && isSelected) color = '#0b7';
                              else if (isCorrect && !isSelected) color = '#0d6efd';
                              else if (!isCorrect && isSelected) color = '#dc3545';
                              return (
                                <li key={a?.id ?? aIdx} style={{ color }}>
                                  {a?.testo ?? a?.answer}
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;

