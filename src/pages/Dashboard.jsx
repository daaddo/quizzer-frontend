import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/userApi';
import UserProfile from '../components/UserProfile';
import QuizGrid from '../components/QuizGrid';
import '../components/dashboard.css';

/**
 * Dashboard principale dell'utente
 */
const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        />
      </div>
    </div>
  );
};

export default Dashboard;
