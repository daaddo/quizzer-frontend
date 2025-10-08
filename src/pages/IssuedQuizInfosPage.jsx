import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../components/dashboard.css';
import EditIssuedModal from '../components/EditIssuedModal';
import AttemptResultsModal from '../components/AttemptResultsModal';
import risultatiIcon from '../assets/risultati.png';
import scaricaIcon from '../assets/scarica.png';
import cestinoIcon from '../assets/cestino.png';

const IssuedQuizInfosPage = () => {
  const navigate = useNavigate();
  const { tokenId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [editModal, setEditModal] = useState({ isOpen: false, token: null, initialNumber: null, initialExpiration: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [resultsModal, setResultsModal] = useState({ isOpen: false, loading: false, error: null, questions: [], selectionsByQuestion: {}, attempt: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tokenId) {
        setError('Token mancante');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getIssuedQuizInfos(tokenId);
        const arr = Array.isArray(data) ? data : [];
        setItems(arr);
      } catch (e) {
        setError(e.message || 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tokenId]);

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

  const normalizeDateTimeLocalToSeconds = (value) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return value;
    return null;
  };

  const handleDeleteAttempt = async (userId) => {
    try {
      const ok = window.confirm('Confermi l\'eliminazione del tentativo di questo utente?');
      if (!ok) return;
      await userApi.deleteAttempt(tokenId, userId);
      setItems((prev) => prev.filter((x) => x?.userId !== userId));
      alert('Tentativo eliminato');
    } catch (e) {
      alert(e.message || 'Errore eliminazione tentativo');
    }
  };

  const openEditIssued = () => {
    setEditModal({ isOpen: true, token: tokenId, initialNumber: null, initialExpiration: null });
  };

  const handleCopyTakingLink = async () => {
    try {
      const link = `${window.location.origin}/takingquiz?token=${encodeURIComponent(tokenId || '')}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const area = document.createElement('textarea');
        area.value = link;
        area.setAttribute('readonly', '');
        area.style.position = 'absolute';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      alert('Impossibile copiare il link');
    }
  };

  const handleConfirmEditIssued = async ({ numberOfQuestions, expirationDate }) => {
    try {
      setModalLoading(true);
      if (numberOfQuestions != null) {
        await userApi.updateIssuedNumberOfQuestions(tokenId, numberOfQuestions);
      }
      if (expirationDate != null) {
        const normalized = normalizeDateTimeLocalToSeconds(expirationDate);
        if (!normalized) throw new Error('Data scadenza non valida');
        await userApi.updateIssuedExpiration(tokenId, normalized);
      }
      setEditModal({ isOpen: false, token: null, initialNumber: null, initialExpiration: null });
      alert('Issued aggiornato');
    } catch (e) {
      alert(e.message || 'Errore aggiornamento issued');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelEditIssued = () => {
    setEditModal({ isOpen: false, token: null, initialNumber: null, initialExpiration: null });
  };

  // Eliminazione issued non esposta qui per richiesta: rimossa dalla UI

  const handleOpenResults = async (attemptItem) => {
     try {
      // Parse selections map from attempt
      let selectionsMap = {};
      try {
        if (attemptItem && typeof attemptItem.questions === 'string') {
          const parsed = JSON.parse(attemptItem.questions || '{}') || {};
          // normalize to questionId -> selectedOptions[]
          selectionsMap = Object.fromEntries(Object.entries(parsed).map(([qid, v]) => [Number(qid), Array.isArray(v?.selectedOptions) ? v.selectedOptions : []]));
        } else if (attemptItem && typeof attemptItem.questions === 'object' && attemptItem.questions) {
          const obj = attemptItem.questions;
          selectionsMap = Object.fromEntries(Object.entries(obj).map(([qid, v]) => [Number(qid), Array.isArray(v?.selectedOptions) ? v.selectedOptions : []]));
        }
      } catch {}
      setResultsModal({ isOpen: true, loading: true, error: null, questions: [], selectionsByQuestion: selectionsMap, attempt: attemptItem });
      let questionsPayload = {};
      try {
        if (attemptItem && typeof attemptItem.questions === 'string') {
          questionsPayload = JSON.parse(attemptItem.questions || '{}') || {};
        } else if (attemptItem && typeof attemptItem.questions === 'object' && attemptItem.questions) {
          questionsPayload = attemptItem.questions;
        }
      } catch {}
      const data = await userApi.getQuestionsByTokenWithPayload(tokenId, questionsPayload);
      setResultsModal((prev) => ({ ...prev, isOpen: true, loading: false, error: null, questions: Array.isArray(data) ? data : [] }));
    } catch (e) {
      setResultsModal((prev) => ({ ...prev, isOpen: true, loading: false, error: e.message || 'Errore caricamento risultati', questions: [] }));
    }
  };

  const handleCloseResults = () => {
    setResultsModal({ isOpen: false, loading: false, error: null, questions: [], selectionsByQuestion: {} });
  };

  const computeTotalCorrectOptions = (attemptItem) => {
    try {
      let payload = null;
      if (attemptItem && typeof attemptItem.questions === 'string') {
        payload = JSON.parse(attemptItem.questions || '{}') || {};
      } else if (attemptItem && typeof attemptItem.questions === 'object' && attemptItem.questions) {
        payload = attemptItem.questions;
      }
      if (!payload || typeof payload !== 'object') return null;
      let total = 0;
      for (const [, v] of Object.entries(payload)) {
        const correctArr = Array.isArray(v?.correctOptions) ? v.correctOptions : [];
        total += correctArr.length;
      }
      return Number.isFinite(total) ? total : null;
    } catch {
      return null;
    }
  };

  const formatAttemptScore = (attemptItem) => {
    const score = attemptItem?.score;
    const denom = computeTotalCorrectOptions(attemptItem);
    if ((score == null || Number.isNaN(Number(score))) && (denom == null)) return '-';
    const left = (score == null || Number.isNaN(Number(score))) ? '-' : String(score);
    const right = (denom == null) ? '-' : String(denom);
    return `${left}/${right}`;
  };

  const loadJsPDF = async () => {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
      const existing = document.getElementById('jspdf-umd');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.jspdf.jsPDF));
        existing.addEventListener('error', () => reject(new Error('Impossibile caricare jsPDF')));
        return;
      }
      const script = document.createElement('script');
      script.id = 'jspdf-umd';
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => resolve(window.jspdf.jsPDF);
      script.onerror = () => reject(new Error('Impossibile caricare jsPDF'));
      document.head.appendChild(script);
    });
  };

  const handleDownloadAttemptPdf = async (attempt) => {
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 15;
      const marginRight = 15;
      const contentWidth = pageWidth - marginLeft - marginRight;
      let y = 15;

      const ensureSpace = (h = 8) => {
        if (y + h > pageHeight - 12) {
          doc.addPage();
          y = 15;
        }
      };

      // Header (copia titolo del form risultati)
      doc.setFontSize(16);
      doc.text('Risultati tentativo', pageWidth / 2, y, { align: 'center' });
      y += 10;
      doc.setFontSize(12);

      const name = (attempt?.user_name || '').trim();
      const surname = (attempt?.surname || '').trim();
      const middle = (attempt?.middle_name || '').trim();
      const hasAdditional = !!(name || surname || middle);
      const displayUser = attempt?.userName || attempt?.username || String(attempt?.userId || '');

      // User info
      const userInfoLines = [];
      if (hasAdditional) {
        userInfoLines.push(`Nome: ${name || '-'}`);
        userInfoLines.push(`Cognome: ${surname || '-'}`);
        userInfoLines.push(`Secondo nome: ${middle || '-'}`);
        userInfoLines.push(`Utente: ${displayUser || '-'}`);
      } else {
        userInfoLines.push(`Utente: ${displayUser || '-'}`);
      }
      userInfoLines.forEach((line) => { ensureSpace(); doc.text(line, marginLeft, y); y += 7; });

      // Punteggio formattato X/Y (solo rapporto: score/risposteCorrette)
      const formattedScore = formatAttemptScore(attempt);
      if (formattedScore && formattedScore !== '-/-') {
        ensureSpace();
        doc.text(String(formattedScore), marginLeft, y);
        y += 8;
      }
      // Iniziato e Finito su due righe
      if (attempt?.attemptedAt) {
        ensureSpace();
        doc.text(`Iniziato: ${new Date(attempt.attemptedAt).toLocaleString()}`, marginLeft, y);
        y += 7;
      }
      if (attempt?.finishedAt) {
        ensureSpace();
        doc.text(`Finito: ${new Date(attempt.finishedAt).toLocaleString()}`, marginLeft, y);
        y += 8;
      }

      // Ricostruisci selections map e payload
      let selectionsMap = {};
      let questionsPayload = {};
      try {
        if (attempt && typeof attempt.questions === 'string') {
          questionsPayload = JSON.parse(attempt.questions || '{}') || {};
        } else if (attempt && typeof attempt.questions === 'object' && attempt.questions) {
          questionsPayload = attempt.questions;
        }
        selectionsMap = Object.fromEntries(Object.entries(questionsPayload).map(([qid, v]) => [Number(qid), Array.isArray(v?.selectedOptions) ? v.selectedOptions : []]));
      } catch {}

      // Carica domande complete
      let questions = [];
      try {
        const data = await userApi.getQuestionsByTokenWithPayload(tokenId, questionsPayload);
        questions = Array.isArray(data) ? data : [];
      } catch (e) {
        alert('Impossibile caricare le domande per il PDF');
        return;
      }

      // Legenda (copia del form: tabella Stato/Significato, usa pallino come separatore altrove)
      ensureSpace(20);
      doc.setFontSize(13);
      doc.text('Legenda', marginLeft, y);
      y += 7;
      doc.setFontSize(12);
      // Intestazioni
      doc.text('Stato', marginLeft, y);
      doc.text('Significato', marginLeft + 30, y);
      y += 6;
      // Riga 1
      doc.setTextColor(0, 187, 119);
      doc.text('■', marginLeft, y);
      doc.setTextColor(0, 0, 0);
      doc.text('Risposte giuste selezionate', marginLeft + 30, y);
      y += 6;
      // Riga 2
      doc.setTextColor(13, 110, 253);
      doc.text('■', marginLeft, y);
      doc.setTextColor(0, 0, 0);
      doc.text('Risposte giuste non selezionate', marginLeft + 30, y);
      y += 6;
      // Riga 3
      doc.setTextColor(220, 53, 69);
      doc.text('■', marginLeft, y);
      doc.setTextColor(0, 0, 0);
      doc.text('Risposte sbagliate selezionate', marginLeft + 30, y);
      y += 10;

      // Domande e risposte come tabella Titolo | Domanda | Risposte (copia del form)
      // Larghezze tabella: Titolo 150px, Domanda 230px, Risposte resto
      const pxToMm = (px) => (px * 25.4) / 96;
      const desiredTitleMm = pxToMm(150);
      const desiredQuestionMm = pxToMm(230);
      const safeContent = Math.max(60, contentWidth);
      const titleW = Math.min(desiredTitleMm, safeContent - 20);
      const questionW = Math.min(desiredQuestionMm, Math.max(20, safeContent - titleW - 20));
      const answersW = Math.max(20, contentWidth - titleW - questionW);
      const col1X = marginLeft;
      const col2X = marginLeft + titleW;
      const col3X = marginLeft + titleW + questionW;
      const lineHeight = 6;

      const drawHeader = () => {
        ensureSpace(10);
        doc.setFillColor(240, 240, 240);
        doc.rect(marginLeft, y, contentWidth, 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('Titolo', col1X + 2, y + 5);
        doc.text('Domanda', col2X + 2, y + 5);
        doc.text('Risposte', col3X + 2, y + 5);
        y += 8;
      };

      drawHeader();

      questions.forEach((q) => {
        const qTitle = q?.title || '-';
        const qText = q?.question ? String(q.question) : '-';
        const selectedIds = Array.isArray(selectionsMap?.[q.id]) ? selectionsMap[q.id] : [];
        const answersArr = Array.isArray(q?.answers) ? q.answers : Array.isArray(q?.list) ? q.list : [];

        const titleLines = doc.splitTextToSize(qTitle, titleW - 4);
        const questionLines = doc.splitTextToSize(qText, questionW - 4);

        const answerLineChunks = [];
        answersArr.forEach((a) => {
          const isSelected = selectedIds.includes(a.id);
          const isCorrect = !!a.correct;
          let color = [0, 0, 0];
          if (isCorrect && isSelected) color = [0, 187, 119];
          else if (isCorrect && !isSelected) color = [13, 110, 253];
          else if (!isCorrect && isSelected) color = [220, 53, 69];
          const wrapped = doc.splitTextToSize(`• ${a.answer}`, answersW - 4);
          wrapped.forEach((line) => {
            answerLineChunks.push({ text: line, color });
          });
        });
        if (answerLineChunks.length === 0) answerLineChunks.push({ text: '-', color: [0, 0, 0] });

        // Altezza riga basata sul numero massimo di linee tra le colonne (allineamento top)
        const rowLines = Math.max(titleLines.length, questionLines.length, answerLineChunks.length);
        const rowHeight = rowLines * lineHeight + 4;

        ensureSpace(rowHeight + 2);
        // Ripeti header se va a nuova pagina
        if (y === 15) {
          drawHeader();
        }

        // Celle
        doc.rect(col1X, y, titleW, rowHeight);
        doc.rect(col2X, y, questionW, rowHeight);
        doc.rect(col3X, y, answersW, rowHeight);

        // Testo celle (allineamento top, margine interno 4)
        let ty = y + 4;
        titleLines.forEach((line) => { doc.text(line, col1X + 2, ty); ty += lineHeight; });

        let qy = y + 4;
        questionLines.forEach((line) => { doc.text(line, col2X + 2, qy); qy += lineHeight; });

        let ay = y + 4;
        answerLineChunks.forEach((chunk) => {
          doc.setTextColor(chunk.color[0], chunk.color[1], chunk.color[2]);
          doc.text(chunk.text, col3X + 2, ay);
          ay += lineHeight;
        });
        doc.setTextColor(0, 0, 0);

        y += rowHeight;
      });

      doc.save('informazioni_quiz.pdf');
    } catch (e) {
      alert('Impossibile generare il PDF');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Caricamento tentativi</h2>
            <p>Recupero dei dati...</p>
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
             <h2>Impossibile caricare</h2>
             <p>{error}</p>
             <div className="error-actions">
               <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
             </div>
           </div>
         </div>
       </div>
     );
   }
 
  // Link rimosso dalla pagina dettagli su richiesta

  return (
    <div className="dashboard">
      <div className="container">
        <div className="quiz-grid">
          <div className="quiz-section-header">
            <h2 className="quiz-section-title">Tentativi</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
              <button
                className="btn btn-secondary"
                onClick={handleCopyTakingLink}
                title={`Copia link per eseguire il quiz`}
                aria-label="Copia link"
              >
                {copied ? 'Copiato!' : 'Copia link'}
              </button>
              <button className="btn btn-secondary" onClick={openEditIssued} title="Modifica" aria-label="Modifica issued">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                  <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                </svg>
              </button>
              
            </div>
          </div>

          {(!items || items.length === 0) ? (
            <div className="quiz-grid-empty">
              <div className="empty-icon">📝</div>
              <h3>Nessun tentativo per questo quiz</h3>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-gray" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Utente</th>
                    <th style={{ textAlign: 'left' }}>Stato</th>
                    <th style={{ textAlign: 'left' }}>Punteggio</th>
                    <th style={{ textAlign: 'left' }}>Iniziato</th>
                    <th style={{ textAlign: 'left' }}>Finito</th>
                    {(location?.state?.requiredDetails || (() => { try { return localStorage.getItem(`issued:required_details:${tokenId}`) === 'true'; } catch { return false; } })()) && (
                      <>
                        <th style={{ textAlign: 'left' }}>Nome</th>
                        <th style={{ textAlign: 'left' }}>Cognome</th>
                        <th style={{ textAlign: 'left' }}>Secondo nome</th>
                      </>
                    )}
                    <th style={{ textAlign: 'left' }}>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it?.userName ?? it?.username ?? it?.userId ?? '-'}</td>
                      <td>{it?.status ?? '-'}</td>
                      <td>{formatAttemptScore(it)}</td>
                      <td>{formatDateTime(it?.attemptedAt)}</td>
                      <td>{formatDateTime(it?.finishedAt)}</td>
                      {(location?.state?.requiredDetails || (() => { try { return localStorage.getItem(`issued:required_details:${tokenId}`) === 'true'; } catch { return false; } })()) && (
                        <>
                          <td>{it?.user_name ?? '-'}</td>
                          <td>{it?.surname ?? '-'}</td>
                          <td>{it?.middle_name ?? '-'}</td>
                        </>
                      )}
                      <td>
                         <div className="table-actions">
                          <button
                            className="quiz-action-btn primary"
                            type="button"
                            onClick={() => handleOpenResults(it)}
                            title="Risultati"
                            aria-label="Risultati"
                          >
                            <img
                              src={risultatiIcon}
                              alt="Risultati"
                              style={{ width: 18, height: 18, filter: 'invert(29%) sepia(94%) saturate(2179%) hue-rotate(207deg) brightness(95%) contrast(96%)' }}
                            />
                          </button>
                          <button
                            className="quiz-action-btn secondary"
                            type="button"
                            onClick={() => handleDownloadAttemptPdf(it)}
                            title="Scarica PDF"
                            aria-label="Scarica PDF"
                          >
                            <img src={scaricaIcon} alt="Scarica PDF" style={{ width: 18, height: 18 }} />
                          </button>
                          <button
                            className="quiz-action-btn secondary"
                            type="button"
                            disabled={!it?.userId}
                            onClick={() => it?.userId && handleDeleteAttempt(it.userId)}
                            title="Elimina tentativo"
                            aria-label="Elimina tentativo"
                            style={{ background: '#fee2e2', color: '#991b1b' }}
                          >
                            <img
                              src={cestinoIcon}
                              alt="Elimina"
                              style={{ width: 18, height: 18, filter: 'invert(14%) sepia(79%) saturate(3075%) hue-rotate(350deg) brightness(89%) contrast(100%)' }}
                            />
                          </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <EditIssuedModal
        isOpen={editModal.isOpen}
        token={editModal.token}
        initialNumberOfQuestions={editModal.initialNumber}
        initialExpiration={editModal.initialExpiration}
        maxQuestions={null}
        loading={modalLoading}
        onConfirm={handleConfirmEditIssued}
        onCancel={handleCancelEditIssued}
      />
      <AttemptResultsModal
        isOpen={resultsModal.isOpen}
        loading={resultsModal.loading}
        error={resultsModal.error}
        questions={resultsModal.questions}
        selectionsByQuestion={resultsModal.selectionsByQuestion}
        attemptInfo={resultsModal.attempt}
        onClose={handleCloseResults}
      />
    </div>
  );
};

export default IssuedQuizInfosPage;



