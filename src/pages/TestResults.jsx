import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/test.css';

/**
 * Pagina per visualizzare i risultati del test
 */
const TestResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ottieni i dati del test dallo stato di navigazione
  const { questions, userAnswers, quizTitle, questionCount } = location.state || {};
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calcola i risultati del test
  useEffect(() => {
    if (!questions || !userAnswers) {
      // Se non ci sono dati, reindirizza alla dashboard
      navigate('/dashboard');
      return;
    }

    const calculateResults = () => {
      let correctAnswers = 0;
      let totalQuestions = questions.length;
      const questionResults = [];

      questions.forEach(question => {
        const userSelectedAnswers = userAnswers[question.id] || [];
        const correctAnswerIds = question.answers
          .filter(answer => answer.correct)
          .map(answer => answer.id);

        // Verifica se la risposta è corretta
        const isCorrect = 
          userSelectedAnswers.length === correctAnswerIds.length &&
          userSelectedAnswers.every(id => correctAnswerIds.includes(id)) &&
          correctAnswerIds.every(id => userSelectedAnswers.includes(id));

        if (isCorrect) {
          correctAnswers++;
        }

        questionResults.push({
          question,
          userSelectedAnswers,
          correctAnswerIds,
          isCorrect,
          isAnswered: userSelectedAnswers.length > 0
        });
      });

      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      return {
        correctAnswers,
        totalQuestions,
        score,
        questionResults
      };
    };

    setResults(calculateResults());
    setLoading(false);
  }, [questions, userAnswers, navigate]);

  // Handler per tornare alla dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handler per rifare il test
  const handleRetakeTest = () => {
    navigate(`/quiz/${quizId}`, { 
      state: { showTestConfig: true } 
    });
  };

  // Loading state
  if (loading || !results) {
    return (
      <div className="test-results-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Calcolo Risultati</h2>
            <p>Correzione del test in corso...</p>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'sufficient';
    return 'insufficient';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Eccellente';
    if (score >= 70) return 'Buono';
    if (score >= 60) return 'Sufficiente';
    return 'Insufficiente';
  };

  return (
    <div className="test-results">
      <div className="container">
        {/* Header risultati */}
        <div className="results-header">
          <button 
            onClick={handleBackToDashboard}
            className="back-button"
          >
            ← Dashboard
          </button>
          <div className="results-info">
            <h1 className="results-title">Risultati Test</h1>
            <p className="quiz-title">{quizTitle}</p>
          </div>
        </div>

        {/* Pannello punteggio */}
        <div className="score-panel">
          <div className={`score-display ${getScoreColor(results.score)}`}>
            <div className="score-number">{results.score}%</div>
            <div className="score-label">{getScoreLabel(results.score)}</div>
          </div>
          
          <div className="score-details">
            <div className="score-stat">
              <span className="stat-label">Risposte corrette:</span>
              <span className="stat-value">{results.correctAnswers} / {results.totalQuestions}</span>
            </div>
            <div className="score-stat">
              <span className="stat-label">Domande risposte:</span>
              <span className="stat-value">
                {results.questionResults.filter(r => r.isAnswered).length} / {results.totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Dettaglio risposte */}
        <div className="questions-review">
          <h2 className="review-title">Revisione Risposte</h2>
          
          {results.questionResults.map((result, index) => (
            <div key={result.question.id} className={`question-review ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-review-header">
                <div className="question-number">
                  Domanda {index + 1}
                  <span className={`result-indicator ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                    {result.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
                {result.question.title && (
                  <div className="question-title">{result.question.title}</div>
                )}
              </div>
              
              <div className="question-content">
                <p className="question-text">{result.question.question}</p>
                
                <div className="answers-review">
                  {result.question.answers.map((answer) => {
                    const isUserSelected = result.userSelectedAnswers.includes(answer.id);
                    const isCorrectAnswer = answer.correct;
                    
                    let answerClass = 'answer-review';
                    if (isCorrectAnswer) {
                      answerClass += ' correct-answer';
                    }
                    if (isUserSelected && !isCorrectAnswer) {
                      answerClass += ' user-wrong';
                    }
                    if (isUserSelected && isCorrectAnswer) {
                      answerClass += ' user-correct';
                    }
                    
                    return (
                      <div key={answer.id} className={answerClass}>
                        <span className="answer-indicator">
                          {isUserSelected && '→ '}
                          {isCorrectAnswer && '✓ '}
                        </span>
                        <span className="answer-text">{answer.answer}</span>
                      </div>
                    );
                  })}
                </div>
                
                {!result.isAnswered && (
                  <div className="no-answer-notice">
                    Nessuna risposta fornita
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Azioni finali */}
        <div className="results-actions">
          <button 
            onClick={handleRetakeTest}
            className="btn btn-primary"
          >
            Rifai Test
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
  );
};

export default TestResults;
