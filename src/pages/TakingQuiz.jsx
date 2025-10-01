import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';

// Guard a livello di modulo per evitare doppie fetch in StrictMode (monta->smonta->monta)
const inflightTokens = new Set();

const TakingQuiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: number[] }
  const [results, setResults] = useState(null); // { [questionId]: { selectedOptions: number[], correctOptions: number[] } }
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);

  // Evita doppio fetch in StrictMode (dev)
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError('Token mancante');
        setLoading(false);
        return;
      }

      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      // 1) Prova a caricare il test dalla cache locale per evitare refetch al refresh
      try {
        const key = `takingquiz:test:${token}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setQuestions(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 1b) Se una fetch per questo token è già in corso (altra mount StrictMode), attendi il risultato
      const key = `takingquiz:test:${token}`;
      if (inflightTokens.has(token)) {
        setLoading(true);
        let tries = 0;
        const maxTries = 50; // ~7.5s (50 * 150ms)
        const poll = setInterval(() => {
          tries += 1;
          try {
            const cachedNow = localStorage.getItem(key);
            if (cachedNow) {
              const parsed = JSON.parse(cachedNow);
              if (Array.isArray(parsed)) {
                clearInterval(poll);
                setQuestions(parsed);
                setLoading(false);
              }
            }
          } catch {}
          if (tries >= maxTries) {
            clearInterval(poll);
            setError('Timeout nel recupero del quiz. Riprova.');
            setLoading(false);
          }
        }, 150);
        return () => clearInterval(poll);
      }
      inflightTokens.add(token);

      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getRandomQuestionsByToken(token);
        setQuestions(data);
        // 2) Salva il test corrente in localStorage per riutilizzarlo al refresh
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch {}
      } catch (err) {
        setError(err.message || 'Errore nel caricamento delle domande');
      } finally {
        setLoading(false);
        inflightTokens.delete(token);
      }
    };

    fetchQuestions();
  }, [token]);

  // Carica risposte e risultati salvati per questo token
  useEffect(() => {
    if (!token) return;
    try {
      const a = localStorage.getItem(`takingquiz:answers:${token}`);
      if (a) {
        const parsed = JSON.parse(a);
        if (parsed && typeof parsed === 'object') setAnswers(parsed);
      }
    } catch {}
    try {
      const r = localStorage.getItem(`takingquiz:results:${token}`);
      if (r) {
        const parsed = JSON.parse(r);
        if (parsed && typeof parsed === 'object') {
          setResults(parsed);
          // calcola punteggio
          const entries = Object.entries(parsed);
          let correct = 0;
          for (const [, resp] of entries) {
            const sel = new Set(resp.selectedOptions || []);
            const cor = new Set(resp.correctOptions || []);
            if (sel.size === cor.size && [...sel].every(v => cor.has(v))) correct++;
          }
          setScore(`${correct}/${entries.length}`);
        }
      }
    } catch {}
  }, [token]);

  const persistAnswers = (next) => {
    setAnswers(next);
    try { localStorage.setItem(`takingquiz:answers:${token}`, JSON.stringify(next)); } catch {}
  };

  const handleToggle = (questionId, answerId, multipleChoice) => {
    const qid = String(questionId);
    const current = Array.isArray(answers[qid]) ? answers[qid] : [];
    let next;
    if (multipleChoice) {
      if (current.includes(answerId)) {
        next = current.filter(x => x !== answerId);
      } else {
        next = [...current, answerId];
      }
    } else {
      next = [answerId];
    }
    persistAnswers({ ...answers, [qid]: next });
  };

  const handleSubmit = async () => {
    if (!token || submitting || !questions.length) return;
    // Costruisci mappa risposte: questionId -> array di answerId
    const payload = {};
    for (const q of questions) {
      const qid = String(q.quizId);
      if (answers[qid] && answers[qid].length > 0) {
        payload[qid] = answers[qid];
      } else {
        payload[qid] = [];
      }
    }
    try {
      setSubmitting(true);
      const res = await userApi.submitAnswersByToken(token, payload);
      setResults(res);
      try { localStorage.setItem(`takingquiz:results:${token}`, JSON.stringify(res)); } catch {}
      // calcola punteggio
      const entries = Object.entries(res);
      let correct = 0;
      for (const [, resp] of entries) {
        const sel = new Set(resp.selectedOptions || []);
        const cor = new Set(resp.correctOptions || []);
        if (sel.size === cor.size && [...sel].every(v => cor.has(v))) correct++;
      }
      setScore(`${correct}/${entries.length}`);
    } catch (err) {
      alert(err.message || 'Errore durante l\'invio delle risposte');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Caricamento domande</h2>
            <p>Recupero del quiz in corso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h2>Impossibile avviare il quiz</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Torna alla Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="quiz-grid">
          <h2 className="quiz-section-title">Quiz generato {score ? `— Punteggio: ${score}` : ''}</h2>
          {questions.length === 0 ? (
            <div className="quiz-grid-empty">
              <div className="empty-icon">📚</div>
              <h3>Nessuna domanda disponibile</h3>
              <div className="empty-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Torna alla Dashboard</button>
              </div>
            </div>
          ) : (
            <div className="quiz-cards-container">
              <div className="quiz-card" style={{ cursor: 'default' }}>
                <div className="quiz-card-header">
                  <h3 className="quiz-title">Domande ({questions.length})</h3>
                </div>
                <div className="quiz-card-body">
                  <ol style={{ paddingLeft: '1.25rem' }}>
                    {questions.map((q, idx) => {
                      const qid = String(q.quizId);
                      const selected = answers[qid] || [];
                      const result = results ? results[qid] : null;
                      const correctSet = result ? new Set(result.correctOptions || []) : null;
                      const isQuestionCorrect = result
                        ? (() => {
                            const sel = new Set(result.selectedOptions || []);
                            const cor = new Set(result.correctOptions || []);
                            return sel.size === cor.size && [...sel].every(v => cor.has(v));
                          })()
                        : false;
                      const containerBg = results
                        ? (isQuestionCorrect ? 'rgba(198, 246, 213, 0.25)' : 'rgba(254, 215, 215, 0.25)')
                        : 'transparent';
                      const containerBorder = results
                        ? (isQuestionCorrect ? '1px solid rgba(34, 84, 61, 0.25)' : '1px solid rgba(155, 44, 44, 0.25)')
                        : '1px solid transparent';
                      return (
                        <li key={`${q.quizId}-${idx}`} style={{ marginBottom: '1rem', background: containerBg, border: containerBorder, borderRadius: 8, padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600 }}>{q.title ? `${q.title} — ` : ''}{q.question}</div>
                          {Array.isArray(q.list) && q.list.length > 0 && (
                            <ul style={{ marginTop: '0.5rem', listStyle: 'none', paddingLeft: 0 }}>
                              {q.list.map((a) => {
                                const isChecked = selected.includes(a.id);
                                const isCorrect = correctSet ? correctSet.has(a.id) : false;
                                const showColors = !!results;
                                const color = showColors ? (isCorrect ? '#22543d' : isChecked ? '#9b2c2c' : '#2d3748') : '#2d3748';
                                const bg = showColors ? (isCorrect ? '#c6f6d5' : isChecked ? '#fed7d7' : 'transparent') : 'transparent';
                                return (
                                  <li key={a.id} style={{ margin: '0.35rem 0', background: bg, borderRadius: 6, padding: '0.35rem 0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: results ? 'default' : 'pointer', color }}>
                                      <input
                                        type={q.multipleChoice ? 'checkbox' : 'radio'}
                                        name={`q-${qid}`}
                                        checked={isChecked}
                                        disabled={!!results}
                                        onChange={() => handleToggle(qid, a.id, q.multipleChoice)}
                                      />
                                      <span>{a.answer}</span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                          <div style={{ marginTop: '0.25rem', color: '#718096' }}>
                            {q.multipleChoice ? 'Risposta multipla' : 'Risposta singola'}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="quiz-card-footer">
                  <div className="quiz-actions">
                    {!results && (
                      <button className="quiz-action-btn primary" disabled={submitting} onClick={handleSubmit}>
                        {submitting ? 'Invio...' : 'Invia risposte'}
                      </button>
                    )}
                    <button className="quiz-action-btn secondary" onClick={() => navigate('/dashboard')}>Chiudi</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakingQuiz;


