import React, { useState, useEffect } from 'react';

/**
 * Modal per modificare titolo e descrizione di un quiz
 */
const EditQuizModal = ({ quiz, isOpen, onSave, onCancel, loading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [originalIsPublic, setOriginalIsPublic] = useState(false);
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

  // Inizializza i campi quando si apre il modal
  useEffect(() => {
    if (isOpen && quiz) {
      setTitle(quiz.title || '');
      setDescription(quiz.description || '');
      const publicState = quiz.isPublic || false;
      setIsPublic(publicState);
      setOriginalIsPublic(publicState);
      setErrors({});
    }
  }, [isOpen, quiz]);

  // Validazione form
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Il titolo del quiz è obbligatorio';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Il titolo deve avere almeno 3 caratteri';
    }

    if (description && description.trim().length > 0 && description.trim().length < 5) {
      newErrors.description = 'La descrizione deve avere almeno 5 caratteri o essere vuota';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler per salvare
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const updatedQuiz = {
      id: quiz.id,
      title: title.trim(),
      description: description.trim() || null,
      isPublic: isPublic
    };

    onSave(updatedQuiz);
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
  if (!isOpen || !quiz) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Modifica Quiz
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
              <label htmlFor="quiz-title" className="form-label">
                Titolo Quiz *
              </label>
              <input
                id="quiz-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Inserisci il titolo del quiz..."
                disabled={loading}
                maxLength={599}
              />
              {errors.title && (
                <div className="form-error">{errors.title}</div>
              )}
            </div>

            {/* Campo Descrizione */}
            <div className="form-group">
              <label htmlFor="quiz-description" className="form-label">
                Descrizione (opzionale)
              </label>
              <textarea
                id="quiz-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Inserisci una descrizione del quiz..."
                disabled={loading}
                rows={4}
                maxLength={1199}
              />
              {errors.description && (
                <div className="form-error">{errors.description}</div>
              )}
              <div className="form-hint">
                {description.length}/1199 caratteri
              </div>
            </div>

            {/* Campo Quiz Pubblico */}
            <div className="form-group">
              <div className="checkbox-group">
                <label htmlFor="quiz-is-public" className="checkbox-label">
                  <input
                    id="quiz-is-public"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    disabled={loading}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    Rendi questo quiz pubblico
                  </span>
                </label>
                <div className="form-hint">
                  {isPublic 
                    ? 'Il quiz sarà visibile nella sezione Quiz Pubblici' 
                    : 'Il quiz rimarrà privato e visibile solo a te'}
                </div>
                
                {/* Avviso quando si modifica lo stato pubblico */}
                {isPublic !== originalIsPublic && (
                  <div className={`form-warning ${isPublic ? 'warning-online' : 'warning-offline'}`}>
                    {isPublic ? (
                      <>
                        <strong>Attenzione:</strong> Rendendo questo quiz pubblico, tutti gli utenti potranno accedervi e completarlo dalla sezione Quiz Pubblici.
                      </>
                    ) : (
                      <>
                        <strong>Attenzione:</strong> Rendendo questo quiz privato, tutte le informazioni pubbliche (stelle, recensioni, commenti) saranno cancellate definitivamente e il quiz non sarà più visibile nella sezione Quiz Pubblici.
                      </>
                    )}
                  </div>
                )}
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
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Salvando...
              </>
            ) : (
              <>
                Salva Modifiche
              </>
            )}
          </button>
        </div>

        <div className="modal-shortcuts">
          <small>
            Scorciatoie: Ctrl+Enter = Salva, Esc = Annulla
          </small>
        </div>
      </div>
    </div>
  );
};

export default EditQuizModal;
