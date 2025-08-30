import React, { useEffect } from 'react';

/**
 * Modal per confermare l'eliminazione di un quiz
 */
const DeleteQuizModal = ({ quiz, isOpen, onConfirm, onCancel, loading = false }) => {
  // Blocca lo scorrimento del body quando il modal è aperto
  useEffect(() => {
    if (isOpen) {
      // Salva lo scroll corrente e blocca il body
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Ripristina lo scorrimento quando il modal si chiude
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Non renderizzare se non è aperto
  if (!isOpen || !quiz) {
    return null;
  }

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onCancel();
    }
  };



  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Conferma Eliminazione
          </h2>
          <button 
            onClick={handleCancel}
            className="modal-close-btn"
            disabled={loading}
            title="Chiudi"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <div className="warning-icon-header">⚠️</div>
            
            <h3 className="delete-question">Sei sicuro di voler eliminare questo quiz?</h3>
            
            <div className="quiz-details-center">
              <strong>"{quiz.title}"</strong>
              {quiz.description && (
                <p className="quiz-description-preview">
                  {quiz.description}
                </p>
              )}
              <p className="question-count">
                {quiz.questionCount || 0} domande associate
              </p>
            </div>
            
            <div className="warning-message">
              <p>
                <strong>Questa azione non può essere annullata.</strong>
              </p>
              <p>
                Verranno eliminate anche tutte le domande e le risposte associate a questo quiz.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annulla
          </button>
          <button 
            onClick={handleConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Eliminazione...
              </>
            ) : (
              <>
                Elimina Quiz
              </>
            )}
          </button>
        </div>


      </div>
    </div>
  );
};

export default DeleteQuizModal;
