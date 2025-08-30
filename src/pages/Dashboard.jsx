import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/userApi';
import UserProfile from '../components/UserProfile';
import QuizGrid from '../components/QuizGrid';
import EditQuizModal from '../components/EditQuizModal';
import CreateQuizModal from '../components/CreateQuizModal';
import DeleteQuizModal from '../components/DeleteQuizModal';
import '../components/dashboard.css';

/**
 * Dashboard principale dell'utente
 */
const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati per gestione modali
  const [editQuizModal, setEditQuizModal] = useState({ isOpen: false, quiz: null });
  const [createQuizModal, setCreateQuizModal] = useState({ isOpen: false });
  const [deleteQuizModal, setDeleteQuizModal] = useState({ isOpen: false, quiz: null });
  const [modalLoading, setModalLoading] = useState(false);

  // Carica i dati completi dell'utente
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Carica le informazioni complete dell'utente (inclusi i quiz)
        const userData = await userApi.getUserInformation();
        console.log('Dashboard received user data:', userData);
        setUserInfo(userData);
        
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Errore nel caricamento dei dati del server');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  // Handler per click su quiz - naviga alla pagina del quiz
  const handleQuizClick = (quizId, quiz) => {
    console.log('Navigating to quiz:', quizId, quiz);
    // Naviga alla pagina del quiz
    window.location.href = `/quiz/${quizId}`;
  };

  // Handler per aprire modal di creazione quiz
  const handleCreateQuiz = () => {
    setCreateQuizModal({ isOpen: true });
  };

  // Handler per aprire modal di modifica quiz
  const handleEditQuiz = (quiz) => {
    setEditQuizModal({ isOpen: true, quiz });
  };

  // Handler per aprire modal di eliminazione quiz
  const handleDeleteQuiz = (quiz) => {
    setDeleteQuizModal({ isOpen: true, quiz });
  };

  // Handler per confermare eliminazione quiz
  const handleConfirmDeleteQuiz = async () => {
    if (!deleteQuizModal.quiz) return;

    try {
      setModalLoading(true);
      await userApi.deleteQuiz(deleteQuizModal.quiz.id);
      
      // Aggiorna la lista rimuovendo il quiz eliminato
      setUserInfo(prevInfo => ({
        ...prevInfo,
        quizzes: prevInfo.quizzes.filter(q => q.id !== deleteQuizModal.quiz.id)
      }));

      // Chiudi il modal
      setDeleteQuizModal({ isOpen: false, quiz: null });
      console.log('Quiz eliminato con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione del quiz:', error);
      alert(`Errore nell'eliminazione del quiz: ${error.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handler per salvare nuovo quiz
  const handleSaveNewQuiz = async (quizData) => {
    try {
      setModalLoading(true);
      const createdQuiz = await userApi.createQuiz(quizData);
      
      // Aggiorna la lista aggiungendo il nuovo quiz
      setUserInfo(prevInfo => ({
        ...prevInfo,
        quizzes: [...(prevInfo.quizzes || []), { ...createdQuiz, questionCount: 0 }]
      }));

      // Chiudi il modal
      setCreateQuizModal({ isOpen: false });
      console.log('Quiz creato con successo:', createdQuiz);
    } catch (error) {
      console.error('Errore nella creazione del quiz:', error);
      alert(`Errore nella creazione del quiz: ${error.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handler per salvare modifiche quiz
  const handleSaveEditQuiz = async (quizData) => {
    try {
      setModalLoading(true);
      const updatedQuiz = await userApi.updateQuiz(quizData);
      
      // Aggiorna la lista quiz
      setUserInfo(prevInfo => ({
        ...prevInfo,
        quizzes: prevInfo.quizzes.map(q => 
          q.id === updatedQuiz.id 
            ? { ...q, ...updatedQuiz }
            : q
        )
      }));

      // Chiudi il modal
      setEditQuizModal({ isOpen: false, quiz: null });
      console.log('Quiz aggiornato con successo:', updatedQuiz);
    } catch (error) {
      console.error('Errore nell\'aggiornamento del quiz:', error);
      alert(`Errore nell'aggiornamento del quiz: ${error.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handler per annullare modifica quiz
  const handleCancelEditQuiz = () => {
    setEditQuizModal({ isOpen: false, quiz: null });
  };

  // Handler per annullare creazione quiz
  const handleCancelCreateQuiz = () => {
    setCreateQuizModal({ isOpen: false });
  };

  // Handler per annullare eliminazione quiz
  const handleCancelDeleteQuiz = () => {
    setDeleteQuizModal({ isOpen: false, quiz: null });
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h2>Caricamento Dashboard</h2>
            <p>Preparazione della tua area personale...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h2>Errore di Caricamento</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Ricarica i dati
                  const loadUserData = async () => {
                    try {
                      const userData = await userApi.getUserInformation();
                      setUserInfo(userData);
                    } catch (err) {
                      setError(err.message || 'Errore nel caricamento dei dati del server');
                    } finally {
                      setLoading(false);
                    }
                  };
                  loadUserData();
                }}
                className="btn btn-primary"
              >
                🔄 Riprova
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-secondary"
              >
                🔄 Ricarica Pagina
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se non ci sono informazioni utente, mostra stato vuoto
  if (!userInfo) {
    return (
      <div className="dashboard-empty">
        <div className="container">
          <div className="empty-content">
            <div className="empty-icon">👤</div>
            <h2>Nessun Dato Disponibile</h2>
            <p>Impossibile caricare le informazioni dell'utente dal server.</p>
          </div>
        </div>
      </div>
    );
  }

  // Crea oggetto user completo per UserProfile
  const userProfile = {
    ...user,
    id: userInfo?.id,
    username: userInfo?.username || user?.username
  };

  return (
    <div className="dashboard">
      <div className="container">
        {/* Sezione profilo utente */}
        <UserProfile user={userProfile} />
        
        {/* Sezione quiz */}
        <QuizGrid 
          quizzes={userInfo?.quizzes || []} 
          loading={loading} 
          onQuizClick={handleQuizClick}
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
          onDeleteQuiz={handleDeleteQuiz}
        />
      </div>

      {/* Modali */}
      <CreateQuizModal
        isOpen={createQuizModal.isOpen}
        onSave={handleSaveNewQuiz}
        onCancel={handleCancelCreateQuiz}
        loading={modalLoading}
      />

      <EditQuizModal
        quiz={editQuizModal.quiz}
        isOpen={editQuizModal.isOpen}
        onSave={handleSaveEditQuiz}
        onCancel={handleCancelEditQuiz}
        loading={modalLoading}
      />

      <DeleteQuizModal
        quiz={deleteQuizModal.quiz}
        isOpen={deleteQuizModal.isOpen}
        onConfirm={handleConfirmDeleteQuiz}
        onCancel={handleCancelDeleteQuiz}
        loading={modalLoading}
      />
    </div>
  );
};

export default Dashboard;
