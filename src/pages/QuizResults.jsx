import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';

/**
 * Pagina risultati dei quiz (risposte private salvate)
 * Effettua GET /api/v1/quizzes/getPrivateAnswers all'apertura
 * Formato risposta: Array<{ quizResultId, quizTitle, quizDescription, score, token, results (JSON string), takenAt }>
 */
const QuizResults = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getPrivateAnswers();
        setQuizResults(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Errore nel caricamento dei risultati');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return '-';
      return d.toLocaleString();
    } catch {
      return '-';
    }
  };

  const formatScore = (score) => {
    if (score == null || Number.isNaN(Number(score))) return '-';
    return `${Number(score).toFixed(1)}%`;
  };

  const handleSelectResult = (result) => {
    setSelectedResult(result);
  };

  const handleBackToList = () => {
    setSelectedResult(null);
  };

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

          {!loading && !error && (!quizResults || quizResults.length === 0) && (
            <div className="quiz-grid-empty">
              <h3>Nessun risultato disponibile</h3>
            </div>
          )}

          {!loading && !error && quizResults && quizResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {quizResults.map((qr, qrIdx) => {
                // Parse results JSON string
                let questions = [];
                try {
                  if (qr.results && typeof qr.results === 'string') {
                    questions = JSON.parse(qr.results);
                  } else if (Array.isArray(qr.results)) {
                    questions = qr.results;
                  }
                } catch (e) {
                  console.error('Failed to parse results for quiz', qr.quizResultId, e);
                }
                if (!Array.isArray(questions)) questions = [];

                return (
                  <div key={qr.quizResultId ?? qrIdx} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', background: '#fff' }}>
                    {/* Quiz info header */}
                    <div style={{ marginBottom: '1rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{qr.quizTitle || 'Quiz senza titolo'}</h3>
                      {qr.quizDescription && <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{qr.quizDescription}</p>}
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.95rem', color: '#555' }}>
                        <div><strong>Punteggio:</strong> {formatScore(qr.score)}</div>
                        <div><strong>Data:</strong> {formatDate(qr.takenAt)}</div>
                        {qr.token && <div><strong>Token:</strong> {qr.token}</div>}
                      </div>
                    </div>

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

                    {/* Questions table */}
                    {questions.length === 0 ? (
                      <p style={{ color: '#999', fontStyle: 'italic' }}>Nessuna domanda disponibile</p>
                    ) : (
                      <div className="table-responsive" style={{ overflowX: 'auto' }}>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;

