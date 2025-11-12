import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../services/userApi';
import '../styles/test.css';

/**
 * Pagina per visualizzare i risultati del test
 */
const TestResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ottieni i dati del test dallo stato di navigazione
  const { questions, userAnswers, quizTitle, questionCount, quizDescription } = location.state || {};
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

  // Handler per salvare i risultati
  const handleSaveResults = async () => {
    if (!questions || !userAnswers || !quizId) {
      setSaveError('Dati insufficienti per salvare i risultati');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      // Formatta i dati secondo la struttura richiesta
      const quizInfos = {
        quizId: parseInt(quizId),
        title: quizTitle || 'Quiz',
        description: quizDescription || '',
        domande: questions.map(question => ({
          titolo: question.title || '',
          descrizione: question.question,
          risposte: question.answers.map(answer => ({
            testo: answer.answer,
            corretta: answer.correct,
            chosen: (userAnswers[question.id] || []).includes(answer.id)
          }))
        }))
      };

      await userApi.savePrivateAnswers(quizInfos);
      setSaved(true);
    } catch (error) {
      console.error('Errore salvataggio risultati:', error);
      setSaveError(error.message || 'Errore durante il salvataggio dei risultati');
    } finally {
      setSaving(false);
    }
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

        {/* Sezione salvataggio risultati */}
        <div className="save-results-section">
          <div className="save-results-info">
            <div className="info-icon">🔒</div>
            <p className="info-text">
              I risultati salvati saranno visibili solo a te nella tua area personale
            </p>
          </div>
          
          {saved ? (
            <div className="save-success">
              <span className="success-icon">✓</span>
              <span className="success-text">Risultati salvati con successo</span>
            </div>
          ) : (
            <button 
              onClick={handleSaveResults}
              className="btn btn-success btn-large"
              disabled={saving}
            >
              {saving ? 'Salvataggio...' : 'Salva Risultati'}
            </button>
          )}
          
          {saveError && (
            <div className="save-error">
              <span className="error-icon">⚠</span>
              <span className="error-text">{saveError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResults;
