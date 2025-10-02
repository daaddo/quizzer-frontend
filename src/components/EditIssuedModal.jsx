import React, { useEffect, useMemo, useState } from 'react';

/**
 * Modal per modificare i parametri di un Issued Quiz
 * Modificabili: numberOfQuestions (opzionale), expirationDate (opzionale)
 * Props:
 *  - isOpen: boolean
 *  - token: string | null
 *  - initialNumberOfQuestions: number | null
 *  - initialExpiration: string | number | Date | null
 *  - maxQuestions: number | null
 *  - loading: boolean
 *  - onConfirm: ({ numberOfQuestions?: number|null, expirationDate?: string|null }) => void
 *  - onCancel: () => void
 */
const EditIssuedModal = ({ isOpen, token, initialNumberOfQuestions, initialExpiration, maxQuestions, loading = false, onConfirm, onCancel }) => {
  const [numQuestions, setNumQuestions] = useState('');
  const [expiration, setExpiration] = useState(''); // datetime-local (YYYY-MM-DDTHH:mm)
  const [error, setError] = useState(null);

  // Blocca scrolling quando aperto
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

  const toDateTimeLocal = (input) => {
    if (!input && input !== 0) return '';
    try {
      const d = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(d.getTime())) return '';
      const yyyy = String(d.getFullYear());
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
      return '';
    }
  };

  // Init valori quando si apre
  useEffect(() => {
    if (isOpen) {
      setNumQuestions(initialNumberOfQuestions != null ? String(initialNumberOfQuestions) : '');
      setExpiration(toDateTimeLocal(initialExpiration));
      setError(null);
    }
  }, [isOpen, initialNumberOfQuestions, initialExpiration]);

  const validate = () => {
    const errors = [];
    if (numQuestions !== '') {
      const n = parseInt(numQuestions, 10);
      if (!Number.isFinite(n) || n < 1) errors.push('Il numero di domande deve essere >= 1');
      if (maxQuestions && n > maxQuestions) errors.push(`Numero di domande massimo: ${maxQuestions}`);
    }
    if (expiration !== '' && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(expiration)) {
      errors.push('Data/ora non valida (usa YYYY-MM-DDTHH:mm)');
    }
    setError(errors.length ? errors.join('\n') : null);
    return errors.length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const payload = {
      numberOfQuestions: numQuestions !== '' ? parseInt(numQuestions, 10) : null,
      expirationDate: expiration !== '' ? expiration : null,
    };
    onConfirm && onConfirm(payload);
  };

  if (!isOpen) return null;

  const disabled = loading;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Modifica Issued</h2>
          <button onClick={onCancel} className="modal-close-btn" disabled={loading} title="Chiudi">✕</button>
        </div>

        <div className="modal-body">
          {token && (
            <div className="test-config-info" style={{ marginBottom: '0.5rem' }}>
              <strong>Token:</strong> <span style={{ wordBreak: 'break-all' }}>{token}</span>
            </div>
          )}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label" htmlFor="ei-qn">Numero di domande</label>
              <input
                id="ei-qn"
                type="number"
                className="form-input"
                value={numQuestions}
                min="1"
                max={maxQuestions || undefined}
                onChange={(e) => setNumQuestions(e.target.value)}
                disabled={disabled}
              />
              {maxQuestions ? (
                <div className="form-hint">Min 1, Max {maxQuestions}</div>
              ) : (
                <div className="form-hint">Min 1</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ei-ex">Scadenza</label>
              <input
                id="ei-ex"
                type="datetime-local"
                className="form-input"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                disabled={disabled}
              />
              <div className="form-hint">Lascia vuoto per non modificare</div>
            </div>

            {error && (
              <div className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Annulla</button>
          <button onClick={handleConfirm} className="btn btn-primary" disabled={disabled}>Salva</button>
        </div>
      </div>
    </div>
  );
};

export default EditIssuedModal;


