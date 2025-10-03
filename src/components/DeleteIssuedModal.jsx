import React, { useEffect } from 'react';

/**
 * Modal di conferma eliminazione per un Issued Quiz
 * Props:
 *  - isOpen: boolean
 *  - issued: object | null (deve contenere almeno tokenId, numberOfQuestions, issuedAt, expiresAt, duration)
 *  - loading: boolean
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
const DeleteIssuedModal = ({ isOpen, issued, loading = false, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen || !issued) return null;

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
    if (typeof value === 'string') return value;
    const totalSeconds = typeof value === 'number' ? (value > 100000 ? Math.round(value / 1000) : value) : 0;
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const handleConfirm = () => {
    if (!loading && onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (!loading && onCancel) onCancel();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header delete-modal-header">
          <button
            onClick={handleCancel}
            className="modal-close-btn"
            disabled={loading}
            title="Chiudi"
          >
            ✕
          </button>
          <h2 className="modal-title centered-title">Conferma eliminazione</h2>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <div className="warning-icon-header" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 21h22L12 2 1 21z" fill="#f59e0b"/>
                <path d="M12 9v6" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="17" r="1" fill="#111827"/>
              </svg>
            </div>
            <h3 className="delete-question">Sei sicuro di voler eliminare questo issued?</h3>

            <div className="quiz-details-center">
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <div><strong>Domande:</strong> {issued?.numberOfQuestions ?? '-'}</div>
                <div><strong>Emesso il:</strong> {formatDateTime(issued?.issuedAt)}</div>
                <div><strong>Scade il:</strong> {formatDateTime(issued?.expiresAt)}</div>
                <div><strong>Durata:</strong> {formatDuration(issued?.duration)}</div>
              </div>
            </div>

            <div className="warning-message">
              <p><strong>Questa azione non può essere annullata.</strong></p>
              <p>Verranno rimossi anche i tentativi associati a questo issued.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleCancel} className="btn btn-secondary" disabled={loading}>Annulla</button>
          <button onClick={handleConfirm} className="btn btn-danger" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Eliminazione...
              </>
            ) : (
              <>Elimina Issued</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteIssuedModal;



