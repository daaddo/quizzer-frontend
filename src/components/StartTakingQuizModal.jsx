import React, { useEffect } from 'react';

/**
 * Modal di conferma avvio quiz da token
 * Props:
 *  - isOpen: boolean
 *  - token: string | null
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
const StartTakingQuizModal = ({ isOpen, token, onConfirm, onCancel }) => {
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
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Avvia il quiz?</h2>
          <button onClick={handleCancel} className="modal-close-btn" title="Chiudi">✕</button>
        </div>

        <div className="modal-body">
          <p style={{ marginTop: 0 }}>
            Stai per avviare un quiz generato da un link.
          </p>
          {token ? (
            <p style={{ wordBreak: 'break-all', fontSize: '0.9rem', color: '#555' }}>
              Link: <strong>{`${window.location.origin}/takingquiz?token=${encodeURIComponent(token)}`}</strong>
            </p>
          ) : null}
          <p style={{ marginBottom: 0 }}>
            Vuoi procedere?
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={handleCancel} className="btn btn-secondary">Annulla</button>
          <button onClick={handleConfirm} className="btn btn-primary">Inizia quiz</button>
        </div>
      </div>
    </div>
  );
};

export default StartTakingQuizModal;


