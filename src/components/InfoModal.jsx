import React, { useEffect } from 'react';

/**
 * Modal informativo semplice per messaggi personalizzati (successo/errore/info)
 * Props:
 *  - isOpen: boolean
 *  - title?: string
 *  - message?: string | React.ReactNode
 *  - onClose: () => void
 *  - variant?: 'info' | 'success' | 'error'
 */
const InfoModal = ({ isOpen, title = 'Informazione', message = '', onClose, variant = 'info' }) => {
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

  const color = variant === 'error' ? '#9b2c2c' : variant === 'success' ? '#22543d' : '#1a202c';
  const icon = variant === 'error' ? '⚠️' : variant === 'success' ? '✅' : 'ℹ️';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color }}>
            <span aria-hidden="true">{icon}</span>
            <span>{title}</span>
          </h2>
          <button onClick={onClose} className="modal-close-btn" title="Chiudi">✕</button>
        </div>

        <div className="modal-body">
          {typeof message === 'string' ? (
            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{message}</p>
          ) : (
            message
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">OK</button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;


