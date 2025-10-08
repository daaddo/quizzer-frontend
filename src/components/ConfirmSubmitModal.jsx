import React, { useEffect } from 'react';

/**
 * Modal di conferma consegna quiz
 * Props:
 *  - isOpen: boolean
 *  - unansweredCount: number
 *  - totalCount: number
 *  - loading: boolean
 *  - onConfirm: () => void
 *  - onCancel: () => void
 *  - title?: string
 *  - message?: string
 */
const ConfirmSubmitModal = ({ isOpen, unansweredCount = 0, totalCount = 0, loading = false, onConfirm, onCancel, title, message }) => {
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

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!loading && onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (!loading && onCancel) onCancel();
  };

  const hasUnanswered = (unansweredCount || 0) > 0;
  const dialogTitle = title || 'Conferma consegna';

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{dialogTitle}</h2>
          <button onClick={handleCancel} className="modal-close-btn" disabled={loading} title="Chiudi">✕</button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            {message ? (
              <>
                <p style={{ margin: 0 }}>{message}</p>
              </>
            ) : (
              <>
                <h3 className="delete-question" style={{ marginBottom: '0.75rem' }}>
                  {hasUnanswered
                    ? `Hai ${unansweredCount} domande senza risposta`
                    : 'Hai risposto a tutte le domande'}
                </h3>
                {typeof totalCount === 'number' && totalCount > 0 && (
                  <p style={{ margin: 0 }}>Totale domande: <strong>{totalCount}</strong></p>
                )}
                <div className="warning-message" style={{ marginTop: '1rem' }}>
                  <p>Vuoi consegnare il quiz adesso?</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleCancel} className="btn btn-secondary" disabled={loading}>Continua a rispondere</button>
          <button onClick={handleConfirm} className="btn btn-success" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Invio in corso...
              </>
            ) : (
              <>Consegna</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSubmitModal;


