import React, { useState } from 'react';

/**
 * Modal per avviare un quiz pubblico
 * Mostra un form di conferma prima di iniziare il quiz
 */
const StartPublicQuizModal = ({ isOpen, quiz, onConfirm, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onConfirm({
        quizId: quiz?.id,
        name: formData.name,
        email: formData.email
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '' });
    setErrors({});
    onCancel();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Inizia Quiz: {quiz?.title}</h2>
          <button 
            className="modal-close"
            onClick={handleCancel}
            disabled={loading}
          >
            ✕
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <p className="modal-description">
            Inserisci i tuoi dati per iniziare il quiz. 
            Riceverai i risultati via email al termine.
          </p>

          <div className="form-group">
            <label htmlFor="name">Nome completo</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="Inserisci il tuo nome"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="Inserisci la tua email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="quiz-info-box">
            <p><strong>Domande:</strong> {quiz?.questionCount || 0}</p>
          </div>

          <div className="modal-actions">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Annulla
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Avvio in corso...' : 'Inizia Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartPublicQuizModal;

