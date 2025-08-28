import { getStoredToken } from '../utils/jwt.js';

// API configuration
const getApiBaseUrl = () => {
  if (import.meta.env.MODE === 'production') {
    return 'VITE_API_BASE_URL_PLACEHOLDER';
  } else {
    return 'http://localhost:8080'; // Punta direttamente al backend per ora
  }
};

const API_BASE_URL = getApiBaseUrl();

// Helper function per headers di autorizzazione
const getAuthHeaders = () => {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Servizio API per operazioni utente
 */
class UserApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Ottiene le informazioni complete dell'utente inclusi i quiz
   * @returns {Promise<Object>} Informazioni utente con quiz
   */
  async getUserInformation() {
    try {
      console.log('🔍 Fetching user information...');
      
      const response = await fetch(`${this.baseUrl}/api/v1/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Utente non trovato');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ User information response:', data);
      
      // La risposta dovrebbe essere: { id, username, quizzes: [{ id, title, description, questionCount }] }
      return {
        id: data.id,
        username: data.username,
        quizzes: data.quizzes || []
      };
    } catch (error) {
      console.error('❌ Error fetching user information:', error);
      throw error;
    }
  }

  /**
   * Ottiene solo i quiz dell'utente (estratti dalle informazioni complete)
   * @returns {Promise<Array>} Lista dei quiz dell'utente
   */
  async getUserQuizzes() {
    try {
      const userInfo = await this.getUserInformation();
      return userInfo.quizzes || [];
    } catch (error) {
      console.error('❌ Error fetching user quizzes:', error);
      throw error;
    }
  }

  /**
   * Ottiene tutte le domande di un quiz specifico
   * @param {number} quizId - ID del quiz
   * @returns {Promise<Array>} Lista delle domande con risposte
   */
  async getQuizQuestions(quizId) {
    try {
      console.log(`🔍 Fetching questions for quiz ${quizId}...`);
      
      const response = await fetch(`${this.baseUrl}/api/v1/questions/${quizId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Quiz non trovato');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      const questions = await response.json();
      console.log('✅ Quiz questions response:', questions);
      
      // La risposta dovrebbe essere un array di GetQuestionDto
      return questions || [];
    } catch (error) {
      console.error('❌ Error fetching quiz questions:', error);
      throw error;
    }
  }

  /**
   * Elimina una domanda specifica
   * @param {number} questionId - ID della domanda da eliminare
   * @returns {Promise<void>}
   */
  async deleteQuestion(questionId) {
    try {
      console.log(`🗑️ Deleting question ${questionId}...`);
      
      const response = await fetch(`${this.baseUrl}/api/v1/questions/${questionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Domanda non trovata');
        }
        if (response.status === 403) {
          throw new Error('Non hai i permessi per eliminare questa domanda');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      console.log('✅ Question deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting question:', error);
      throw error;
    }
  }

  /**
   * Modifica una domanda specifica (titolo e testo)
   * @param {Object} questionData - Dati della domanda { id, title, question }
   * @returns {Promise<Object>} Domanda aggiornata
   */
  async editQuestion(questionData) {
    try {
      console.log(`✏️ Editing question ${questionData.id}...`, questionData);
      
      const response = await fetch(`${this.baseUrl}/api/v1/questions`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: questionData.id,
          title: questionData.title,
          question: questionData.question
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        // Prova a leggere il corpo della risposta per errori più dettagliati
        let errorMessage;
        try {
          const errorText = await response.text();
          console.log('❌ Error response body:', errorText);
          errorMessage = errorText || `Errore API: ${response.status}`;
        } catch {
          errorMessage = `Errore API: ${response.status}`;
        }
        
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Domanda non trovata');
        }
        if (response.status === 403) {
          throw new Error('Non hai i permessi per modificare questa domanda');
        }
        if (response.status === 400) {
          throw new Error('Dati non validi - controlla titolo e domanda');
        }
        throw new Error(errorMessage);
      }

      // Prova a parsare JSON, ma gestisci il caso in cui non sia JSON valido
      let updatedQuestion;
      const contentType = response.headers.get('content-type');
      console.log('📋 Response Content-Type:', contentType);
      
      // Prima leggi il testo della risposta per vedere cosa c'è
      const responseText = await response.text();
      console.log('📄 Raw response body:', responseText);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          updatedQuestion = JSON.parse(responseText);
          console.log('✅ Question edited successfully (JSON response):', updatedQuestion);
        } catch (jsonError) {
          console.warn('⚠️ Response claims to be JSON but is not valid:', jsonError.message);
          console.warn('⚠️ Response body was:', responseText);
          // Se la risposta non è JSON valido ma la richiesta è andata a buon fine,
          // restituisci i dati originali aggiornati
          updatedQuestion = {
            id: questionData.id,
            title: questionData.title,
            question: questionData.question
          };
        }
      } else {
        // Se la risposta non è JSON, ma lo status è OK, considera l'operazione riuscita
        console.log('✅ Question edited successfully (non-JSON response)');
        console.log('📄 Response body was:', responseText);
        updatedQuestion = {
          id: questionData.id,
          title: questionData.title,
          question: questionData.question
        };
      }
      
      return updatedQuestion;
    } catch (error) {
      console.error('❌ Error editing question:', error);
      throw error;
    }
  }
}

// Esporta istanza singleton
export const userApi = new UserApiService();
