import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import Question from '../components/Question';
import EditQuestionModal from '../components/EditQuestionModal';
import CreateQuestionModal from '../components/CreateQuestionModal';
import '../styles/quiz-details.css';

/**
 * Pagina per visualizzare i dettagli di un quiz con tutte le sue domande
 */
const QuizDetails = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  
  // Stati per i modali
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Carica le domande del quiz
  useEffect(() => {
    const loadQuizQuestions = async () => {
      if (!quizId) {
        setError('ID quiz non valido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const questionsData = await userApi.getQuizQuestions(quizId);
        console.log('Quiz questions loaded:', questionsData);
        setQuestions(questionsData);
        
        // Se ci sono domande, prova a estrarre il titolo dalla prima domanda
        if (questionsData.length > 0) {
          setQuizTitle(questionsData[0].title || `Quiz ${quizId}`);
        } else {
          setQuizTitle(`Quiz ${quizId}`);
        }
        
      } catch (err) {
        console.error('Quiz details error:', err);
        setError(err.message || 'Errore nel caricamento del quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuizQuestions();
  }, [quizId]);

  // Handler per tornare alla dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handler per eliminare una domanda
  const handleDeleteQuestion = async (questionId, question) => {
    // Conferma eliminazione
    const confirmDelete = window.confirm(
      `Sei sicuro di voler eliminare la domanda "${question.question}"?\n\nQuesta azione non può essere annullata.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      console.log('Deleting question:', questionId);
      
      // Chiamata API per eliminare la domanda
      await userApi.deleteQuestion(questionId);
      
      // Rimuovi la domanda dalla lista locale
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => q.id !== questionId)
      );
      
      console.log('Question deleted successfully');
      
    } catch (error) {
      console.error('Error deleting question:', error);
      alert(`Errore nell'eliminazione della domanda: ${error.message}`);
    }
  };

  // Handler per aprire il modal di modifica
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setEditModalOpen(true);
  };

  // Handler per salvare le modifiche
  const handleSaveQuestion = async (updatedQuestionData) => {
    try {
      setEditLoading(true);
      
      console.log('Saving question changes:', updatedQuestionData);
      
      // Chiamata API per modificare la domanda
      const updatedQuestion = await userApi.editQuestion(updatedQuestionData);
      
      // Aggiorna la domanda nella lista locale
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === updatedQuestion.id 
            ? { ...q, ...updatedQuestion }
            : q
        )
      );
      
      console.log('Question updated successfully');
      
      // Chiudi il modal
      setEditModalOpen(false);
      setEditingQuestion(null);
      
    } catch (error) {
      console.error('Error updating question:', error);
      alert(`Errore nella modifica della domanda: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Handler per annullare la modifica
  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingQuestion(null);
  };

  // Handler per aprire modal di creazione domanda
  const handleCreateQuestion = () => {
    setCreateModalOpen(true);
  };

  // Handler per salvare nuova domanda
  const handleSaveNewQuestion = async (questionData) => {
    try {
      setCreateLoading(true);
      
      console.log('Creating new question:', questionData);
      
      // Chiamata API per creare la domanda
      const createdQuestion = await userApi.createQuestion(questionData);
      
      // Costruisci l'oggetto domanda completo per l'UI
      const questionForUI = {
        id: createdQuestion.id || Date.now(), // Usa l'ID dal server o temporaneo
        title: questionData.title,
        question: questionData.question,
        answers: questionData.answers.map((answer, index) => ({
          id: (createdQuestion.id || Date.now()) + index, // ID temporaneo per le risposte
          answer: answer.answer,
          correct: answer.correct
        }))
      };
      
      // Aggiungi la domanda alla lista locale con struttura completa
      setQuestions(prevQuestions => [...prevQuestions, questionForUI]);
      
      // Chiudi il modal
      setCreateModalOpen(false);
      console.log('Question created successfully and added to UI');
      
    } catch (error) {
      console.error('Error creating question:', error);
      alert(`Errore nella creazione della domanda: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handler per annullare la creazione
  const handleCancelCreate = () => {
    setCreateModalOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="quiz-details-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Caricamento Quiz</h2>
            <p>Preparazione delle domande...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quiz-details-error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h2>Errore di Caricamento</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                🔄 Riprova
              </button>
              <button 
                onClick={handleBackToDashboard}
                className="btn btn-secondary"
              >
                ← Torna alla Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="quiz-details-empty">
        <div className="container">
          <div className="quiz-header">
            <button 
              onClick={handleBackToDashboard}
              className="back-button"
            >
              ← Dashboard
            </button>
            <div className="quiz-info">
              <h1 className="quiz-title">{quizTitle}</h1>
              <div className="quiz-stats">
                <span className="stat-item">
                  📝 0 domande
                </span>
              </div>
            </div>
            <button 
              onClick={handleCreateQuestion}
              className="btn btn-primary create-question-btn"
              title="Crea nuova domanda"
            >
              Nuova Domanda
            </button>
          </div>
          
          <div className="empty-content">
            <div className="empty-icon">📝</div>
            <h2>Nessuna Domanda Trovata</h2>
            <p>Questo quiz non contiene ancora domande. Inizia creando la prima domanda!</p>
            <div className="empty-actions">
              <button 
                onClick={handleCreateQuestion}
                className="btn btn-primary btn-large"
              >
                Crea Prima Domanda
              </button>
              <button 
                onClick={handleBackToDashboard}
                className="btn btn-secondary"
              >
                ← Torna alla Dashboard
              </button>
            </div>
          </div>
          
          {/* Modal per creare domanda */}
          <CreateQuestionModal
            isOpen={createModalOpen}
            quizId={parseInt(quizId)}
            onSave={handleSaveNewQuestion}
            onCancel={handleCancelCreate}
            loading={createLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-details">
      <div className="container">
        {/* Header del quiz */}
        <div className="quiz-header">
          <button 
            onClick={handleBackToDashboard}
            className="back-button"
          >
            ← Dashboard
          </button>
          <div className="quiz-info">
            <h1 className="quiz-title">{quizTitle}</h1>
            <div className="quiz-stats">
              <span className="stat-item">
                📝 {questions.length} domande
              </span>
            </div>
          </div>
          <button 
            onClick={handleCreateQuestion}
            className="btn btn-primary create-question-btn"
            title="Crea nuova domanda"
          >
            Nuova Domanda
          </button>
        </div>

        {/* Lista delle domande */}
        <div className="questions-container">
          {questions.map((question, index) => (
            <Question 
              key={question.id}
              question={question}
              questionNumber={index + 1}
              onDeleteQuestion={handleDeleteQuestion}
              onEditQuestion={handleEditQuestion}
            />
          ))}
        </div>

        {/* Footer con azioni */}
        <div className="quiz-footer">
          <button 
            onClick={handleBackToDashboard}
            className="btn btn-secondary"
          >
            ← Torna alla Dashboard
          </button>
        </div>
      </div>

      {/* Modal per modificare domanda */}
      <EditQuestionModal
        question={editingQuestion}
        isOpen={editModalOpen}
        onSave={handleSaveQuestion}
        onCancel={handleCancelEdit}
        loading={editLoading}
      />

      {/* Modal per creare domanda */}
      <CreateQuestionModal
        isOpen={createModalOpen}
        quizId={parseInt(quizId)}
        onSave={handleSaveNewQuestion}
        onCancel={handleCancelCreate}
        loading={createLoading}
      />
    </div>
  );
};

export default QuizDetails;
