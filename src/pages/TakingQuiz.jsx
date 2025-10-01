import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';
import '../styles/test.css';

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

  // Vista: 'scrolling' (una domanda alla volta) oppure 'cascata' (tutte)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = token ? localStorage.getItem(`takingquiz:viewmode:${token}`) : null;
      return saved === 'scrolling' || saved === 'cascata' ? saved : 'cascata';
    } catch {
      return 'cascata';
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    try {
      if (token) localStorage.setItem(`takingquiz:viewmode:${token}`, viewMode);
    } catch {}
  }, [token, viewMode]);

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

  const total = questions.length || 1;
  const progress = viewMode === 'scrolling'
    ? ((currentIndex + 1) / total) * 100
    : (Object.keys(answers).length / total) * 100;

  const renderQuestionCard = (q, idx, isSingle = false) => {
    const qid = String(q.quizId);
    const selected = answers[qid] || [];
    const result = results ? results[qid] : null;
    const correctSet = result ? new Set(result.correctOptions || []) : null;
    const showColors = !!results;
    return (
      <div className={`question-card test-question ${isSingle ? '' : 'fullpage-question'}`} id={`question-${idx}`} key={`${q.quizId}-${idx}`}>
        <div className="question-header">
          <div className="question-number">Domanda {idx + 1}</div>
          {q.title && <div className="question-title">{q.title}</div>}
        </div>
        <div className="question-content">
          <p className="question-text">{q.question}</p>
          <div className="answers-container">
            <div className="answer-type-hint">{q.multipleChoice ? 'Seleziona tutte le risposte corrette:' : 'Seleziona una risposta:'}</div>
            {Array.isArray(q.list) && q.list.map((a) => {
              const isChecked = selected.includes(a.id);
              const isCorrect = correctSet ? correctSet.has(a.id) : false;
              return (
                <label key={a.id} className={`answer-option ${isChecked ? 'selected' : ''}`}>
                  <input
                    type={q.multipleChoice ? 'checkbox' : 'radio'}
                    name={`q-${qid}`}
                    value={a.id}
                    checked={isChecked}
                    disabled={!!results}
                    onChange={() => handleToggle(qid, a.id, q.multipleChoice)}
                  />
                  <span className="answer-text" style={showColors ? { color: isCorrect ? '#22543d' : isChecked ? '#9b2c2c' : undefined } : undefined}>{a.answer}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`test-execution takingquiz-theme ${viewMode === 'cascata' ? 'fullpage-mode' : 'scrolling-mode'}`}>
      <div className="container">
        {/* Header del test */}
        <div className="test-header">
          <button onClick={() => navigate('/dashboard')} className="back-button">← Abbandona</button>
          <div className="test-info">
            <h1 className="test-title">Quiz generato {score ? `— Punteggio: ${score}` : ''}</h1>
            <div className="test-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-text">
                {viewMode === 'scrolling' ? `Domanda ${currentIndex + 1} di ${total}` : `Risposte date: ${Object.keys(answers).length} di ${total}`}
              </span>
            </div>
          </div>
          <div className="view-toggle" role="tablist" aria-label="Modalità visualizzazione">
            <button className={`btn ${viewMode === 'scrolling' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('scrolling')}>Scorrimento</button>
            <button className={`btn ${viewMode === 'cascata' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('cascata')}>A cascata</button>
          </div>
        </div>

        {/* Contenuto */}
        {questions.length === 0 ? (
          <div className="test-empty">
            <div className="container">
              <div className="empty-content">
                <div className="empty-icon">📝</div>
                <h3>Nessuna domanda disponibile</h3>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Torna alla Dashboard</button>
              </div>
            </div>
          </div>
        ) : viewMode === 'scrolling' ? (
          <div className="test-question-container">
            {renderQuestionCard(questions[currentIndex], currentIndex, true)}
            <div className="test-navigation">
              <div className="nav-buttons">
                <button className="btn btn-secondary" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>Precedente</button>
                {currentIndex < total - 1 ? (
                  <button className="btn btn-primary" onClick={() => setCurrentIndex(Math.min(total - 1, currentIndex + 1))}>Successiva</button>
                ) : (
                  !results && (
                    <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Invio...' : 'Completa Test'}</button>
                  )
                )}
              </div>
              <div className="answered-count">Risposte date: {Object.keys(answers).length} / {total}</div>
            </div>
          </div>
        ) : (
          <div className="fullpage-questions-container">
            {questions.map((q, idx) => renderQuestionCard(q, idx))}
            <div className="fullpage-navigation">
              <div className="answered-count">Risposte date: {Object.keys(answers).length} / {total}</div>
              {!results && (
                <button className="btn btn-success btn-large" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Invio...' : 'Completa Test'}</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakingQuiz;


