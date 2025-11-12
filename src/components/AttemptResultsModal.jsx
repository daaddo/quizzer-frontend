import React, { useEffect } from 'react';

/**
 * Modal per mostrare i risultati (domande/risposte) di un tentativo
 * Props:
 *  - isOpen: boolean
 *  - loading: boolean
 *  - error: string|null
 *  - questions: Array<
 *      | { titolo: string, descrizione: string, risposte: Array<{ testo: string, chosen: boolean, corretta: boolean }> }
 *      | { id?: number, title?: string, question?: string, answers?: Array<{ id?: number, answer?: string, correct?: boolean }> }
 *    >
 *  - selectionsByQuestion: Record<number, number[]> | null // usato solo come fallback per vecchio formato
 *  - attemptInfo?: { user_name?: string, surname?: string, middle_name?: string, userName?: string, username?: string }
 *  - onClose: () => void
 */
const AttemptResultsModal = ({ isOpen, loading = false, error = null, questions = [], selectionsByQuestion = null, attemptInfo = null, onClose }) => {
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
      <div className="modal-content attempt-results-modal" onClick={(e) => e.stopPropagation()}>
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

          {!loading && !error && attemptInfo && (
            <div className="attempt-user-info" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>Informazioni utente</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div><strong>Utente:</strong> {attemptInfo.userName || attemptInfo.username || '-'}</div>
                <div><strong>Nome:</strong> {attemptInfo.user_name || '-'}</div>
                <div><strong>Cognome:</strong> {attemptInfo.surname || '-'}</div>
                <div><strong>Secondo nome:</strong> {attemptInfo.middle_name || '-'}</div>
              </div>
            </div>
          )}

          {!loading && !error && (!questions || questions.length === 0) && (
            <div className="quiz-grid-empty" style={{ padding: '1rem 0' }}>
              <div className="empty-icon">📝</div>
              <h3>Nessun dato disponibile</h3>
            </div>
          )}

          {!loading && !error && questions && questions.length > 0 && (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              {/* Legenda stato risposte */}
              <table className="table table-gray" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', width: '120px' }}>Stato</th>
                    <th style={{ textAlign: 'left' }}>Significato</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#0b7' }}></span>
                    </td>
                    <td>Risposte giuste selezionate</td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#0d6efd' }}></span>
                    </td>
                    <td>Risposte giuste non selezionate</td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#dc3545' }}></span>
                    </td>
                    <td>Risposte sbagliate selezionate</td>
                  </tr>
                </tbody>
              </table>

              <table className="table table-gray" style={{ width: '100%', borderCollapse: 'collapse' }} cellPadding="4" cellSpacing="0">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Titolo</th>
                    <th style={{ textAlign: 'left' }}>Domanda</th>
                    <th style={{ textAlign: 'left' }}>Risposte</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, qIdx) => {
                    // Supporto nuovo formato (titolo/descrizione/risposte) con fallback al vecchio
                    const title = q?.titolo ?? q?.title ?? '-';
                    const questionText = q?.descrizione ?? q?.question ?? '-';
                    const answers = Array.isArray(q?.risposte)
                      ? q.risposte
                      : Array.isArray(q?.answers)
                        ? q.answers
                        : [];
                    const selectedIds = Array.isArray(selectionsByQuestion?.[q?.id]) ? selectionsByQuestion[q.id] : [];
                    return (
                    <tr key={q?.id ?? qIdx}>
                      <td style={{ paddingTop: 2, paddingBottom: 2, lineHeight: 1.2 }}>{title}</td>
                      <td style={{ whiteSpace: 'pre-wrap', paddingTop: 2, paddingBottom: 2, lineHeight: 1.2 }}>{questionText}</td>
                      <td>
                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                          {answers.map((a, aIdx) => {
                            // Nuovo formato: testo/corretta/chosen, Fallback: answer/correct + selectionsByQuestion
                            const isSelected = (a?.chosen === true) || (a?.id != null && selectedIds.includes(a.id));
                            const isCorrect = a?.corretta === true || a?.correct === true;
                            // Colori:
                            // - Verde (#0b7): corretta e selezionata
                            // - Blu   (#0d6efd): corretta e NON selezionata
                            // - Rosso (#dc3545): sbagliata e selezionata
                            let color;
                            if (isCorrect && isSelected) color = '#0b7';
                            else if (isCorrect && !isSelected) color = '#0d6efd';
                            else if (!isCorrect && isSelected) color = '#dc3545';
                            return (
                              <li key={a?.id ?? aIdx} style={{ color }}>
                                {a?.testo ?? a?.answer}
                                {/* rimosso testo selezionata per richiesta UX */}
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


