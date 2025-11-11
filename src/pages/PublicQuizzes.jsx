import React, { useState, useEffect } from 'react';
import PublicQuizCard from '../components/PublicQuizCard';
import StartPublicQuizModal from '../components/StartPublicQuizModal';
import { userApi } from '../services/userApi';
import '../styles/public-quizzes.css';
import '../styles/test.css';

/**
 * Pagina che mostra i quiz pubblici disponibili
 */
const PublicQuizzes = () => {
  const [startQuizModal, setStartQuizModal] = useState({ isOpen: false, quiz: null });
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);
  
  // Stato paginazione
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12; // Mostra 12 quiz per pagina
  
  // Stato per il quiz in esecuzione
  const [activeQuiz, setActiveQuiz] = useState(null); // { quiz, questions, userAnswers }
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [viewMode, setViewMode] = useState('cascata'); // 'scrolling' o 'cascata'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Carica i quiz pubblici
  useEffect(() => {
    const loadPublicQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await userApi.getPublicQuizzes(currentPage, pageSize, 'quiz_id');
        
        // Mappa i dati dal backend al formato che PublicQuizCard si aspetta
        const mappedQuizzes = (response.content || []).map(quiz => ({
          id: quiz.quizId,
          title: quiz.title || 'Quiz Senza Nome',
          name: quiz.description || null,
          questionCount: quiz.questionsCount || 0,
          reviewCount: quiz.reviewCount || 0,
          rating: quiz.averageRating || 0,
          author: quiz.authorUsername || 'Anonimo',
          lastUpdated: quiz.lastUpdated || null
        }));
        
        setQuizzes(mappedQuizzes);
        // Gestisce sia la vecchia struttura (response.totalPages) che la nuova (response.page.totalPages)
        setTotalPages(response.page?.totalPages || response.totalPages || 0);
        setTotalElements(response.page?.totalElements || response.totalElements || 0);
      } catch (err) {
        console.error('Errore caricamento quiz pubblici:', err);
        setError(err.message || 'Errore nel caricamento dei quiz pubblici');
      } finally {
        setLoading(false);
      }
    };

    loadPublicQuizzes();
  }, [currentPage]);

  const handleStartQuiz = (quiz) => {
    console.log('Apertura modal per iniziare quiz:', quiz);
    setStartQuizModal({ isOpen: true, quiz });
  };

  const handleConfirmStartQuiz = async (data) => {
    console.log('Avvio quiz con dati:', data);
    const quizId = data.quizId;
    
    try {
      setLoadingQuiz(true);
      setQuizError(null);
      
      // Chiamata GET a /api/v1/questions/{quizId}
      const questions = await userApi.getQuizQuestions(quizId);
      
      if (!questions || questions.length === 0) {
        throw new Error('Questo quiz non contiene domande');
      }
      
      // Prepara il quiz attivo
      setActiveQuiz({
        quiz: startQuizModal.quiz,
        userData: { name: data.name, email: data.email },
        questions: questions,
        userAnswers: {}
      });
      
      setStartQuizModal({ isOpen: false, quiz: null });
      setCurrentIndex(0);
      setShowResults(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Errore caricamento domande quiz:', err);
      setQuizError(err.message || 'Errore nel caricamento del quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleCancelStartQuiz = () => {
    setStartQuizModal({ isOpen: false, quiz: null });
  };

  const handleOpenComments = (quiz) => {
    console.log('Apertura commenti per quiz:', quiz);
    // TODO: Implementare in futuro
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Gestione risposte quiz
  const handleToggleAnswer = (questionId, answerId, isMultipleChoice) => {
    if (!activeQuiz || showResults) return;
    
    const current = activeQuiz.userAnswers[questionId] || [];
    let next;
    
    if (isMultipleChoice) {
      if (current.includes(answerId)) {
        next = current.filter(x => x !== answerId);
      } else {
        next = [...current, answerId];
      }
    } else {
      next = [answerId];
    }
    
    setActiveQuiz({
      ...activeQuiz,
      userAnswers: {
        ...activeQuiz.userAnswers,
        [questionId]: next
      }
    });
  };
  
  const handleCorrectQuiz = () => {
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBackToQuizzes = () => {
    if (!showResults) {
      if (!window.confirm('Sei sicuro di voler abbandonare il quiz? Tutti i progressi andranno persi.')) {
        return;
      }
    }
    setActiveQuiz(null);
    setShowResults(false);
    setCurrentIndex(0);
    setQuizError(null);
  };
  
  const calculateScore = () => {
    if (!activeQuiz || !showResults) return null;
    
    let correct = 0;
    const total = activeQuiz.questions.length;
    
    activeQuiz.questions.forEach(q => {
      const selected = new Set(activeQuiz.userAnswers[q.id] || []);
      const correct_answers = new Set(
        q.answers.filter(a => a.correct).map(a => a.id)
      );
      
      if (selected.size === correct_answers.size && 
          [...selected].every(id => correct_answers.has(id))) {
        correct++;
      }
    });
    
    return { correct, total };
  };

  // Se c'è un quiz attivo, mostra l'interfaccia del quiz
  if (activeQuiz) {
    const total = activeQuiz.questions.length;
    const answered = Object.keys(activeQuiz.userAnswers).length;
    const progress = viewMode === 'cascata' ? (answered / total) * 100 : ((currentIndex + 1) / total) * 100;
    const score = calculateScore();
    
    const renderQuestionCard = (q, idx) => {
      const selected = activeQuiz.userAnswers[q.id] || [];
      const correctAnswers = q.answers.filter(a => a.correct);
      const isMultipleChoice = correctAnswers.length > 1;
      const correctSet = new Set(correctAnswers.map(a => a.id));
      
      let isQuestionCorrect = null;
      if (showResults) {
        const selectedSet = new Set(selected);
        isQuestionCorrect = selectedSet.size === correctSet.size && 
                           [...selectedSet].every(id => correctSet.has(id));
      }
      
      return (
        <div className="question-card test-question fullpage-question" key={q.id} id={`question-${idx}`}>
          <div className="question-header">
            <div className="question-number">Domanda {idx + 1}</div>
            {showResults && isQuestionCorrect !== null && (
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
              <div className="answer-type-hint">
                {isMultipleChoice ? 'Seleziona tutte le risposte corrette:' : 'Seleziona una risposta:'}
              </div>
              {q.answers.map(a => {
                const isChecked = selected.includes(a.id);
                const isCorrect = correctSet.has(a.id);
                
                return (
                  <label key={a.id} className={`answer-option ${isChecked ? 'selected' : ''}`}>
                    <input
                      type={isMultipleChoice ? 'checkbox' : 'radio'}
                      name={`q-${q.id}`}
                      value={a.id}
                      checked={isChecked}
                      disabled={showResults}
                      onChange={() => handleToggleAnswer(q.id, a.id, isMultipleChoice)}
                    />
                    <span 
                      className="answer-text" 
                      style={showResults ? {
                        color: isCorrect ? '#22543d' : isChecked ? '#9b2c2c' : undefined,
                        fontWeight: isCorrect ? '600' : undefined
                      } : undefined}
                    >
                      {a.answer}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      );
    };
    
    return (
      <div className={`test-execution public-quiz-execution ${viewMode === 'cascata' ? 'fullpage-mode' : 'scrolling-mode'}`}>
        <div className="container">
          <div className="test-header">
            <button onClick={handleBackToQuizzes} className="back-button">
              ← {showResults ? 'Torna ai Quiz' : 'Abbandona'}
            </button>
            <div className="test-info">
              <h1 className="test-title">
                {activeQuiz.quiz.title || 'Quiz Pubblico'}
                {showResults && score && ` — Punteggio: ${score.correct}/${score.total}`}
              </h1>
              {activeQuiz.quiz.name && (
                <p className="test-subtitle" style={{ fontSize: '0.95rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  {activeQuiz.quiz.name}
                </p>
              )}
              <div className="test-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">
                  {viewMode === 'scrolling' 
                    ? `Domanda ${currentIndex + 1} di ${total}` 
                    : `Risposte date: ${answered} di ${total}`}
                </span>
              </div>
            </div>
            {!showResults && (
              <div className="view-toggle" role="tablist" aria-label="Modalità visualizzazione">
                <button 
                  className={`btn ${viewMode === 'scrolling' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode('scrolling')}
                >
                  Scorrimento
                </button>
                <button 
                  className={`btn ${viewMode === 'cascata' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode('cascata')}
                >
                  A cascata
                </button>
              </div>
            )}
          </div>
          
          {viewMode === 'scrolling' ? (
            <div className="test-question-container">
              {renderQuestionCard(activeQuiz.questions[currentIndex], currentIndex)}
              <div className="test-navigation">
                <div className="nav-buttons">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                  >
                    Precedente
                  </button>
                  {currentIndex < total - 1 ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setCurrentIndex(Math.min(total - 1, currentIndex + 1))}
                    >
                      Successiva
                    </button>
                  ) : !showResults && (
                    <button 
                      className="btn btn-success" 
                      onClick={handleCorrectQuiz}
                    >
                      Correggi
                    </button>
                  )}
                </div>
                <div className="answered-count">Risposte date: {answered} / {total}</div>
              </div>
            </div>
          ) : (
            <div className="fullpage-questions-container">
              {activeQuiz.questions.map((q, idx) => renderQuestionCard(q, idx))}
              <div className="fullpage-navigation">
                <div className="answered-count">Risposte date: {answered} / {total}</div>
                {!showResults && (
                  <button 
                    className="btn btn-success btn-large" 
                    onClick={handleCorrectQuiz}
                  >
                    Correggi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Loading state quiz
  if (loadingQuiz) {
    return (
      <div className="public-quizzes-page">
        <div className="container">
          <div className="public-quizzes-loading">
            <div className="loading-spinner-large"></div>
            <p>Caricamento quiz in corso...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state quiz
  if (quizError) {
    return (
      <div className="public-quizzes-page">
        <div className="container">
          <div className="public-quizzes-error">
            <div className="error-icon">❌</div>
            <h3>Errore di caricamento quiz</h3>
            <p>{quizError}</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setQuizError(null);
                setStartQuizModal({ isOpen: false, quiz: null });
              }}
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="public-quizzes-page">
        <div className="container">
          <div className="public-quizzes-header">
            <h1 className="public-quizzes-title">Quiz Pubblici</h1>
            <p className="public-quizzes-subtitle">
              Scegli un quiz e mettiti alla prova
            </p>
          </div>
          <div className="public-quizzes-loading">
            <div className="loading-spinner-large"></div>
            <p>Caricamento quiz pubblici...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="public-quizzes-page">
        <div className="container">
          <div className="public-quizzes-header">
            <h1 className="public-quizzes-title">Quiz Pubblici</h1>
            <p className="public-quizzes-subtitle">
              Scegli un quiz e mettiti alla prova
            </p>
          </div>
          <div className="public-quizzes-error">
            <div className="error-icon">❌</div>
            <h3>Errore di caricamento</h3>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setError(null);
                setCurrentPage(0);
              }}
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (quizzes.length === 0) {
    return (
      <div className="public-quizzes-page">
        <div className="container">
          <div className="public-quizzes-header">
            <h1 className="public-quizzes-title">Quiz Pubblici</h1>
            <p className="public-quizzes-subtitle">
              Scegli un quiz e mettiti alla prova
            </p>
          </div>
          <div className="public-quizzes-empty">
            <div className="empty-icon">📚</div>
            <h3>Nessun quiz pubblico disponibile</h3>
            <p>Al momento non ci sono quiz pubblici. Torna più tardi!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-quizzes-page">
      <div className="container">
        <div className="public-quizzes-header">
          <h1 className="public-quizzes-title">Quiz Pubblici</h1>
          <p className="public-quizzes-subtitle">
            Scegli un quiz e mettiti alla prova
          </p>
          {totalElements > 0 && (
            <p className="public-quizzes-count">
              {totalElements} quiz {totalElements === 1 ? 'disponibile' : 'disponibili'}
            </p>
          )}
        </div>

        <div className="public-quizzes-grid">
          {quizzes.map((quiz) => (
            <PublicQuizCard
              key={quiz.id}
              quiz={quiz}
              onStartQuiz={handleStartQuiz}
              onOpenComments={handleOpenComments}
            />
          ))}
        </div>

        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              ← Precedente
            </button>
            
            <div className="pagination-info">
              Pagina {currentPage + 1} di {totalPages}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Successiva →
            </button>
          </div>
        )}
      </div>

      <StartPublicQuizModal
        isOpen={startQuizModal.isOpen}
        quiz={startQuizModal.quiz}
        onConfirm={handleConfirmStartQuiz}
        onCancel={handleCancelStartQuiz}
        loading={loadingQuiz}
      />
    </div>
  );
};

export default PublicQuizzes;

