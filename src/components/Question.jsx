import React from 'react';
import Answer from './Answer';

/**
 * Componente per visualizzare una singola domanda con le sue risposte
 * Struttura domanda: { id, title, question, answers: [{ id, answer, correct }] }
 */
const Question = ({ question, questionNumber, onDeleteQuestion, onEditQuestion }) => {
  if (!question) {
    return null;
  }

  // Handler per eliminare la domanda
  const handleDeleteClick = () => {
    if (onDeleteQuestion) {
      onDeleteQuestion(question.id, question);
    }
  };

  // Handler per modificare la domanda
  const handleEditClick = () => {
    if (onEditQuestion) {
      onEditQuestion(question);
    }
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-info">
          <div className="question-number">
            Domanda {questionNumber}
          </div>
          {question.title && (
            <div className="question-title">
              {question.title}
            </div>
          )}
        </div>
        <div className="question-actions">
          <button 
            onClick={handleEditClick}
            className="edit-question-btn"
            title="Modifica domanda"
          >
            ✏️
          </button>
          <button 
            onClick={handleDeleteClick}
            className="delete-question-btn"
            title="Elimina domanda"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="question-content">
        <h3 className="question-text">
          {question.question}
        </h3>
        
        <div className="answers-container">
          {question.answers && question.answers.length > 0 ? (
            question.answers.map((answer, index) => (
              <Answer 
                key={answer.id}
                answer={answer}
                answerLetter={String.fromCharCode(65 + index)} // A, B, C, D...
              />
            ))
          ) : (
            <div className="no-answers">
              <p>Nessuna risposta disponibile per questa domanda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question;
