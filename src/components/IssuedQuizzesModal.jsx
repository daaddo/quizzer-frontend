import React, { useEffect } from 'react';

/**
 * Modal che mostra la lista degli IssuedQuizzes per un quiz
 * items: Array di IssuedQuizInfosDto
 *   {
 *     tokenId: string|Array|Uint8Array,
 *     issuerId: number,
 *     quizId: number,
 *     numberOfQuestions: number,
 *     issuedAt: string|number|Date,
 *     expiresAt: string|number|Date|null,
 *     duration: string|number|null
 *   }
 */
const IssuedQuizzesModal = ({ quiz, isOpen, items = [], loading = false, error = null, onClose }) => {
  // Blocca lo scroll quando aperto
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  if (!isOpen || !quiz) return null;

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
    // Se arriva come millisecondi/secondi
    const totalSeconds = typeof value === 'number' ? (value > 100000 ? Math.round(value / 1000) : value) : 0;
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const formatToken = (tokenId) => {
    if (tokenId == null) return '-';
    if (typeof tokenId === 'string') return tokenId;
    try {
      // Prova a interpretare come array di byte
      const arr = Array.isArray(tokenId) ? tokenId : Array.from(tokenId);
      // Mostra anteprima esadecimale ridotta
      const hex = arr.slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
      return `0x${hex}${arr.length > 8 ? '…' : ''}`;
    } catch {
      return String(tokenId);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Quiz creati per: {quiz.title}</h2>
          <button onClick={onClose} className="modal-close-btn" disabled={loading} title="Chiudi">✕</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="user-profile-loading" style={{ margin: 0 }}>
              <div className="loading-spinner"></div>
              <p>Caricamento...</p>
            </div>
          )}

          {!loading && error && (
            <div className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>
          )}

          {!loading && !error && (!items || items.length === 0) && (
            <div className="quiz-grid-empty" style={{ padding: '1rem 0' }}>
              <div className="empty-icon">📝</div>
              <h3>Nessun quiz creato per questo quiz</h3>
            </div>
          )}

          {!loading && !error && items && items.length > 0 && (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Token</th>
                    <th style={{ textAlign: 'left' }}>Domande</th>
                    <th style={{ textAlign: 'left' }}>Emesso il</th>
                    <th style={{ textAlign: 'left' }}>Scade il</th>
                    <th style={{ textAlign: 'left' }}>Durata</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ wordBreak: 'break-all' }}>{formatToken(it.tokenId)}</span>
                          {typeof it.tokenId === 'string' && (
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => navigator.clipboard.writeText(it.tokenId)}
                            >Copia</button>
                          )}
                        </div>
                      </td>
                      <td>{it.numberOfQuestions ?? '-'}</td>
                      <td>{formatDateTime(it.issuedAt)}</td>
                      <td>{formatDateTime(it.expiresAt)}</td>
                      <td>{formatDuration(it.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default IssuedQuizzesModal;



