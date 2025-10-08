import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';
import dettagliIcon from '../assets/dettagli.png';
import cestinoIcon from '../assets/cestino.png';
import EditIssuedModal from '../components/EditIssuedModal';
import DeleteIssuedModal from '../components/DeleteIssuedModal';

const IssuedQuizzesPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | expired
  const [editModal, setEditModal] = useState({ isOpen: false, token: null, initialNumber: null, initialExpiration: null });
  const [modalLoading, setModalLoading] = useState(false);
	const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, loading: false });

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
        try {
          // Persisti mapping required_details per token per uso su /issued/:token
          (Array.isArray(issued) ? issued : []).forEach((it) => {
            if (it && it.tokenId) {
              localStorage.setItem(`issued:required_details:${it.tokenId}`, String(!!it.required_details));
            }
          });
        } catch {}
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

  const normalizeDateTimeLocalToSeconds = (value) => {
    if (!value) return null;
    // Accept both YYYY-MM-DDTHH:mm and YYYY-MM-DDTHH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return value;
    return null;
  };

  const openEditIssued = (tokenId, initialNumber, initialExpiration) => {
    if (!tokenId) return;
    setEditModal({ isOpen: true, token: tokenId, initialNumber, initialExpiration });
  };

  const handleConfirmEditIssued = async ({ numberOfQuestions, expirationDate }) => {
    const tokenId = editModal.token;
    if (!tokenId) return;
    try {
      setModalLoading(true);
      // Apply updates selectively
      if (numberOfQuestions != null) {
        await userApi.updateIssuedNumberOfQuestions(tokenId, numberOfQuestions);
        setItems((prev) => prev.map((x) => (x?.tokenId === tokenId ? { ...x, numberOfQuestions } : x)));
      }
      if (expirationDate != null) {
        const normalized = normalizeDateTimeLocalToSeconds(expirationDate);
        if (!normalized) throw new Error('Data scadenza non valida');
        await userApi.updateIssuedExpiration(tokenId, normalized);
        setItems((prev) => prev.map((x) => (x?.tokenId === tokenId ? { ...x, expiresAt: normalized } : x)));
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

  // Pulsanti singoli rimossi in favore di un'unica azione Modifica

	const openDeleteIssuedModal = (issuedItem) => {
		if (!issuedItem) return;
		setDeleteModal({ isOpen: true, item: issuedItem, loading: false });
	};

	const handleConfirmDeleteIssued = async () => {
		const tokenId = deleteModal?.item?.tokenId;
		if (!tokenId) return;
		try {
			setDeleteModal((prev) => ({ ...prev, loading: true }));
			await userApi.deleteIssuedQuiz(tokenId);
			setItems((prev) => prev.filter((x) => x?.tokenId !== tokenId));
			setDeleteModal({ isOpen: false, item: null, loading: false });
			alert('Issued eliminato');
		} catch (e) {
			setDeleteModal((prev) => ({ ...prev, loading: false }));
			alert(e.message || 'Errore eliminazione issued');
		}
	};

	const handleCancelDeleteIssued = () => {
		if (deleteModal.loading) return;
		setDeleteModal({ isOpen: false, item: null, loading: false });
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
            <h2 className="quiz-section-title">{quiz?.title || `Quiz #${quizId}`}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div role="radiogroup" aria-label="Filtro" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label className="filter-option" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="issued-filter"
                    checked={filter === 'all'}
                    onChange={() => setFilter('all')}
                  />
                  <span>Tutti</span>
                </label>
                <label className="filter-option" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="issued-filter"
                    checked={filter === 'active'}
                    onChange={() => setFilter('active')}
                  />
                  <span>In corso</span>
                </label>
                <label className="filter-option" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="issued-filter"
                    checked={filter === 'expired'}
                    onChange={() => setFilter('expired')}
                  />
                  <span>Scaduti</span>
                </label>
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
                    <th>Domande</th>
                    <th>Emesso il</th>
                    <th>Scade il</th>
                    <th>Durata</th>
                    <th style={{ width: '30px', textAlign: 'center', whiteSpace: 'nowrap' }}>Info obbligatorie</th>
                    <th>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((it, idx) => {
                    const expiresAtMs = it?.expiresAt ? new Date(it.expiresAt).getTime() : null;
                    const isExpired = typeof expiresAtMs === 'number' && !Number.isNaN(expiresAtMs) ? expiresAtMs < now : false;
                    const link = null; // Link rimosso dalla lista
                    return (
                      <tr key={idx} className={isExpired ? 'row-expired' : 'row-active'}>
                        <td>
                          <span className="stat-badge" style={{ background: isExpired ? '#fee2e2' : '#dcfce7', color: isExpired ? '#991b1b' : '#166534' }}>{isExpired ? 'Scaduto' : 'Attivo'}</span>
                        </td>
                        <td>{it?.numberOfQuestions ?? '-'}</td>
                        <td>{formatDateTime(it?.issuedAt)}</td>
                        <td>{formatDateTime(it?.expiresAt)}</td>
                        <td>{formatDuration(it?.duration)}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{it?.required_details === true ? 'Sì' : 'No'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="quiz-action-btn secondary"
                              type="button"
                              disabled={!it?.tokenId}
                              onClick={() => navigate(`/issued/${encodeURIComponent(it?.tokenId || '')}`, { state: { requiredDetails: !!it?.required_details } })}
                              title="Dettagli"
                              aria-label="Dettagli"
                            >
                              <img
                                src={dettagliIcon}
                                alt="Dettagli"
                                style={{ width: 18, height: 18, filter: 'invert(29%) sepia(94%) saturate(2179%) hue-rotate(207deg) brightness(95%) contrast(96%)' }}
                              />
                            </button>
                            <button
                              className="quiz-action-btn secondary"
                              type="button"
                              disabled={!it?.tokenId}
                              title="Modifica"
                              aria-label="Modifica issued"
                              onClick={() => openEditIssued(it?.tokenId, it?.numberOfQuestions ?? null, it?.expiresAt ?? null)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                                <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                              </svg>
                            </button>
						<button
                              className="quiz-action-btn secondary"
                              type="button"
                              disabled={!it?.tokenId}
                              title="Elimina"
                              aria-label="Elimina issued"
								onClick={() => it && openDeleteIssuedModal(it)}
                            >
								<img
									src={cestinoIcon}
									alt="Elimina"
									style={{ width: 18, height: 18, filter: 'invert(14%) sepia(79%) saturate(3075%) hue-rotate(350deg) brightness(89%) contrast(100%)' }}
								/>
                            </button>
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
		<EditIssuedModal
        isOpen={editModal.isOpen}
        token={editModal.token}
        initialNumberOfQuestions={editModal.initialNumber}
        initialExpiration={editModal.initialExpiration}
        maxQuestions={quiz?.questionCount || null}
        loading={modalLoading}
        onConfirm={handleConfirmEditIssued}
        onCancel={handleCancelEditIssued}
      />
		<DeleteIssuedModal
			isOpen={deleteModal.isOpen}
			issued={deleteModal.item}
			loading={deleteModal.loading}
			onConfirm={handleConfirmDeleteIssued}
			onCancel={handleCancelDeleteIssued}
		/>
    </div>
  );
};

export default IssuedQuizzesPage;


