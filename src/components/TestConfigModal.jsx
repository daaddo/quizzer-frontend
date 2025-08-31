import React, { useState, useEffect } from 'react';

/**
 * Modal per configurare i parametri del test
 */
const TestConfigModal = ({ quiz, isOpen, onStart, onCancel, loading = false }) => {
  const [questionCount, setQuestionCount] = useState(10);
  const [viewMode, setViewMode] = useState('scrolling'); // 'scrolling' or 'fullpage'
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
      setQuestionCount(10);
      setViewMode('scrolling');
      setErrors({});
    }
  }, [isOpen]);

  // Validazione form
  const validateForm = () => {
    const newErrors = {};
    
    if (!questionCount || questionCount < 5) {
      newErrors.questionCount = 'Il numero minimo di domande è 5';
    } else if (questionCount > 150) {
      newErrors.questionCount = 'Il numero massimo di domande è 150';
    }

    // Verifica che il quiz abbia abbastanza domande
    if (quiz && quiz.questionCount && questionCount > quiz.questionCount) {
      newErrors.questionCount = `Il quiz ha solo ${quiz.questionCount} domande disponibili`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler per avviare il test
  const handleStart = () => {
    if (!validateForm()) {
      return;
    }

    onStart(questionCount, viewMode);
  };

  // Handler per cambio numero domande
  const handleQuestionCountChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setQuestionCount(value);
  };

  // Handler per cambio modalità visualizzazione
  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
  };

  // Non renderizzare se non è aperto
  if (!isOpen || !quiz) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content test-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Configura Test
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
          <div className="test-config-info">
            <h3>Quiz: {quiz.title}</h3>
            {quiz.description && (
              <p className="quiz-description">{quiz.description}</p>
            )}
            <div className="quiz-stats">
              <span className="stat-badge">
                Domande disponibili: {quiz.questionCount || 0}
              </span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="question-count" className="form-label">
                Numero di domande per il test *
              </label>
              <input
                id="question-count"
                type="number"
                value={questionCount}
                onChange={handleQuestionCountChange}
                className={`form-input ${errors.questionCount ? 'error' : ''}`}
                min="5"
                max="150"
                disabled={loading}
              />
              {errors.questionCount && (
                <div className="form-error">{errors.questionCount}</div>
              )}
              <div className="form-hint">
                Minimo: 5 domande - Massimo: 150 domande
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Modalità di visualizzazione *
              </label>
              <div className="view-mode-options">
                <label className="view-mode-option">
                  <input
                    type="radio"
                    name="viewMode"
                    value="scrolling"
                    checked={viewMode === 'scrolling'}
                    onChange={handleViewModeChange}
                    disabled={loading}
                  />
                  <div className="view-mode-content">
                    <div className="view-mode-title">Modalità Scorrimento</div>
                    <div className="view-mode-description">
                      Una domanda alla volta con navigazione rapida
                    </div>
                  </div>
                </label>
                <label className="view-mode-option">
                  <input
                    type="radio"
                    name="viewMode"
                    value="fullpage"
                    checked={viewMode === 'fullpage'}
                    onChange={handleViewModeChange}
                    disabled={loading}
                  />
                  <div className="view-mode-content">
                    <div className="view-mode-title">Pagina Completa</div>
                    <div className="view-mode-description">
                      Tutte le domande visibili insieme in una lunga pagina
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="test-info-box">
              <h4>Informazioni sul test:</h4>
              <ul>
                <li>Le domande saranno selezionate casualmente</li>
                <li>Ogni domanda può avere una o più risposte corrette</li>
                <li>Il punteggio finale sarà calcolato automaticamente</li>
                <li>Una volta iniziato, non sarà possibile modificare le risposte</li>
              </ul>
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
            onClick={handleStart}
            className="btn btn-primary"
            disabled={loading || questionCount < 5 || questionCount > 150}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Preparando Test...
              </>
            ) : (
              <>
                Inizia Test ({questionCount} domande)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestConfigModal;

