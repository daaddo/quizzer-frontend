import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';

const IssuedQuizInfosPage = () => {
  const navigate = useNavigate();
  const { tokenId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!tokenId) {
        setError('Token mancante');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getIssuedQuizInfos(tokenId);
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tokenId]);

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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Caricamento tentativi</h2>
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
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="quiz-grid">
          <div className="quiz-section-header">
            <h2 className="quiz-section-title">Tentativi — Token: {tokenId}</h2>
            <div>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
            </div>
          </div>

          {(!items || items.length === 0) ? (
            <div className="quiz-grid-empty">
              <div className="empty-icon">📝</div>
              <h3>Nessun tentativo per questo quiz</h3>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Utente</th>
                    <th style={{ textAlign: 'left' }}>Stato</th>
                    <th style={{ textAlign: 'left' }}>Punteggio</th>
                    <th style={{ textAlign: 'left' }}>Iniziato</th>
                    <th style={{ textAlign: 'left' }}>Finito</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it?.username ?? it?.userId ?? '-'}</td>
                      <td>{it?.status ?? '-'}</td>
                      <td>{it?.score ?? '-'}</td>
                      <td>{formatDateTime(it?.attemptedAt)}</td>
                      <td>{formatDateTime(it?.finishedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuedQuizInfosPage;



