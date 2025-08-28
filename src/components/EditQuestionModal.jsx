import React, { useState, useEffect } from 'react';

/**
 * Modal per modificare titolo e testo di una domanda
 */
const EditQuestionModal = ({ question, isOpen, onSave, onCancel, loading = false }) => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [errors, setErrors] = useState({});

  // Inizializza i campi quando si apre il modal
  useEffect(() => {
    if (isOpen && question) {
      setTitle(question.title || '');
      setQuestionText(question.question || '');
      setErrors({});
    }
  }, [isOpen, question]);

  // Validazione form
  const validateForm = () => {
    const newErrors = {};
    
    if (!questionText.trim()) {
      newErrors.questionText = 'Il testo della domanda è obbligatorio';
    } else if (questionText.trim().length < 5) {
      newErrors.questionText = 'Il testo della domanda deve avere almeno 5 caratteri';
    }

    if (title && title.trim().length > 0 && title.trim().length < 3) {
      newErrors.title = 'Il titolo deve avere almeno 3 caratteri o essere vuoto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler per salvare
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const updatedQuestion = {
      id: question.id,
      title: title.trim() || null,
      question: questionText.trim()
    };

    onSave(updatedQuestion);
  };

  // Handler per tasti (Enter = salva, Esc = annulla)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  // Non renderizzare se non è aperto
  if (!isOpen || !question) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            ✏️ Modifica Domanda
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
                onKeyDown={handleKeyDown}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Inserisci un titolo per la domanda..."
                disabled={loading}
                maxLength={200}
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
                onKeyDown={handleKeyDown}
                className={`form-textarea ${errors.questionText ? 'error' : ''}`}
                placeholder="Inserisci il testo della domanda..."
                disabled={loading}
                rows={4}
                maxLength={1000}
              />
              {errors.questionText && (
                <div className="form-error">{errors.questionText}</div>
              )}
              <div className="form-hint">
                {questionText.length}/1000 caratteri
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
                Salvando...
              </>
            ) : (
              <>
                💾 Salva Modifiche
              </>
            )}
          </button>
        </div>

        <div className="modal-shortcuts">
          <small>
            💡 <strong>Scorciatoie:</strong> Ctrl+Enter = Salva, Esc = Annulla
          </small>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
