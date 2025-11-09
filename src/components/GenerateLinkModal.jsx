import React, { useEffect, useMemo, useState } from 'react';
import cestinoIcon from '../assets/cestino.png';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';

/**
 * Modal per generare un link con token per un quiz
 */
const GenerateLinkModal = ({ quiz, isOpen, onGenerate, onCancel, loading = false, result }) => {
  const navigate = useNavigate();
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [duration, setDuration] = useState('00:30'); // HH:mm
  const [expirationDate, setExpirationDate] = useState(''); // datetime-local
  const [requiredDetails, setRequiredDetails] = useState(false);
  const [enableRequired, setEnableRequired] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [requiredQuestions, setRequiredQuestions] = useState([]);
  const [rqLoading, setRqLoading] = useState(false);
  const [rqError, setRqError] = useState(null);
  const [requiredSearch, setRequiredSearch] = useState('');
  const [error, setError] = useState(null);

  const maxQuestions = useMemo(() => (quiz?.questionCount ? quiz.questionCount : 0), [quiz]);
  const minQuestions = useMemo(() => Math.max(1, enableRequired ? (requiredQuestions.length || 0) : 1), [enableRequired, requiredQuestions.length]);

  // Blocca scrolling quando aperto e resetta form
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      setNumberOfQuestions(quiz?.questionCount && quiz.questionCount > 0 ? Math.min(quiz.questionCount, 10) : 1);
      setDuration('00:30');
      setExpirationDate('');
      setRequiredDetails(false);
      setEnableRequired(false);
      setAvailableQuestions([]);
      setRequiredQuestions([]);
      setRqLoading(false);
      setRqError(null);
      setRequiredSearch('');
      setError(null);

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, quiz]);

  // Carica domande del quiz quando si abilita "Domande necessarie"
  useEffect(() => {
    const loadQuestions = async () => {
      if (!enableRequired || !quiz?.id) return;
      if (availableQuestions.length > 0) return;
      try {
        setRqLoading(true);
        setRqError(null);
        const questions = await userApi.getQuizQuestions(quiz.id);
        setAvailableQuestions(Array.isArray(questions) ? questions : []);
      } catch (e) {
        setRqError(e?.message || 'Errore nel caricamento delle domande');
      } finally {
        setRqLoading(false);
      }
    };
    loadQuestions();
  }, [enableRequired, quiz, availableQuestions.length]);

  const filteredRequiredList = useMemo(() => {
    const term = (requiredSearch || '').trim().toLowerCase();
    if (!term) return availableQuestions;
    return (availableQuestions || []).filter((q) => {
      const t = (q?.title || '').toLowerCase();
      const body = (q?.question || '').toLowerCase();
      return t.includes(term) || body.includes(term);
    });
  }, [availableQuestions, requiredSearch]);

  const validate = () => {
    if (!quiz) return false;
    const errs = [];
    if (!numberOfQuestions || numberOfQuestions < 1) {
      errs.push('Il numero di domande deve essere almeno 1');
    }
    if (maxQuestions && numberOfQuestions > maxQuestions) {
      errs.push(`Numero domande massimo: ${maxQuestions}`);
    }
    if (!/^\d{2}:\d{2}$/.test(duration)) {
      errs.push('Durata non valida. Usa HH:mm');
    }
    if (expirationDate && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(expirationDate)) {
      errs.push('Data scadenza non valida');
    }

    // Se presente, la scadenza deve essere > now + duration
    if (errs.length === 0 && expirationDate) {
      try {
        const [dh, dm] = String(duration || '00:00').split(':').map((v) => parseInt(v || '0', 10));
        const durationMs = ((dh || 0) * 60 + (dm || 0)) * 60 * 1000;
        const now = new Date();
        const minExpiry = new Date(now.getTime() + durationMs);
        const exp = new Date(expirationDate);
        if (Number.isNaN(exp.getTime())) {
          errs.push('Data scadenza non valida');
        } else if (exp.getTime() <= minExpiry.getTime()) {
          errs.push(`La scadenza deve essere successiva ad almeno: ${minExpiry.toLocaleString()}`);
        }
      } catch {
        errs.push('Errore nella validazione della scadenza');
      }
    }

    // Validazione required questions
    if (enableRequired && requiredQuestions.length > numberOfQuestions) {
      errs.push('Il numero di domande necessarie non può superare il numero totale di domande');
    }

    setError(errs.length ? errs.join('\n') : null);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onGenerate({
      quizId: quiz.id,
      numberOfQuestions,
      duration, // HH:mm (verrà normalizzato a HH:mm:ss nel client API)
      expirationDate: expirationDate || null,
      requiredDetails,
      requiredQuestions: enableRequired ? requiredQuestions : []
    });
  };

  const toggleRequiredQuestion = (questionId) => {
    if (!questionId) return;
    setError(null);
    setRequiredQuestions((prev) => {
      const exists = prev.includes(questionId);
      if (exists) {
        return prev.filter((id) => id !== questionId);
      } else {
        if (prev.length >= (Number(numberOfQuestions) || 0)) {
          // Non permettere di superare il limite
          setError('Non puoi selezionare più domande necessarie del numero totale di domande');
          return prev;
        }
        return [...prev, questionId];
      }
    });
  };

  if (!isOpen || !quiz) return null;

  const disabled = loading || !quiz?.questionCount || quiz.questionCount < 1;

  return (
    <div className="modal-overlay generate-link-modal" onClick={onCancel}>
      <div className={`modal-content${enableRequired ? ' modal-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Genera link per quiz</h2>
          <button onClick={onCancel} className="modal-close-btn" disabled={loading} title="Chiudi">✕</button>
        </div>

        <div className="modal-body">
          <div className="test-config-info">
            <h3>Quiz: {quiz.title}</h3>
            {quiz.description && (
              <p className="quiz-description">{quiz.description}</p>
            )}
            <div className="quiz-stats">
              <span className="stat-badge">Domande disponibili: {quiz.questionCount || 0}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: enableRequired ? '0 0 50%' : '1 1 auto' }}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label className="form-label" htmlFor="gl-qn">Numero di domande *</label>
                  <input
                    id="gl-qn"
                    type="number"
                    className={`form-input ${error && numberOfQuestions > maxQuestions ? 'error' : ''}`}
                    value={numberOfQuestions}
                    min={minQuestions}
                    max={maxQuestions || undefined}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const clamped = Math.min(Math.max(val, minQuestions), maxQuestions || Number.MAX_SAFE_INTEGER);
                      setNumberOfQuestions(clamped);
                    }}
                    disabled={disabled}
                  />
                  <div className="form-hint">Min {minQuestions}, Max {maxQuestions || 0}</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gl-du">Durata (HH:mm) *</label>
                  <input
                    id="gl-du"
                    type="time"
                    className="form-input"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={disabled}
                  />
                  <div className="form-hint">Formato 24h (es. 00:30)</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gl-ex">Scadenza (opzionale)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      id="gl-ex"
                      type="datetime-local"
                      className="form-input"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      disabled={disabled}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => setExpirationDate('')}
                      disabled={disabled}
                      title="Resetta scadenza"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <img src={cestinoIcon} alt="Resetta scadenza" style={{ width: 18, height: 18, filter: 'invert(14%) sepia(79%) saturate(3075%) hue-rotate(350deg) brightness(89%) contrast(100%)' }} />
                    </button>
                  </div>
                  <div className="form-hint">Se vuoto, nessuna scadenza</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gl-rd">Informazioni aggiuntive Obbligatorie</label>
                  <div className="form-checkbox-row">
                    <input
                      id="gl-rd"
                      type="checkbox"
                      className="form-checkbox"
                      checked={requiredDetails}
                      onChange={(e) => setRequiredDetails(e.target.checked)}
                      disabled={disabled}
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Richiedi informazioni aggiuntive prima di iniziare</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gl-rq-enable">Domande necessarie</label>
                  <div className="form-checkbox-row">
                    <input
                      id="gl-rq-enable"
                      type="checkbox"
                      className="form-checkbox"
                      checked={enableRequired}
                      onChange={(e) => setEnableRequired(e.target.checked)}
                      disabled={disabled || (quiz?.questionCount || 0) < 1}
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Seleziona domande che devono sempre comparire nel quiz</span>
                  </div>
                  {enableRequired && (
                    <div className="form-hint">
                      Selezionate: {requiredQuestions.length} / {numberOfQuestions}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>
                )}
              </form>
            </div>

            {enableRequired && (
              <aside
                className="required-questions-panel"
                style={{
                  width: '50%',
                  minWidth: 480,
                  borderLeft: '1px solid #eceff4',
                  paddingLeft: '1rem'
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Domande necessarie</h3>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Cerca per titolo o testo..."
                    value={requiredSearch}
                    onChange={(e) => setRequiredSearch(e.target.value)}
                    disabled={rqLoading}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={rqLoading || (availableQuestions.length === 0) || (requiredQuestions.length >= availableQuestions.length)}
                    onClick={() => {
                      if (rqLoading || availableQuestions.length === 0) return;
                      const allIds = availableQuestions.map((q) => q.id);
                      setRequiredQuestions(allIds);
                      const target = Math.min(allIds.length, maxQuestions || allIds.length);
                      setNumberOfQuestions(target);
                      setError(null);
                    }}
                    title="Seleziona tutte le domande come necessarie"
                  >
                    Seleziona tutte
                  </button>
                </div>
                {rqLoading && <div>Caricamento domande...</div>}
                {rqError && <div className="form-error">{rqError}</div>}
                {!rqLoading && !rqError && (
                  <>
                    {filteredRequiredList.length === 0 ? (
                      <div>Nessuna domanda disponibile per questo quiz.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 360, overflowY: 'auto' }}>
                        {filteredRequiredList.map((q) => {
                          const checked = requiredQuestions.includes(q.id);
                          const disableAdd = !checked && requiredQuestions.length >= (Number(numberOfQuestions) || 0);
                          return (
                            <label
                              key={q.id}
                              htmlFor={`rq-${q.id}`}
                              style={{
                                display: 'block',
                                border: '1px solid #eceff4',
                                borderRadius: 6,
                                padding: '0.5rem 0.75rem',
                                background: checked ? '#f7fafc' : '#fff',
                                opacity: disableAdd ? 0.6 : 1,
                                cursor: disableAdd ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <input
                                  id={`rq-${q.id}`}
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => !disableAdd ? toggleRequiredQuestion(q.id) : null}
                                  disabled={disableAdd && !checked}
                                  style={{ marginTop: 2 }}
                                />
                                <div>
                                  <div style={{ fontWeight: 600 }}>{q.title || `Domanda #${q.id}`}</div>
                                  {q.question && (
                                    <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                                      {q.question}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </aside>
            )}
          </div>

          {result && (
            <div className="quiz-details-center" style={{ marginTop: '1rem' }}>
              <strong>Link</strong>
              <div style={{ wordBreak: 'break-all', marginBottom: '0.75rem' }}>{result.link}</div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigator.clipboard.writeText(result.link)}
                  type="button"
                >Copia link</button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => navigate(`/takingquiz?token=${encodeURIComponent(result?.token || '')}`)}
                >Apri link</button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Annulla</button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={disabled || loading}>
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Generazione...
              </>
            ) : (
              'Genera link'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateLinkModal;


