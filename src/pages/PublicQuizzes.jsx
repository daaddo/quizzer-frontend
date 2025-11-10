import React, { useState } from 'react';
import PublicQuizCard from '../components/PublicQuizCard';
import StartPublicQuizModal from '../components/StartPublicQuizModal';
import '../styles/public-quizzes.css';

/**
 * Pagina che mostra i quiz pubblici disponibili
 * Per ora usa dati placeholder
 */
const PublicQuizzes = () => {
  const [startQuizModal, setStartQuizModal] = useState({ isOpen: false, quiz: null });
  const [loading, setLoading] = useState(false);

  // Dati placeholder per i quiz pubblici
  const placeholderQuizzes = [
    {
      id: 1,
      title: 'Quiz di Geografia Mondiale',
      name: 'Geografia',
      questionCount: 20,
      reviewCount: 45,
      rating: 4.3
    },
    {
      id: 2,
      title: 'Storia dell\'Arte Italiana',
      name: 'Arte',
      questionCount: 15,
      reviewCount: 32,
      rating: 4.7
    },
    {
      id: 3,
      title: 'Programmazione JavaScript',
      name: 'Informatica',
      questionCount: 30,
      reviewCount: 128,
      rating: 4.5
    },
    {
      id: 4,
      title: 'Scienze Naturali',
      name: 'Scienze',
      questionCount: 25,
      reviewCount: 67,
      rating: 3.9
    },
    {
      id: 5,
      title: 'Letteratura Italiana',
      name: 'Letteratura',
      questionCount: 18,
      reviewCount: 54,
      rating: 4.2
    },
    {
      id: 6,
      title: 'Matematica di Base',
      name: 'Matematica',
      questionCount: 22,
      reviewCount: 89,
      rating: 4.6
    }
  ];

  const handleStartQuiz = (quiz) => {
    console.log('Apertura modal per iniziare quiz:', quiz);
    setStartQuizModal({ isOpen: true, quiz });
  };

  const handleConfirmStartQuiz = async (data) => {
    console.log('Avvio quiz con dati:', data);
    setLoading(true);
    
    // Simulazione chiamata API
    setTimeout(() => {
      setLoading(false);
      setStartQuizModal({ isOpen: false, quiz: null });
      // TODO: Navigare alla pagina del quiz
      alert(`Quiz avviato per ${data.name} (${data.email})`);
    }, 1500);
  };

  const handleCancelStartQuiz = () => {
    setStartQuizModal({ isOpen: false, quiz: null });
  };

  const handleOpenComments = (quiz) => {
    console.log('Apertura commenti per quiz:', quiz);
    // TODO: Implementare in futuro
  };

  return (
    <div className="public-quizzes-page">
      <div className="container">
        <div className="public-quizzes-header">
          <h1 className="public-quizzes-title">Quiz Pubblici</h1>
          <p className="public-quizzes-subtitle">
            Scegli un quiz e mettiti alla prova
          </p>
        </div>

        <div className="public-quizzes-grid">
          {placeholderQuizzes.map((quiz) => (
            <PublicQuizCard
              key={quiz.id}
              quiz={quiz}
              onStartQuiz={handleStartQuiz}
              onOpenComments={handleOpenComments}
            />
          ))}
        </div>
      </div>

      <StartPublicQuizModal
        isOpen={startQuizModal.isOpen}
        quiz={startQuizModal.quiz}
        onConfirm={handleConfirmStartQuiz}
        onCancel={handleCancelStartQuiz}
        loading={loading}
      />
    </div>
  );
};

export default PublicQuizzes;

