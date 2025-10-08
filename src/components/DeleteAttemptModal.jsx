import React, { useEffect } from 'react';

/**
 * Modal di conferma eliminazione per un tentativo utente
 * Props:
 *  - isOpen: boolean
 *  - attempt: object | null (userId, userName/username, attemptedAt, score)
 *  - loading: boolean
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
const DeleteAttemptModal = ({ isOpen, attempt, loading = false, onConfirm, onCancel }) => {
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

  if (!isOpen || !attempt) return null;

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
            <h3 className="delete-question" style={{ fontSize: '1.15rem' }}>Eliminare il tentativo di questo utente?</h3>

            <div className="quiz-details-center">
              <div className="compact-grid">
                <div style={{ margin: 0, padding: 0 }}><strong>Utente:</strong> {attempt?.userName || attempt?.username || attempt?.userId || '-'}</div>
                {attempt?.attemptedAt ? (
                  <div style={{ margin: 0, padding: 0 }}><strong>Iniziato:</strong> {new Date(attempt.attemptedAt).toLocaleString()}</div>
                ) : null}
                {attempt?.score != null ? (
                  <div style={{ margin: 0, padding: 0 }}><strong>Punteggio:</strong> {attempt.score}</div>
                ) : null}
              </div>
            </div>

            <div className="warning-message" style={{ marginTop: '0.5rem' }}>
              <p><strong>Questa azione non può essere annullata.</strong></p>
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
              <>Elimina tentativo</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAttemptModal;


