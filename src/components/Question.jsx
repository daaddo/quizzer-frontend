import React, { useState } from 'react';
import Answer from './Answer';

/**
 * Componente per visualizzare una singola domanda con le sue risposte
 * Struttura domanda: { id, title, question, answers: [{ id, answer, correct }] }
 */
const Question = ({ question, questionNumber, onDeleteQuestion, onEditQuestion, globalShowAnswers, onOverrideGlobal }) => {
  const [localShowAnswers, setLocalShowAnswers] = useState(false);
  
  if (!question) {
    return null;
  }

  // Combina controllo globale e locale: globale ha precedenza quando attivo, ma pulsanti restano abilitati
  const shouldShowAnswers = globalShowAnswers !== null ? globalShowAnswers : localShowAnswers;

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

  // Handler per toggle visibilità risposte locali
  const handleToggleAnswers = () => {
    // Se c'è un controllo globale attivo, lo disattiva prima di agire localmente
    if (globalShowAnswers !== null && onOverrideGlobal) {
      onOverrideGlobal(); // Resetta il controllo globale a null
    }
    setLocalShowAnswers(!localShowAnswers);
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
            onClick={handleToggleAnswers}
            className="spoiler-btn"
            title={globalShowAnswers !== null ? 
              `${shouldShowAnswers ? 'Nascondi' : 'Mostra'} risposte (sovrascrive controllo globale)` : 
              (shouldShowAnswers ? 'Nascondi risposte' : 'Mostra risposte')
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {shouldShowAnswers ? 'Nascondi' : 'Mostra'}
          </button>
          <button 
            onClick={handleEditClick}
            className="edit-question-btn"
            title="Modifica domanda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            onClick={handleDeleteClick}
            className="delete-question-btn"
            title="Elimina domanda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="question-content">
        <h3 className="question-text">
          {question.question}
        </h3>
        
        <div className={`answers-container ${shouldShowAnswers ? 'visible' : 'hidden'}`}>
          {shouldShowAnswers && question.answers && question.answers.length > 0 ? (
            question.answers.map((answer, index) => (
              <Answer 
                key={answer.id}
                answer={answer}
                answerLetter={String.fromCharCode(65 + index)} // A, B, C, D...
              />
            ))
          ) : shouldShowAnswers ? (
            <div className="no-answers">
              <p>Nessuna risposta disponibile per questa domanda.</p>
            </div>
          ) : (
            <div className="answers-hidden">
              <p>Clicca "Mostra" per visualizzare le risposte</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question;
