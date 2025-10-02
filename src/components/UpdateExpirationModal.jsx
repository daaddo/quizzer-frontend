import React, { useEffect, useMemo, useState } from 'react';

/**
 * Modal per aggiornare la scadenza di un issued quiz
 * Props:
 *  - isOpen: boolean
 *  - token: string | null
 *  - initialExpiration: string | number | Date | null (ISO o timestamp)
 *  - loading: boolean
 *  - onConfirm: (datetimeLocal: string) => void  // formato YYYY-MM-DDTHH:mm
 *  - onCancel: () => void
 */
const UpdateExpirationModal = ({ isOpen, token, initialExpiration, loading = false, onConfirm, onCancel }) => {
  const [value, setValue] = useState(''); // datetime-local (YYYY-MM-DDTHH:mm)
  const [error, setError] = useState(null);

  // Blocca lo scroll quando aperto
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

  // Converte una data ISO/timestamp in formato datetime-local (senza secondi)
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

  // Inizializzazione del valore quando si apre il modal
  useEffect(() => {
    if (isOpen) {
      const initial = toDateTimeLocal(initialExpiration);
      setValue(initial);
      setError(null);
    }
  }, [isOpen, initialExpiration]);

  const isValid = useMemo(() => {
    if (!value) return false;
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
  }, [value]);

  const handleConfirm = () => {
    if (!isValid) {
      setError('Inserisci una data/ora valida (formato YYYY-MM-DDTHH:mm)');
      return;
    }
    onConfirm && onConfirm(value);
  };

  if (!isOpen) return null;

  const disabled = loading || !isValid;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Aggiorna scadenza</h2>
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
              <label className="form-label" htmlFor="uex-dt">Scadenza (YYYY-MM-DDTHH:mm) *</label>
              <input
                id="uex-dt"
                type="datetime-local"
                className="form-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={loading}
              />
              <div className="form-hint">Usa il selettore per impostare data e ora locali</div>
            </div>

            {error && (
              <div className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Annulla</button>
          <button onClick={handleConfirm} className="btn btn-primary" disabled={disabled}>
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Salvataggio...
              </>
            ) : (
              'Salva'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateExpirationModal;


