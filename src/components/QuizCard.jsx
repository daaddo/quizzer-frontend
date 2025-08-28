import React from 'react';

/**
 * Componente card per visualizzare un singolo quiz
 * Struttura quiz: { id, title, description, questionCount }
 */
const QuizCard = ({ quiz, onQuizClick }) => {
  const handleClick = () => {
    if (onQuizClick) {
      onQuizClick(quiz.id, quiz);
    }
  };

  return (
    <div className="quiz-card" onClick={handleClick}>
      <div className="quiz-card-header">
        <h3 className="quiz-title">{quiz.title || 'Quiz Senza Nome'}</h3>
      </div>
      
      <div className="quiz-card-body">
        <p className="quiz-description">
          {quiz.description || 'Nessuna descrizione disponibile'}
        </p>
        
        <div className="quiz-stats">
          <div className="quiz-stat">
            <span className="stat-icon">❓</span>
            <span className="stat-text">{quiz.questionCount || 0} domande</span>
          </div>
        </div>
      </div>
      
      <div className="quiz-card-footer">
        <button className="quiz-action-btn">
          🎯 Visualizza Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
