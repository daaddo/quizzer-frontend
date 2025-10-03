import React, { useState, useEffect } from 'react';

/**
 * Modal per creare una nuova domanda con risposte
 */
const CreateQuestionModal = ({ isOpen, quizId, onSave, onCancel, loading = false }) => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState([
    { answer: '', correct: false },
    { answer: '', correct: false }
  ]);
  const [errors, setErrors] = useState({});

  // Blocca lo scorrimento del body quando il modal è aperto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Reset form quando si apre il modal
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setQuestionText('');
      setAnswers([
        { answer: '', correct: false },
        { answer: '', correct: false }
      ]);
      setErrors({});
    }
  }, [isOpen]);

  // Validazione form
  const validateForm = () => {
    const newErrors = {};
    
    // Validazione titolo (richiesto)
    if (!title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Il titolo deve avere almeno 3 caratteri';
    }

    // Validazione domanda
    if (!questionText.trim()) {
      newErrors.questionText = 'Il testo della domanda è obbligatorio';
    } else if (questionText.trim().length < 5) {
      newErrors.questionText = 'Il testo della domanda deve avere almeno 5 caratteri';
    }

    // Validazione risposte
    const validAnswers = answers.filter(answer => answer.answer.trim());
    if (validAnswers.length < 1) {
      newErrors.answers = 'Inserisci almeno una risposta';
    }

    // Verifica che ci sia almeno una risposta corretta
    const correctAnswers = validAnswers.filter(answer => answer.correct);
    if (correctAnswers.length === 0) {
      newErrors.correctAnswer = 'Almeno una risposta deve essere corretta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler per salvare
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const validAnswers = answers.filter(answer => answer.answer.trim());
    
    const newQuestion = {
      title: title.trim(),
      question: questionText.trim(),
      quizId: quizId,
      isMultipleChoice: validAnswers.filter(a => a.correct).length > 1,
      answers: validAnswers.map(answer => ({
        answer: answer.answer.trim(),
        isCorrect: !!answer.correct
      }))
    };

    onSave(newQuestion);
  };

  // Handler per aggiungere risposta
  const handleAddAnswer = () => {
    if (answers.length < 10) {
      setAnswers([...answers, { answer: '', correct: false }]);
    }
  };

  // Handler per rimuovere risposta
  const handleRemoveAnswer = (index) => {
    if (answers.length > 1) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
    }
  };

  // Handler per modificare testo risposta
  const handleAnswerTextChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = value;
    setAnswers(newAnswers);
  };

  // Handler per modificare correttezza risposta
  const handleAnswerCorrectChange = (index, correct) => {
    const newAnswers = [...answers];
    newAnswers[index].correct = correct;
    setAnswers(newAnswers);
  };

  // Non renderizzare se non è aperto
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content create-question-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Crea Nuova Domanda
          </h2>
          <button 
            onClick={onCancel}
            className="modal-close-btn"
            disabled={loading}
            title="Chiudi"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Campo Titolo */}
            <div className="form-group">
              <label htmlFor="question-title" className="form-label">
                Titolo (opzionale)
              </label>
              <input
                id="question-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Inserisci un titolo per la domanda..."
                disabled={loading}
                maxLength={599}
              />
              {errors.title && (
                <div className="form-error">{errors.title}</div>
              )}
            </div>

            {/* Campo Domanda */}
            <div className="form-group">
              <label htmlFor="question-text" className="form-label">
                Testo Domanda *
              </label>
              <textarea
                id="question-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className={`form-textarea ${errors.questionText ? 'error' : ''}`}
                placeholder="Inserisci il testo della domanda..."
                disabled={loading}
                rows={3}
                maxLength={1199}
              />
              {errors.questionText && (
                <div className="form-error">{errors.questionText}</div>
              )}
            </div>

            {/* Sezione Risposte */}
            <div className="form-group">
              <div className="answers-header">
                <label className="form-label">Risposte *</label>
                <button
                  type="button"
                  onClick={handleAddAnswer}
                  className="btn btn-small btn-secondary"
                  disabled={loading || answers.length >= 10}
                >
                  Aggiungi Risposta
                </button>
              </div>
              
              <div className="answers-container">
                {answers.map((answer, index) => (
                  <div key={index} className="answer-item">
                    <div className="answer-input-group">
                      <input
                        type="text"
                        value={answer.answer}
                        onChange={(e) => handleAnswerTextChange(index, e.target.value)}
                        className="form-input answer-input"
                        placeholder={`Risposta ${index + 1}...`}
                        disabled={loading}
                        maxLength={599}
                      />
                      <div className="answer-controls">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={answer.correct}
                            onChange={(e) => handleAnswerCorrectChange(index, e.target.checked)}
                            disabled={loading}
                          />
                          <span className="checkbox-text">Corretta</span>
                        </label>
                        {answers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAnswer(index)}
                            className="btn-remove-answer"
                            disabled={loading}
                            title="Rimuovi risposta"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {errors.answers && (
                <div className="form-error">{errors.answers}</div>
              )}
              {errors.correctAnswer && (
                <div className="form-error">{errors.correctAnswer}</div>
              )}
              
              <div className="form-hint">
                Massimo 10 risposte. Almeno una deve essere corretta.
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button 
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annulla
          </button>
          <button 
            onClick={handleSave}
            className="btn btn-primary"
            disabled={loading || !questionText.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Creando...
              </>
            ) : (
              <>
                Crea Domanda
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionModal;
