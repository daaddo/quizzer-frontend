import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import UserProfile from '../components/UserProfile';
import QuizGrid from '../components/QuizGrid';
import EditQuizModal from '../components/EditQuizModal';
import CreateQuizModal from '../components/CreateQuizModal';
import DeleteQuizModal from '../components/DeleteQuizModal';
import TestConfigModal from '../components/TestConfigModal';
import GenerateLinkModal from '../components/GenerateLinkModal';
import IssuedQuizzesModal from '../components/IssuedQuizzesModal';
import StartTakingQuizModal from '../components/StartTakingQuizModal';
import '../components/dashboard.css';

/**
 * Dashboard principale dell'utente
 */
const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati per gestione modali
  const [editQuizModal, setEditQuizModal] = useState({ isOpen: false, quiz: null });
  const [createQuizModal, setCreateQuizModal] = useState({ isOpen: false });
  const [deleteQuizModal, setDeleteQuizModal] = useState({ isOpen: false, quiz: null });
  const [testConfigModal, setTestConfigModal] = useState({ isOpen: false, quiz: null });
  const [generateLinkModal, setGenerateLinkModal] = useState({ isOpen: false, quiz: null, result: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [issuedModal, setIssuedModal] = useState({ isOpen: false, quiz: null, items: [], loading: false, error: null });
  const [startTakingModal, setStartTakingModal] = useState({ isOpen: false, token: null });

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
        // Se presente, recupera ed elimina l'eventuale token takingquiz salvato pre-login
        try {
          const pendingToken = localStorage.getItem('pendingTakingQuizToken');
          if (pendingToken) {
            console.log('[Dashboard] Token takingquiz recuperato post-login:', pendingToken, '(mostra conferma)');
            localStorage.removeItem('pendingTakingQuizToken');
            setStartTakingModal({ isOpen: true, token: pendingToken });
          }
        } catch {}
        
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
    navigate(`/quiz/${quizId}`);
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

  // Handler per aprire configurazione test
  const handleStartTest = (quiz) => {
    setTestConfigModal({ isOpen: true, quiz });
  };

  // Handlers per generare link
  const handleOpenGenerateLink = (quiz) => {
    setGenerateLinkModal({ isOpen: true, quiz, result: null });
  };

  const handleCancelGenerateLink = () => {
    setGenerateLinkModal({ isOpen: false, quiz: null, result: null });
  };

  const handleConfirmGenerateLink = async ({ quizId, numberOfQuestions, duration, expirationDate }) => {
    try {
      setModalLoading(true);
      const res = await userApi.generateLink({ quizId, numberOfQuestions, duration, expirationDate });
      setGenerateLinkModal(prev => ({ ...prev, result: res }));
    } catch (error) {
      console.error('Errore generazione link:', error);
      alert(`Errore generazione link: ${error.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handlers issued quizzes
  const handleOpenIssuedQuizzes = (quiz) => {
    navigate(`/quiz/${quiz.id}/issued`);
  };

  const handleCloseIssuedQuizzes = () => {
    setIssuedModal({ isOpen: false, quiz: null, items: [], loading: false, error: null });
  };

  // Handler per avviare test con configurazione
  const handleStartTestWithConfig = (questionCount, viewMode) => {
    const quiz = testConfigModal.quiz;
    setTestConfigModal({ isOpen: false, quiz: null });
    
    // Naviga alla pagina di esecuzione test
    navigate(`/test/${quiz.id}`, {
      state: {
        questionCount,
        quizTitle: quiz.title,
        viewMode: viewMode || 'scrolling'
      }
    });
  };

  // Handler per annullare configurazione test
  const handleCancelTestConfig = () => {
    setTestConfigModal({ isOpen: false, quiz: null });
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
              {/* Rimosso reload pagina: il bottone sopra effettua già il retry della fetch */}
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
          onStartTest={handleStartTest}
          onGenerateLink={handleOpenGenerateLink}
          onViewIssuedQuizzes={handleOpenIssuedQuizzes}
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

      <TestConfigModal
        quiz={testConfigModal.quiz}
        isOpen={testConfigModal.isOpen}
        onStart={handleStartTestWithConfig}
        onCancel={handleCancelTestConfig}
        loading={modalLoading}
      />

      <GenerateLinkModal
        quiz={generateLinkModal.quiz}
        isOpen={generateLinkModal.isOpen}
        onGenerate={handleConfirmGenerateLink}
        onCancel={handleCancelGenerateLink}
        loading={modalLoading}
        result={generateLinkModal.result}
      />

      {/* Conferma avvio quiz da link */}
      <StartTakingQuizModal
        isOpen={startTakingModal.isOpen}
        token={startTakingModal.token}
        onConfirm={() => {
          if (!startTakingModal.token) {
            setStartTakingModal({ isOpen: false, token: null });
            return;
          }
          const t = startTakingModal.token;
          setStartTakingModal({ isOpen: false, token: null });
          console.log('[Dashboard] Conferma avvio quiz, redirect a /takingquiz');
          navigate(`/takingquiz?token=${encodeURIComponent(t)}`, { replace: true });
        }}
        onCancel={() => {
          console.log('[Dashboard] Avvio quiz annullato dall\'utente');
          setStartTakingModal({ isOpen: false, token: null });
        }}
      />

      {/* Modale rimosso in favore della pagina dedicata */}
    </div>
  );
};

export default Dashboard;
