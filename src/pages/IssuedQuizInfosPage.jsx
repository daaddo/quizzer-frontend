import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';
import EditIssuedModal from '../components/EditIssuedModal';
import AttemptResultsModal from '../components/AttemptResultsModal';

const IssuedQuizInfosPage = () => {
  const navigate = useNavigate();
  const { tokenId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [editModal, setEditModal] = useState({ isOpen: false, token: null, initialNumber: null, initialExpiration: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [resultsModal, setResultsModal] = useState({ isOpen: false, loading: false, error: null, questions: [], selectionsByQuestion: {} });

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

  const openEditIssued = () => {
    setEditModal({ isOpen: true, token: tokenId, initialNumber: null, initialExpiration: null });
  };

  const handleConfirmEditIssued = async ({ numberOfQuestions, expirationDate }) => {
    try {
      setModalLoading(true);
      if (numberOfQuestions != null) {
        await userApi.updateIssuedNumberOfQuestions(tokenId, numberOfQuestions);
      }
      if (expirationDate != null) {
        const normalized = normalizeDateTimeLocalToSeconds(expirationDate);
        if (!normalized) throw new Error('Data scadenza non valida');
        await userApi.updateIssuedExpiration(tokenId, normalized);
      }
      setEditModal({ isOpen: false, token: null, initialNumber: null, initialExpiration: null });
      alert('Issued aggiornato');
    } catch (e) {
      alert(e.message || 'Errore aggiornamento issued');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelEditIssued = () => {
    setEditModal({ isOpen: false, token: null, initialNumber: null, initialExpiration: null });
  };

  // Eliminazione issued non esposta qui per richiesta: rimossa dalla UI

  const handleOpenResults = async (attemptItem) => {
     try {
      // Parse selections map from attempt
      let selectionsMap = {};
      try {
        if (attemptItem && typeof attemptItem.questions === 'string') {
          const parsed = JSON.parse(attemptItem.questions || '{}') || {};
          // normalize to questionId -> selectedOptions[]
          selectionsMap = Object.fromEntries(Object.entries(parsed).map(([qid, v]) => [Number(qid), Array.isArray(v?.selectedOptions) ? v.selectedOptions : []]));
        } else if (attemptItem && typeof attemptItem.questions === 'object' && attemptItem.questions) {
          const obj = attemptItem.questions;
          selectionsMap = Object.fromEntries(Object.entries(obj).map(([qid, v]) => [Number(qid), Array.isArray(v?.selectedOptions) ? v.selectedOptions : []]));
        }
      } catch {}
      setResultsModal({ isOpen: true, loading: true, error: null, questions: [], selectionsByQuestion: selectionsMap });
      let questionsPayload = {};
      try {
        if (attemptItem && typeof attemptItem.questions === 'string') {
          questionsPayload = JSON.parse(attemptItem.questions || '{}') || {};
        } else if (attemptItem && typeof attemptItem.questions === 'object' && attemptItem.questions) {
          questionsPayload = attemptItem.questions;
        }
      } catch {}
      const data = await userApi.getQuestionsByTokenWithPayload(tokenId, questionsPayload);
      setResultsModal((prev) => ({ ...prev, isOpen: true, loading: false, error: null, questions: Array.isArray(data) ? data : [] }));
    } catch (e) {
      setResultsModal((prev) => ({ ...prev, isOpen: true, loading: false, error: e.message || 'Errore caricamento risultati', questions: [] }));
    }
  };

  const handleCloseResults = () => {
    setResultsModal({ isOpen: false, loading: false, error: null, questions: [], selectionsByQuestion: {} });
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
 
  // Link rimosso dalla pagina dettagli su richiesta

  return (
    <div className="dashboard">
      <div className="container">
        <div className="quiz-grid">
          <div className="quiz-section-header">
            <h2 className="quiz-section-title">Tentativi</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
              <button className="btn btn-secondary" onClick={openEditIssued} title="Modifica" aria-label="Modifica issued">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                  <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                </svg>
              </button>
              
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
                            className="quiz-action-btn primary"
                            type="button"
                            onClick={() => handleOpenResults(it)}
                          >Risultati</button>
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
      <EditIssuedModal
        isOpen={editModal.isOpen}
        token={editModal.token}
        initialNumberOfQuestions={editModal.initialNumber}
        initialExpiration={editModal.initialExpiration}
        maxQuestions={null}
        loading={modalLoading}
        onConfirm={handleConfirmEditIssued}
        onCancel={handleCancelEditIssued}
      />
      <AttemptResultsModal
        isOpen={resultsModal.isOpen}
        loading={resultsModal.loading}
        error={resultsModal.error}
        questions={resultsModal.questions}
        selectionsByQuestion={resultsModal.selectionsByQuestion}
        onClose={handleCloseResults}
      />
    </div>
  );
};

export default IssuedQuizInfosPage;



