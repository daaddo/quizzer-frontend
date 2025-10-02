import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';
import UpdateExpirationModal from '../components/UpdateExpirationModal';

const IssuedQuizInfosPage = () => {
  const navigate = useNavigate();
  const { tokenId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [expModal, setExpModal] = useState({ isOpen: false, token: null, initial: null });
  const [modalLoading, setModalLoading] = useState(false);

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

  const normalizeDateTimeLocalToSeconds = (value) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return value;
    return null;
  };

  const handleDeleteAttempt = async (userId) => {
    try {
      const ok = window.confirm('Confermi l\'eliminazione del tentativo di questo utente?');
      if (!ok) return;
      await userApi.deleteAttempt(tokenId, userId);
      setItems((prev) => prev.filter((x) => x?.userId !== userId));
      alert('Tentativo eliminato');
    } catch (e) {
      alert(e.message || 'Errore eliminazione tentativo');
    }
  };

  const openUpdateExpiration = () => {
    setExpModal({ isOpen: true, token: tokenId, initial: null });
  };

  const handleConfirmUpdateExpiration = async (datetimeLocal) => {
    const normalized = normalizeDateTimeLocalToSeconds(datetimeLocal);
    if (!normalized) {
      alert('Data non valida');
      return;
    }
    try {
      setModalLoading(true);
      await userApi.updateIssuedExpiration(tokenId, normalized);
      setExpModal({ isOpen: false, token: null, initial: null });
      alert('Scadenza aggiornata');
    } catch (e) {
      alert(e.message || 'Errore aggiornamento scadenza');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelUpdateExpiration = () => {
    setExpModal({ isOpen: false, token: null, initial: null });
  };

  const handleUpdateNumberOfQuestions = async () => {
    try {
      const input = window.prompt('Nuovo numero di domande (> 0). Annulla per uscire.');
      if (input == null || input.trim() === '') return;
      const n = parseInt(input, 10);
      if (!Number.isFinite(n) || n < 1) {
        alert('Numero non valido');
        return;
      }
      await userApi.updateIssuedNumberOfQuestions(tokenId, n);
      alert('Numero di domande aggiornato');
    } catch (e) {
      alert(e.message || 'Errore aggiornamento numero domande');
    }
  };

  const handleDeleteIssued = async () => {
    try {
      const ok = window.confirm('Confermi l\'eliminazione di questo issued? Azione irreversibile.');
      if (!ok) return;
      await userApi.deleteIssuedQuiz(tokenId);
      alert('Issued eliminato');
      navigate(-1);
    } catch (e) {
      alert(e.message || 'Errore eliminazione issued');
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
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
              <button className="btn btn-secondary" onClick={openUpdateExpiration}>Scadenza</button>
              <button className="btn btn-secondary" onClick={handleUpdateNumberOfQuestions}>Domande</button>
              <button className="btn btn-secondary" onClick={handleDeleteIssued}>Elimina issued</button>
            </div>
          </div>

          {(!items || items.length === 0) ? (
            <div className="quiz-grid-empty">
              <div className="empty-icon">📝</div>
              <h3>Nessun tentativo per questo quiz</h3>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-gray" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Utente</th>
                    <th style={{ textAlign: 'left' }}>Stato</th>
                    <th style={{ textAlign: 'left' }}>Punteggio</th>
                    <th style={{ textAlign: 'left' }}>Iniziato</th>
                    <th style={{ textAlign: 'left' }}>Finito</th>
                    <th style={{ textAlign: 'left' }}>Azione</th>
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
                      <td>
                        <div className="table-actions">
                          <button
                            className="quiz-action-btn secondary"
                            type="button"
                            disabled={!it?.userId}
                            onClick={() => it?.userId && handleDeleteAttempt(it.userId)}
                          >Elimina tentativo</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <UpdateExpirationModal
        isOpen={expModal.isOpen}
        token={expModal.token}
        initialExpiration={expModal.initial}
        loading={modalLoading}
        onConfirm={handleConfirmUpdateExpiration}
        onCancel={handleCancelUpdateExpiration}
      />
    </div>
  );
};

export default IssuedQuizInfosPage;



