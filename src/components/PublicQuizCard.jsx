import React from 'react';

/**
 * Componente card per visualizzare un singolo quiz pubblico
 * Mostra: nome, titolo, numero di domande, recensioni, stelle, tasto per iniziare e tasto commenti
 */
const PublicQuizCard = ({ quiz, onStartQuiz, onOpenComments }) => {
  // Tronca il rating alla prima cifra decimale
  const formatRating = (rating) => {
    if (!rating) return '0.0';
    return rating.toFixed(1);
  };

  // Genera stelle piene e vuote in base al rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="quiz-rating-stars">
        {/* Stelle piene */}
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star star-full">★</span>
        ))}
        {/* Stella mezza */}
        {hasHalfStar && <span className="star star-half">★</span>}
        {/* Stelle vuote */}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star star-empty">☆</span>
        ))}
      </div>
    );
  };

  const handleStartQuiz = (e) => {
    e.stopPropagation();
    if (onStartQuiz) {
      onStartQuiz(quiz);
    }
  };

  const handleOpenComments = (e) => {
    e.stopPropagation();
    if (onOpenComments) {
      onOpenComments(quiz);
    }
  };

  return (
    <div className="public-quiz-card">
      <div className="public-quiz-card-header">
        <h3 className="public-quiz-title">{quiz.title || 'Quiz Senza Nome'}</h3>
        {quiz.name && <p className="public-quiz-name">{quiz.name}</p>}
        {quiz.author && (
          <p className="public-quiz-author">
            <span className="author-icon">👤</span>
            Creato da: <strong>{quiz.author}</strong>
          </p>
        )}
      </div>
      
      <div className="public-quiz-card-body">
        <div className="public-quiz-stats">
          <div className="public-quiz-stat">
            <span className="stat-icon">❓</span>
            <span className="stat-text">{quiz.questionCount || 0} domande</span>
          </div>
          
          <div className="public-quiz-stat">
            <span className="stat-icon">💬</span>
            <span className="stat-text">{quiz.reviewCount || 0} recensioni</span>
          </div>
        </div>

        <div className="public-quiz-rating">
          {renderStars(quiz.rating || 0)}
          <span className="rating-value">{formatRating(quiz.rating || 0)}</span>
        </div>
      </div>
      
      <div className="public-quiz-card-footer">
        <button 
          className="public-quiz-action-btn primary"
          onClick={handleStartQuiz}
          title="Inizia quiz"
        >
          Inizia Quiz
        </button>
        <button 
          className="public-quiz-action-btn secondary"
          onClick={handleOpenComments}
          title="Vedi commenti"
          disabled
        >
          Commenti
        </button>
      </div>
    </div>
  );
};

export default PublicQuizCard;

