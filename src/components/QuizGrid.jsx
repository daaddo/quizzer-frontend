import React from 'react';
import QuizCard from './QuizCard';

/**
 * Componente grid per visualizzare la lista dei quiz
 */
const QuizGrid = ({ quizzes, loading, onQuizClick }) => {
  if (loading) {
    return (
      <div className="quiz-grid-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento quiz...</p>
      </div>
    );
  }

  // Debug: mostra cosa contiene quizzes
  console.log('QuizGrid received quizzes:', quizzes, 'Type:', typeof quizzes);
  
  // Assicurati che quizzes sia sempre un array
  const quizzesArray = Array.isArray(quizzes) ? quizzes : [];

  if (quizzesArray.length === 0) {
    return (
      <div className="quiz-grid-empty">
        <div className="empty-icon">📚</div>
        <h3>Nessun Quiz Trovato</h3>
        <p>Non hai ancora creato nessun quiz. I tuoi quiz appariranno qui una volta creati.</p>
      </div>
    );
  }

  return (
    <div className="quiz-grid">
      <h2 className="quiz-section-title">🧠 I Tuoi Quiz</h2>
      <div className="quiz-cards-container">
        {quizzesArray.map((quiz) => (
          <QuizCard 
            key={quiz.id} 
            quiz={quiz} 
            onQuizClick={onQuizClick}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizGrid;
