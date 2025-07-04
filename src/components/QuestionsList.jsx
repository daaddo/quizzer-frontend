import React, { useState, useEffect } from 'react';
import { questionsApi } from '../services/api';
import EditQuestionModal from './EditQuestionModal';

const QuestionsList = ({ refreshTrigger }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [refreshTrigger]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questionsApi.getAllQuestions();
      setQuestions(data);
    } catch (err) {
      setError('Errore nel caricamento delle domande: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadQuestions();
  };

  const handleDeleteQuestion = async (questionId, questionTitle) => {
    // Conferma prima di cancellare
    const confirmed = window.confirm(
      `Sei sicuro di voler cancellare la domanda "${questionTitle}"?\n\nQuesta azione non può essere annullata.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingId(questionId);
      await questionsApi.deleteQuestion(questionId);
      
      // Rimuovi la domanda dalla lista locale senza ricaricare tutto
      setQuestions(prevQuestions => 
        prevQuestions.filter(question => question.id !== questionId)
      );
      
    } catch (err) {
      setError('Errore nella cancellazione: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  const handleQuestionUpdated = (updatedData) => {
    // Aggiorna la domanda nella lista locale
    setQuestions(prevQuestions => 
      prevQuestions.map(question => 
        question.id === updatedData.id 
          ? { ...question, title: updatedData.title, question: updatedData.question }
          : question
      )
    );
    setEditingQuestion(null);
    setIsEditModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditingQuestion(null);
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="questions-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento domande...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questions-error">
        <div className="error-icon">⚠️</div>
        <h3>Errore di Connessione</h3>
        <p>{error}</p>
        <button onClick={handleRefresh} className="btn">
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="questions-container">
      <div className="questions-header">
        <h2>Gestione Domande ({questions.length})</h2>
        <button onClick={handleRefresh} className="btn btn-secondary">
          🔄 Aggiorna
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="no-questions">
          <div className="no-questions-icon">📝</div>
          <h3>Nessuna domanda trovata</h3>
          <p>Non ci sono domande disponibili nel sistema.</p>
        </div>
      ) : (
        <div className="questions-grid">
          {questions.map((question) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <h3 className="question-title">{question.title}</h3>
                <div className="question-actions">
                  <span className="question-id">ID: {question.id}</span>
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="btn btn-secondary btn-small"
                    title="Modifica domanda"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id, question.title)}
                    className="btn btn-danger btn-small"
                    disabled={deletingId === question.id}
                    title="Cancella domanda"
                  >
                    {deletingId === question.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
              
              <div className="question-content">
                <p className="question-text">{question.question}</p>
              </div>

              <div className="answers-section">
                <h4 className="answers-title">
                  Risposte ({question.answers?.length || 0})
                </h4>
                
                {question.answers && question.answers.length > 0 ? (
                  <div className="answers-list">
                    {question.answers.map((answer, index) => (
                      <div 
                        key={index} 
                        className={`answer-item ${answer.correct ? 'correct' : 'incorrect'}`}
                      >
                        <span className="answer-indicator">
                          {answer.correct ? '✓' : '✗'}
                        </span>
                        <span className="answer-text">{answer.answer}</span>
                        <span className="answer-status">
                          {answer.correct ? 'Corretta' : 'Sbagliata'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-answers">
                    <span className="no-answers-icon">❌</span>
                    <span>Nessuna risposta disponibile</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <EditQuestionModal
        question={editingQuestion}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onQuestionUpdated={handleQuestionUpdated}
      />
    </div>
  );
};

export default QuestionsList; 