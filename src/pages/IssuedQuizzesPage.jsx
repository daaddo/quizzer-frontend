import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';

const IssuedQuizzesPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | expired

  const now = useMemo(() => Date.now(), []);

  useEffect(() => {
    const load = async () => {
      if (!quizId) {
        setError('quizId mancante');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [q, issued] = await Promise.all([
          userApi.getQuizById(quizId),
          userApi.getIssuedQuizzes(quizId)
        ]);
        setQuiz(q);
        setItems(Array.isArray(issued) ? issued : []);
      } catch (e) {
        setError(e.message || 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  const formatDateTime = (value) => {
    if (!value && value !== 0) return '-';
    try {
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return '-';
      return d.toLocaleString();
    } catch {
      return String(value);
    }
  };

  const formatDuration = (value) => {
    if (!value && value !== 0) return '-';
    if (typeof value === 'string') return value; // es. HH:mm:ss
    const totalSeconds = typeof value === 'number' ? (value > 100000 ? Math.round(value / 1000) : value) : 0;
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const buildLink = (tokenId) => {
    if (typeof tokenId !== 'string' || !tokenId) return null;
    const origin = typeof window !== 'undefined' && window.location && window.location.origin ? window.location.origin : '';
    return `${origin}/takingquiz?token=${encodeURIComponent(tokenId)}`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Caricamento quiz creati</h2>
            <p>Recupero dei dati...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h2>Impossibile caricare</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Torna alla Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter((it) => {
    const expiresAtMs = it?.expiresAt ? new Date(it.expiresAt).getTime() : null;
    const isExpired = typeof expiresAtMs === 'number' && !Number.isNaN(expiresAtMs) ? expiresAtMs < now : false;
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return isExpired;
    return true;
  });

  return (
    <div className="dashboard">
      <div className="container">
        <div className="quiz-grid">
          <div className="quiz-section-header">
            <h2 className="quiz-section-title">Quiz creati — {quiz?.title || `Quiz #${quizId}`}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="view-toggle" role="tablist" aria-label="Filtro">
                <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>Tutti</button>
                <button className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('active')}>In corso</button>
                <button className={`btn ${filter === 'expired' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('expired')}>Scaduti</button>
              </div>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
            </div>
          </div>

          {(!items || items.length === 0) ? (
            <div className="quiz-grid-empty">
              <div className="empty-icon">📝</div>
              <h3>Nessun quiz creato per questo quiz</h3>
              <div className="empty-actions">
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Torna alla Dashboard</button>
              </div>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-gray">
                <thead>
                  <tr>
                    <th>Stato</th>
                    <th>Link</th>
                    <th>Domande</th>
                    <th>Emesso il</th>
                    <th>Scade il</th>
                    <th>Durata</th>
                    <th>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((it, idx) => {
                    const expiresAtMs = it?.expiresAt ? new Date(it.expiresAt).getTime() : null;
                    const isExpired = typeof expiresAtMs === 'number' && !Number.isNaN(expiresAtMs) ? expiresAtMs < now : false;
                    const link = buildLink(it?.tokenId);
                    return (
                      <tr key={idx} className={isExpired ? 'row-expired' : 'row-active'}>
                        <td>
                          <span className={`stat-badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>{isExpired ? 'Scaduto' : 'Attivo'}</span>
                        </td>
                        <td className="issued-link" style={{ wordBreak: 'break-all' }}>{link || '-'}</td>
                        <td>{it?.numberOfQuestions ?? '-'}</td>
                        <td>{formatDateTime(it?.issuedAt)}</td>
                        <td>{formatDateTime(it?.expiresAt)}</td>
                        <td>{formatDuration(it?.duration)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="quiz-action-btn secondary"
                              type="button"
                              disabled={!link}
                              onClick={() => link && navigator.clipboard.writeText(link)}
                            >Copia link</button>
                            {link ? (
                              isExpired ? (
                                <button className="quiz-action-btn primary" type="button" disabled aria-disabled="true">Apri</button>
                              ) : (
                                <button className="quiz-action-btn primary" type="button" onClick={() => navigate(`/takingquiz?token=${encodeURIComponent(it?.tokenId || '')}`)}>Apri</button>
                              )
                            ) : (
                              <button className="quiz-action-btn primary" type="button" disabled aria-disabled="true">Apri</button>
                            )}
                            <button
                              className="quiz-action-btn secondary"
                              type="button"
                              disabled={!it?.tokenId}
                              onClick={() => navigate(`/issued/${encodeURIComponent(it?.tokenId || '')}`)}
                            >Dettagli</button>
                          </div>
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

export default IssuedQuizzesPage;


