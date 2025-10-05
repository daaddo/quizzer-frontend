import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';
import '../styles/test.css';
import ConfirmSubmitModal from '../components/ConfirmSubmitModal';

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
  const [meta, setMeta] = useState({ numberOfQuestions: null, expirationDate: null, duration: null });
  const [durationSecs, setDurationSecs] = useState(null);
  const [remainingSecs, setRemainingSecs] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, loading: false });

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

      // Helpers per payload
      const normalizePayload = (data) => {
        let questionsArr = [];
        let metaInfo = { numberOfQuestions: null, expirationDate: null, duration: null };
        try {
          if (Array.isArray(data)) {
            questionsArr = data;
          } else if (data && typeof data === 'object') {
            if (Array.isArray(data.questions)) {
              // payload già normalizzato
              questionsArr = data.questions;
              if (data.meta) metaInfo = { ...metaInfo, ...data.meta };
            } else {
              const keys = Object.keys(data);
              if (keys.length === 1 && Array.isArray(data[keys[0]])) {
                const header = keys[0];
                questionsArr = data[header] || [];
                const durMatch = /duration=([\d:]+)/.exec(header);
                const expMatch = /expirationDate=([^,\]]+)/.exec(header);
                const numMatch = /numberOfQuestions=(\d+)/.exec(header);
                metaInfo = {
                  numberOfQuestions: numMatch ? parseInt(numMatch[1], 10) : null,
                  expirationDate: expMatch ? (expMatch[1] === 'null' ? null : expMatch[1]) : null,
                  duration: durMatch ? durMatch[1] : null,
                };
              }
            }
          }
        } catch {}
        return { questionsArr, metaInfo };
      };

      // Revalida con il server: se nuove domande sono disponibili, azzera cache locale e ricarica stato
      const revalidateFromServer = async () => {
        try {
          const data = await userApi.getRandomQuestionsByToken(token);
          const { questionsArr, metaInfo } = normalizePayload(data);
          if (Array.isArray(questionsArr) && questionsArr.length > 0) {
            // Pulisci tutto ciò che è in cache per questo token
            try {
              localStorage.removeItem(`takingquiz:test:${token}`);
              localStorage.removeItem(`takingquiz:answers:${token}`);
              localStorage.removeItem(`takingquiz:results:${token}`);
            } catch {}
            console.log('[TakingQuiz] Cache locale invalidata per token', token);

            // Imposta nuovo stato e salva nuova cache
            setResults(null);
            setScore(null);
            setAnswers({});
            setCurrentIndex(0);
            setQuestions(questionsArr);
            setMeta(metaInfo);
            if (metaInfo.duration) {
              const parts = String(metaInfo.duration).split(':').map((n) => parseInt(n || '0', 10));
              const secs = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
              setDurationSecs(secs);
              setRemainingSecs(secs);
            } else {
              setDurationSecs(null);
              setRemainingSecs(null);
            }
            try {
              localStorage.setItem(`takingquiz:test:${token}`, JSON.stringify({ questions: questionsArr, meta: metaInfo }));
            } catch {}
            console.log('[TakingQuiz] Test salvato in cache per token', token, '-', questionsArr.length, 'domande', metaInfo);
          }
        } catch (err) {
          // 4xx o errori: mantieni la schermata attuale
          // opzionale: console.warn('Revalidation failed or not allowed:', err);
        }
      };

      // 1) Prova a caricare il test dalla cache locale per evitare refetch al refresh
      try {
        const key = `takingquiz:test:${token}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          const { questionsArr, metaInfo } = normalizePayload(parsed);
          if (Array.isArray(questionsArr)) {
            setQuestions(questionsArr);
            setMeta(metaInfo);
            if (metaInfo.duration) {
              const parts = String(metaInfo.duration).split(':').map((n) => parseInt(n || '0', 10));
              const secs = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
              setDurationSecs(secs);
              setRemainingSecs(secs);
            }
            console.log('[TakingQuiz] Test caricato da cache per token', token, '-', questionsArr.length, 'domande', metaInfo);
            setLoading(false);
            // Revalida in background per gestire il caso di tentativo eliminato lato server
            void revalidateFromServer();
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
        const { questionsArr, metaInfo } = normalizePayload(data);
        setQuestions(questionsArr);
        setMeta(metaInfo);
        if (metaInfo.duration) {
          const parts = String(metaInfo.duration).split(':').map((n) => parseInt(n || '0', 10));
          const secs = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
          setDurationSecs(secs);
          setRemainingSecs(secs);
        }
        // 2) Salva il test corrente in localStorage per riutilizzarlo al refresh
        try {
          localStorage.setItem(key, JSON.stringify({ questions: questionsArr, meta: metaInfo }));
        } catch {}
        console.log('[TakingQuiz] Test salvato in cache per token', token, '-', questionsArr.length, 'domande', metaInfo);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento delle domande');
      } finally {
        setLoading(false);
        inflightTokens.delete(token);
      }
    };

    fetchQuestions();
  }, [token]);

  // Countdown timer (solo visuale)
  useEffect(() => {
    if (remainingSecs == null) return;
    const t = setInterval(() => {
      setRemainingSecs((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [remainingSecs]);

  const formatTime = (total) => {
    if (total == null) return '-';
    const hh = Math.floor(total / 3600);
    const mm = Math.floor((total % 3600) / 60);
    const ss = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  };

  // Carica risposte e risultati salvati per questo token
  useEffect(() => {
    if (!token) return;
    try {
      const a = localStorage.getItem(`takingquiz:answers:${token}`);
      if (a) {
        const parsed = JSON.parse(a);
        if (parsed && typeof parsed === 'object') setAnswers(parsed);
        if (parsed && typeof parsed === 'object') console.log(`[TakingQuiz] Risposte caricate da cache per token ${token}: ${Object.keys(parsed).length} domande risposte`);
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
          console.log(`[TakingQuiz] Risultati caricati da cache per token ${token}: ${entries.length} domande valutate, punteggio: ${correct}/${entries.length}`);
        }
      }
    } catch {}
  }, [token]);

  const persistAnswers = (next) => {
    setAnswers(next);
    try { localStorage.setItem(`takingquiz:answers:${token}`, JSON.stringify(next)); } catch {}
    try { console.log(`[TakingQuiz] Risposte salvate in cache per token ${token}: ${Object.keys(next).length} domande risposte`); } catch {}
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
      console.log(`[TakingQuiz] Risultati salvati in cache per token ${token}: ${entries.length} domande valutate, punteggio: ${correct}/${entries.length}`);
    } catch (err) {
      alert(err.message || 'Errore durante l\'invio delle risposte');
    } finally {
      setSubmitting(false);
      setConfirmModal({ isOpen: false, loading: false });
    }
  };

  const openConfirmSubmit = () => {
    if (!questions.length) return;
    const total = questions.length;
    const answered = Object.keys(answers).length;
    const unanswered = Math.max(0, total - answered);
    setConfirmModal({ isOpen: true, loading: false, total, unanswered });
  };

  const handleConfirmSubmit = async () => {
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    await handleSubmit();
  };

  const handleCancelSubmit = () => {
    if (confirmModal.loading) return;
    setConfirmModal({ isOpen: false, loading: false });
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
    let isQuestionCorrect = null;
    if (result) {
      const sel = new Set(result.selectedOptions || []);
      const cor = new Set(result.correctOptions || []);
      isQuestionCorrect = sel.size === cor.size && [...sel].every(v => cor.has(v));
    }
    return (
      <div className={`question-card test-question ${isSingle ? '' : 'fullpage-question'}`} id={`question-${idx}`} key={`${q.quizId}-${idx}`}>
        <div className="question-header">
          <div className="question-number">Domanda {idx + 1}</div>
          {showColors && isQuestionCorrect !== null && (
            <span
              className={`question-result-icon ${isQuestionCorrect ? 'correct' : 'incorrect'}`}
              aria-label={isQuestionCorrect ? 'Risposta corretta' : 'Risposta errata'}
            >
              {isQuestionCorrect ? 'V' : 'X'}
            </span>
          )}
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {meta?.duration && (
                <span className="stat-badge" title={`Durata totale: ${meta.duration}`}>
                  ⏱ Tempo: {formatTime(remainingSecs)}
                </span>
              )}
              {meta?.numberOfQuestions != null && (
                <span className="stat-badge" title="Numero di domande">
                  📝 {meta.numberOfQuestions} domande
                </span>
              )}
            </div>
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
                    <button className="btn btn-success" onClick={openConfirmSubmit} disabled={submitting}>{submitting ? 'Invio...' : 'Completa Test'}</button>
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
                <button className="btn btn-success btn-large" onClick={openConfirmSubmit} disabled={submitting}>{submitting ? 'Invio...' : 'Completa Test'}</button>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmSubmitModal
        isOpen={!!confirmModal.isOpen}
        loading={!!confirmModal.loading}
        unansweredCount={Math.max(0, (confirmModal.unanswered || (questions.length - Object.keys(answers).length)) || 0)}
        totalCount={confirmModal.total || questions.length}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </div>
  );
};

export default TakingQuiz;


