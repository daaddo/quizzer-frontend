import React from 'react';

/**
 * Componente card per visualizzare un singolo quiz
 * Struttura quiz: { id, title, description, questionCount }
 */
const QuizCard = ({ quiz, onQuizClick, onEditQuiz, onDeleteQuiz, onStartTest }) => {
  const handleClick = () => {
    if (onQuizClick) {
      onQuizClick(quiz.id, quiz);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEditQuiz) {
      onEditQuiz(quiz);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDeleteQuiz) {
      onDeleteQuiz(quiz);
    }
  };

  const handleStartTest = (e) => {
    e.stopPropagation();
    if (onStartTest) {
      onStartTest(quiz);
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
        <div className="quiz-actions">
          <button className="quiz-action-btn primary" title="Visualizza Quiz">
            Visualizza
          </button>
          <button 
            className="quiz-action-btn success"
            onClick={handleStartTest}
            title="Inizia Test"
            disabled={!quiz.questionCount || quiz.questionCount < 5}
          >
            Inizia Test
          </button>
          <button 
            className="quiz-action-btn secondary"
            onClick={handleEdit}
            title="Modifica Quiz"
          >
            Modifica
          </button>
          <button 
            className="quiz-action-btn danger"
            onClick={handleDelete}
            title="Elimina Quiz"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
