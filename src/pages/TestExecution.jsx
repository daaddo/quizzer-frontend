import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../styles/test.css';

/**
 * Pagina per l'esecuzione del test
 */
const TestExecution = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ottieni il numero di domande dai parametri di stato
  const questionCount = location.state?.questionCount || 10;
  const quizTitle = location.state?.quizTitle || `Quiz ${quizId}`;
  const viewMode = location.state?.viewMode || 'scrolling';
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);

  // Carica le domande casuali per il test
  useEffect(() => {
    const loadTestQuestions = async () => {
      if (!quizId) {
        setError('ID quiz non valido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const questionsData = await userApi.getRandomQuestions(parseInt(quizId), questionCount);
        console.log('Test questions loaded:', questionsData);
        setQuestions(questionsData);
        
      } catch (err) {
        console.error('Test loading error:', err);
        setError(err.message || 'Errore nel caricamento del test');
      } finally {
        setLoading(false);
      }
    };

    loadTestQuestions();
  }, [quizId, questionCount]);

  // Handler per tornare alla dashboard
  const handleBackToDashboard = () => {
    if (window.confirm('Sei sicuro di voler abbandonare il test? Tutti i progressi andranno persi.')) {
      navigate('/dashboard');
    }
  };

  // Handler per gestire le risposte
  const handleAnswerChange = (questionId, answerId, checked) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Determina se la domanda ha risposte multiple
    const correctAnswersCount = question.answers.filter(a => a.correct).length;
    const isMultipleChoice = correctAnswersCount > 1;

    setUserAnswers(prev => {
      const questionAnswers = prev[questionId] || [];
      
      if (isMultipleChoice) {
        // Checkbox - gestione multipla
        if (checked) {
          return {
            ...prev,
            [questionId]: [...questionAnswers, answerId]
          };
        } else {
          return {
            ...prev,
            [questionId]: questionAnswers.filter(id => id !== answerId)
          };
        }
      } else {
        // Radio - selezione singola
        return {
          ...prev,
          [questionId]: checked ? [answerId] : []
        };
      }
    });
  };

  // Handler per navigazione tra domande
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handler per saltare a una domanda specifica
  const handleJumpToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Handler per completare il test
  const handleCompleteTest = () => {
    const answeredQuestions = Object.keys(userAnswers).length;
    const totalQuestions = questions.length;
    
    if (answeredQuestions < totalQuestions) {
      const unanswered = totalQuestions - answeredQuestions;
      if (!window.confirm(`Hai ${unanswered} domande senza risposta. Vuoi completare il test comunque?`)) {
        return;
      }
    }

    // Naviga ai risultati con i dati del test
    navigate(`/test/${quizId}/results`, {
      state: {
        questions,
        userAnswers,
        quizTitle,
        questionCount
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="test-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Preparazione Test</h2>
            <p>Caricamento delle domande in corso...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="test-error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">⚠</div>
            <h2>Errore nel Caricamento del Test</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Riprova
              </button>
              <button 
                onClick={handleBackToDashboard}
                className="btn btn-secondary"
              >
                Torna alla Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="test-empty">
        <div className="container">
          <div className="empty-content">
            <div className="empty-icon">📝</div>
            <h2>Nessuna Domanda Disponibile</h2>
            <p>Questo quiz non contiene domande sufficienti per il test.</p>
            <button 
              onClick={handleBackToDashboard}
              className="btn btn-primary"
            >
              Torna alla Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const correctAnswersCount = currentQuestion?.answers.filter(a => a.correct).length || 0;
  const isMultipleChoice = correctAnswersCount > 1;
  const questionAnswers = userAnswers[currentQuestion?.id] || [];

  // Componente per la navigazione rapida delle domande
  const QuestionNavigator = () => (
    <div className="question-navigator">
      <div className="navigator-title">Navigazione Rapida:</div>
      <div className="question-numbers">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleJumpToQuestion(index)}
            className={`question-number-btn ${
              index === currentQuestionIndex ? 'current' : ''
            } ${
              userAnswers[questions[index]?.id] ? 'answered' : ''
            }`}
            title={`Vai alla domanda ${index + 1}${
              userAnswers[questions[index]?.id] ? ' (risposta data)' : ' (non risposta)'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );

  // Componente per una singola domanda (da usare in modalità fullpage)
  const SingleQuestion = ({ question, index }) => {
    const correctAnswersCount = question.answers.filter(a => a.correct).length;
    const isMultipleChoice = correctAnswersCount > 1;
    const questionAnswers = userAnswers[question.id] || [];

    return (
      <div className="question-card test-question fullpage-question" id={`question-${index}`}>
        <div className="question-header">
          <div className="question-number">
            Domanda {index + 1}
          </div>
          {question.title && (
            <div className="question-title">
              {question.title}
            </div>
          )}
        </div>
        
        <div className="question-content">
          <p className="question-text">{question.question}</p>
          
          <div className="answers-container">
            <div className="answer-type-hint">
              {isMultipleChoice ? 
                'Seleziona tutte le risposte corrette:' : 
                'Seleziona una risposta:'
              }
            </div>
            
            {question.answers.map((answer) => {
              const isSelected = questionAnswers.includes(answer.id);
              
              return (
                <label 
                  key={answer.id} 
                  className={`answer-option ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    type={isMultipleChoice ? 'checkbox' : 'radio'}
                    name={`question-${question.id}`}
                    value={answer.id}
                    checked={isSelected}
                    onChange={(e) => handleAnswerChange(
                      question.id, 
                      answer.id, 
                      e.target.checked
                    )}
                  />
                  <span className="answer-text">{answer.answer}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`test-execution ${viewMode === 'fullpage' ? 'fullpage-mode' : 'scrolling-mode'}`}>
      <div className="container">
        {/* Header del test */}
        <div className="test-header">
          <button 
            onClick={handleBackToDashboard}
            className="back-button"
          >
            ← Abbandona Test
          </button>
          <div className="test-info">
            <h1 className="test-title">{quizTitle}</h1>
            <div className="test-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${viewMode === 'fullpage' ? (Object.keys(userAnswers).length / questions.length) * 100 : progress}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {viewMode === 'fullpage' 
                  ? `Risposte date: ${Object.keys(userAnswers).length} di ${questions.length}`
                  : `Domanda ${currentQuestionIndex + 1} di ${questions.length}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Navigatore rapido per modalità scorrimento */}
        {viewMode === 'scrolling' && <QuestionNavigator />}

        {/* Contenuto basato sulla modalità di visualizzazione */}
        {viewMode === 'scrolling' ? (
          /* Modalità Scorrimento - Domanda corrente */
          <div className="test-question-container">
            <div className="question-card test-question">
              <div className="question-header">
                <div className="question-number">
                  Domanda {currentQuestionIndex + 1}
                </div>
                {currentQuestion.title && (
                  <div className="question-title">
                    {currentQuestion.title}
                  </div>
                )}
              </div>
              
              <div className="question-content">
                <p className="question-text">{currentQuestion.question}</p>
                
                <div className="answers-container">
                  <div className="answer-type-hint">
                    {isMultipleChoice ? 
                      'Seleziona tutte le risposte corrette:' : 
                      'Seleziona una risposta:'
                    }
                  </div>
                  
                  {currentQuestion.answers.map((answer) => {
                    const isSelected = questionAnswers.includes(answer.id);
                    
                    return (
                      <label 
                        key={answer.id} 
                        className={`answer-option ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type={isMultipleChoice ? 'checkbox' : 'radio'}
                          name={`question-${currentQuestion.id}`}
                          value={answer.id}
                          checked={isSelected}
                          onChange={(e) => handleAnswerChange(
                            currentQuestion.id, 
                            answer.id, 
                            e.target.checked
                          )}
                        />
                        <span className="answer-text">{answer.answer}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Modalità Pagina Completa - Tutte le domande */
          <div className="fullpage-questions-container">
            {questions.map((question, index) => (
              <SingleQuestion key={question.id} question={question} index={index} />
            ))}
          </div>
        )}

        {/* Navigazione */}
        <div className="test-navigation">
          {viewMode === 'scrolling' ? (
            /* Navigazione per modalità scorrimento */
            <>
              <div className="nav-buttons">
                <button 
                  onClick={handlePreviousQuestion}
                  className="btn btn-secondary"
                  disabled={currentQuestionIndex === 0}
                >
                  Precedente
                </button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <button 
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                  >
                    Successiva
                  </button>
                ) : (
                  <button 
                    onClick={handleCompleteTest}
                    className="btn btn-success"
                  >
                    Completa Test
                  </button>
                )}
              </div>
              
              <div className="answered-count">
                Risposte date: {Object.keys(userAnswers).length} / {questions.length}
              </div>
            </>
          ) : (
            /* Navigazione per modalità pagina completa */
            <div className="fullpage-navigation">
              <div className="answered-count">
                Risposte date: {Object.keys(userAnswers).length} / {questions.length}
              </div>
              <button 
                onClick={handleCompleteTest}
                className="btn btn-success btn-large"
              >
                Completa Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestExecution;
