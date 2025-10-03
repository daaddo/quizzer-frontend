import React, { useEffect } from 'react';

/**
 * Modal per mostrare i risultati (domande/risposte) di un tentativo
 * Props:
 *  - isOpen: boolean
 *  - loading: boolean
 *  - error: string|null
 *  - questions: Array<{ id, title, question, answers: [{ id, answer, correct }] }>
 *  - selectionsByQuestion: Record<number, number[]> | null // mappa questionId -> selectedOptions ids
 *  - onClose: () => void
 */
const AttemptResultsModal = ({ isOpen, loading = false, error = null, questions = [], selectionsByQuestion = null, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Risultati tentativo</h2>
          <button onClick={onClose} className="modal-close-btn" disabled={loading} title="Chiudi">✕</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="user-profile-loading" style={{ margin: 0 }}>
              <div className="loading-spinner"></div>
              <p>Caricamento risultati...</p>
            </div>
          )}

          {!loading && error && (
            <div className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>
          )}

          {!loading && !error && (!questions || questions.length === 0) && (
            <div className="quiz-grid-empty" style={{ padding: '1rem 0' }}>
              <div className="empty-icon">📝</div>
              <h3>Nessun dato disponibile</h3>
            </div>
          )}

          {!loading && !error && questions && questions.length > 0 && (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-gray" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Titolo</th>
                    <th style={{ textAlign: 'left' }}>Domanda</th>
                    <th style={{ textAlign: 'left' }}>Risposte</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => {
                    const selectedIds = Array.isArray(selectionsByQuestion?.[q.id]) ? selectionsByQuestion[q.id] : [];
                    return (
                    <tr key={q.id}>
                      <td>{q.title || '-'}</td>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{q.question || '-'}</td>
                      <td>
                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                          {(q.answers || []).map((a) => {
                            const isSelected = selectedIds.includes(a.id);
                            const isCorrect = !!a.correct;
                            const color = isCorrect ? '#0b7' : (isSelected ? '#dc3545' : undefined);
                            return (
                              <li key={a.id} style={{ color }}>
                                {a.answer}
                                {isSelected && ' (selezionata)'}
                                {isCorrect && ' (corretta)'}
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                    </tr>
                    );
                  })}
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

export default AttemptResultsModal;


