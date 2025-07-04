import React, { useState } from 'react';
import { questionsApi } from '../services/api';

const AddQuestionForm = ({ onQuestionAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    answers: [
      { answer: '', correct: false },
      { answer: '', correct: false }
    ]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = {
      ...newAnswers[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [...prev.answers, { answer: '', correct: false }]
    }));
  };

  const removeAnswer = (index) => {
    if (formData.answers.length > 2) {
      const newAnswers = formData.answers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        answers: newAnswers
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Il titolo è obbligatorio');
    }
    if (!formData.question.trim()) {
      throw new Error('La domanda è obbligatoria');
    }
    
    const validAnswers = formData.answers.filter(a => a.answer.trim());
    if (validAnswers.length < 2) {
      throw new Error('Servono almeno 2 risposte');
    }
    
    const correctAnswers = validAnswers.filter(a => a.correct);
    if (correctAnswers.length === 0) {
      throw new Error('Almeno una risposta deve essere corretta');
    }
    
    return validAnswers;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const validAnswers = validateForm();
      
      const questionData = {
        title: formData.title.trim(),
        question: formData.question.trim(),
        answers: validAnswers
      };
      
      await questionsApi.createQuestion(questionData);
      
      // Reset form
      setFormData({
        title: '',
        question: '',
        answers: [
          { answer: '', correct: false },
          { answer: '', correct: false }
        ]
      });
      
      setIsFormVisible(false);
      
      // Notifica il componente padre per aggiornare la lista
      if (onQuestionAdded) {
        onQuestionAdded();
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      question: '',
      answers: [
        { answer: '', correct: false },
        { answer: '', correct: false }
      ]
    });
    setError(null);
  };

  return (
    <div className="add-question-container">
      <div className="add-question-header">
        <h2>Aggiungi Nuova Domanda</h2>
        <button 
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            if (isFormVisible) resetForm();
          }}
          className={`btn ${isFormVisible ? 'btn-secondary' : ''}`}
        >
          {isFormVisible ? '❌ Annulla' : '➕ Nuova Domanda'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="question-form">
          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Titolo *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Inserisci il titolo della domanda"
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="question">Domanda *</label>
            <textarea
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Inserisci il testo della domanda"
              className="form-textarea"
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          <div className="answers-section">
            <div className="answers-header">
              <h3>Risposte *</h3>
              <button 
                type="button" 
                onClick={addAnswer}
                className="btn btn-small"
                disabled={isSubmitting}
              >
                ➕ Aggiungi Risposta
              </button>
            </div>

            {formData.answers.map((answer, index) => (
              <div key={index} className="answer-input-group">
                <div className="answer-input-wrapper">
                  <input
                    type="text"
                    value={answer.answer}
                    onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                    placeholder={`Risposta ${index + 1}`}
                    className="form-input answer-input"
                    disabled={isSubmitting}
                  />
                  
                  <label className="correct-checkbox">
                    <input
                      type="checkbox"
                      checked={answer.correct}
                      onChange={(e) => handleAnswerChange(index, 'correct', e.target.checked)}
                      disabled={isSubmitting}
                    />
                    <span className="checkbox-label">Corretta</span>
                  </label>
                  
                  {formData.answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="btn btn-danger btn-small"
                      disabled={isSubmitting}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              🔄 Reset
            </button>
            <button 
              type="submit" 
              className="btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Creazione...' : '💾 Crea Domanda'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddQuestionForm; 