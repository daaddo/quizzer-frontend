import React from 'react';

/**
 * Componente card per visualizzare un singolo quiz
 * Struttura quiz: { id, title, description, questionCount }
 */
const QuizCard = ({ quiz, onQuizClick, onEditQuiz, onDeleteQuiz, onStartTest, onGenerateLink, onViewIssuedQuizzes }) => {
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

  const handleGenerateLink = (e) => {
    e.stopPropagation();
    if (onGenerateLink) {
      onGenerateLink(quiz);
    }
  };

  const handleViewIssued = (e) => {
    e.stopPropagation();
    if (onViewIssuedQuizzes) {
      onViewIssuedQuizzes(quiz);
    }
  };

  return (
    <div className="quiz-card" onClick={handleClick}>
      <button 
        className="quiz-delete-btn"
        onClick={handleDelete}
        title="Elimina Quiz"
        aria-label="Elimina quiz"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="quiz-card-header">
        <h3 className="quiz-title">{quiz.title || 'Quiz Senza Nome'}</h3>
        {quiz.isPublic && (
          <span className="quiz-badge public" title="Quiz pubblico">
            Pubblico
          </span>
        )}
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
          <div className="quiz-actions-primary">
            <button className="quiz-action-btn primary" title="Domande">
              Domande
            </button>
            <button 
              className="quiz-action-btn primary"
              onClick={handleViewIssued}
              title="Quiz creati"
              disabled={!quiz?.id && quiz?.id !== 0}
            >
              Quiz creati
            </button>
          </div>
          <div className="quiz-actions-secondary">
            <button 
              className="quiz-action-btn success"
              onClick={handleStartTest}
              title="Inizia Test"
              disabled={!quiz.questionCount || quiz.questionCount < 5}
            >
              Inizia Test
            </button>
            <button
              className="quiz-action-btn primary"
              onClick={handleGenerateLink}
              title="Genera quiz"
              disabled={!quiz.questionCount || quiz.questionCount < 1}
            >
              Genera quiz
            </button>
            <button 
              className="quiz-action-btn secondary"
              onClick={handleEdit}
              title="Modifica Quiz"
            >
              Modifica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
