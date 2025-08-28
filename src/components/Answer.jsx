import React from 'react';

/**
 * Componente per visualizzare una singola risposta
 * Struttura risposta: { id, answer, correct }
 */
const Answer = ({ answer, answerLetter }) => {
  if (!answer) {
    return null;
  }

  return (
    <div className={`answer-item ${answer.correct ? 'correct-answer' : 'incorrect-answer'}`}>
      <div className="answer-letter">
        {answerLetter}
      </div>
      <div className="answer-text">
        {answer.answer}
      </div>
      <div className="answer-indicator">
        {answer.correct ? (
          <span className="correct-icon">✅</span>
        ) : (
          <span className="incorrect-icon">❌</span>
        )}
      </div>
    </div>
  );
};

export default Answer;
