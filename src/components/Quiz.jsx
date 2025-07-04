import React, { useState, useEffect } from 'react';
import { questionsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizSize, setQuizSize] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);
  const navigate = useNavigate();

  const startQuiz = async () => {
    // Validazione input
    if (quizSize < 1) {
      setError('Il numero di domande deve essere almeno 1');
      return;
    }
    if (quizSize > 50) {
      setError('Il numero massimo di domande è 50');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await questionsApi.getRandomQuestions(quizSize);
      
      if (data.length === 0) {
        setError('Nessuna domanda disponibile nel database');
        return;
      }
      
      if (data.length < quizSize) {
        setError(`Sono disponibili solo ${data.length} domande nel database`);
      }
      
      setQuestions(data);
      setQuizStarted(true);
      setUserAnswers({});
      setShowResults(false);
    } catch (err) {
      setError('Errore nel caricamento del quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const calculateResults = () => {
    let correct = 0;
    let total = questions.length;

    questions.forEach(question => {
      const userAnswerId = userAnswers[question.id];
      const correctAnswer = question.answers.find(answer => answer.correct);
      
      if (userAnswerId && correctAnswer && userAnswerId === correctAnswer.id) {
        correct++;
      }
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const handleSubmitQuiz = () => {
    const unanswered = questions.filter(q => !userAnswers[q.id]);
    
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `Hai ${unanswered.length} domande senza risposta. Vuoi continuare comunque?`
      );
      if (!confirm) return;
    }

    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setError(null);
    setLoading(false);
  };

  const handleQuizSizeChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setQuizSize(value);
    if (error && value >= 1 && value <= 50) {
      setError(null);
    }
  };

  if (!quizStarted) {
    return (
      <div className="quiz-container">
        <div className="container">
          <div className="quiz-setup">
            <h1 className="quiz-title">🧠 Inizia un Nuovo Quiz!</h1>
            <p className="quiz-subtitle">
              Metti alla prova le tue conoscenze con domande casuali dal database
            </p>

            <div className="quiz-config">
              <div className="form-group">
                <label htmlFor="quizSize">Numero di domande:</label>
                <input
                  type="number"
                  id="quizSize"
                  value={quizSize}
                  onChange={handleQuizSizeChange}
                  min="1"
                  max="50"
                  className="form-input quiz-number-input"
                  placeholder="Inserisci numero domande (1-50)"
                  disabled={loading}
                />
                <small className="input-help">
                  Inserisci un numero tra 1 e 50
                </small>
              </div>

              <div className="quiz-actions">
                <button 
                  onClick={startQuiz} 
                  className="btn btn-large"
                  disabled={loading || quizSize < 1 || quizSize > 50}
                >
                  {loading ? '⏳ Caricamento...' : '🎯 Richiedi Domande'}
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  ← Torna alla Home
                </button>
              </div>
            </div>

            {error && (
              <div className="quiz-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    return (
      <div className="quiz-container">
        <div className="container">
          <div className="quiz-results">
            <h1 className="results-title">📊 Risultati del Quiz</h1>
            
            <div className="results-summary">
              <div className={`results-score ${results.percentage >= 70 ? 'good' : results.percentage >= 50 ? 'average' : 'poor'}`}>
                <div className="score-circle">
                  <span className="score-percentage">{results.percentage}%</span>
                </div>
                <p className="score-text">
                  {results.correct} su {results.total} corrette
                </p>
              </div>
            </div>

            <div className="results-details">
              <h3>📋 Dettaglio Risposte</h3>
              {questions.map((question, index) => {
                const userAnswerId = userAnswers[question.id];
                const correctAnswer = question.answers.find(answer => answer.correct);
                const userAnswer = question.answers.find(answer => answer.id === userAnswerId);
                const isCorrect = userAnswerId === correctAnswer?.id;

                return (
                  <div key={question.id} className={`result-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="result-header">
                      <h4>Domanda {index + 1}: {question.title}</h4>
                      <span className={`result-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✅ Corretta' : '❌ Sbagliata'}
                      </span>
                    </div>
                    
                    <p className="result-question-text">{question.question}</p>
                    
                    <div className="result-answers">
                      <div className="answer-line">
                        <strong>La tua risposta:</strong> 
                        <span className={isCorrect ? 'user-correct' : 'user-wrong'}>
                          {userAnswer ? userAnswer.answer : 'Nessuna risposta'}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="answer-line">
                          <strong>Risposta corretta:</strong> 
                          <span className="correct-answer">
                            {correctAnswer?.answer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="results-actions">
              <button onClick={resetQuiz} className="btn">
                🔄 Nuovo Quiz
              </button>
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                🏠 Torna alla Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="container">
        <div className="quiz-header">
          <h1 className="quiz-title">📝 Quiz in Corso</h1>
          <div className="quiz-progress">
            <span>Domande: {questions.length}</span>
            <span>Risposte: {Object.keys(userAnswers).length}/{questions.length}</span>
          </div>
        </div>

        <div className="quiz-questions">
          {questions.map((question, index) => (
            <div key={question.id} className="quiz-question">
              <div className="question-number">
                Domanda {index + 1} di {questions.length}
              </div>
              
              <h3 className="question-title">{question.title}</h3>
              <p className="question-text">{question.question}</p>

              <div className="question-answers">
                {question.answers.map((answer) => (
                  <label key={answer.id} className="answer-option">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={answer.id}
                      checked={userAnswers[question.id] === answer.id}
                      onChange={() => handleAnswerSelect(question.id, answer.id)}
                    />
                    <span className="answer-text">{answer.answer}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-submit">
          <button 
            onClick={handleSubmitQuiz}
            className="btn btn-large submit-btn"
          >
            📊 Correggi Quiz
          </button>
          
          <button 
            onClick={resetQuiz}
            className="btn btn-secondary"
          >
            🔄 Ricomincia
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 