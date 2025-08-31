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
   * Ottiene le informazioni complete di un quiz specifico
   * @param {number} quizId - ID del quiz
   * @returns {Promise<Object>} Informazioni complete del quiz { id, title, description, questionCount }
   */
  async getQuizById(quizId) {
    try {
      console.log(`🔍 Fetching quiz information for ${quizId}...`);
      
      // Prima ottieni le informazioni dell'utente che contengono tutti i quiz
      const userInfo = await this.getUserInformation();
      
      // Trova il quiz specifico
      const quiz = userInfo.quizzes.find(q => q.id === parseInt(quizId));
      
      if (!quiz) {
        throw new Error('Quiz non trovato');
      }
      
      console.log('✅ Quiz information loaded:', quiz);
      return quiz;
    } catch (error) {
      console.error('❌ Error fetching quiz information:', error);
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
   * Aggiorna un quiz esistente (titolo e descrizione)
   * @param {Object} quizData - Dati del quiz { id, title, description }
   * @returns {Promise<Object>} Quiz aggiornato
   */
  async updateQuiz(quizData) {
    try {
      console.log('Updating quiz:', quizData);
      
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: quizData.id,
          title: quizData.title,
          description: quizData.description
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Quiz non trovato');
        }
        if (response.status === 403) {
          throw new Error('Non hai i permessi per modificare questo quiz');
        }
        if (response.status === 400) {
          throw new Error('Dati non validi - controlla titolo e descrizione');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      // Gestisci la risposta che potrebbe non essere JSON
      let updatedQuiz;
      const contentType = response.headers.get('content-type');
      console.log('Response Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          updatedQuiz = await response.json();
          console.log('Quiz updated successfully (JSON response):', updatedQuiz);
        } catch (jsonError) {
          console.warn('Response claims to be JSON but is not valid:', jsonError.message);
          // Se la risposta non è JSON valido ma la richiesta è andata a buon fine,
          // restituisci i dati originali aggiornati
          updatedQuiz = {
            id: quizData.id,
            title: quizData.title,
            description: quizData.description
          };
        }
      } else {
        // Se la risposta non è JSON, ma lo status è OK, considera l'operazione riuscita
        console.log('Quiz updated successfully (non-JSON response)');
        updatedQuiz = {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description
        };
      }
      
      return updatedQuiz;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  /**
   * Crea un nuovo quiz
   * @param {Object} quizData - Dati del quiz { title, description }
   * @returns {Promise<Object>} Quiz creato con ID
   */
  async createQuiz(quizData) {
    try {
      console.log('Creating new quiz:', quizData);
      
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: quizData.title,
          description: quizData.description
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 400) {
          throw new Error('Dati non validi - controlla titolo e descrizione');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      // Gestisci la risposta che potrebbe non essere JSON
      let createdQuizId;
      const contentType = response.headers.get('content-type');
      console.log('Create Response Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          createdQuizId = await response.json();
          console.log('Quiz created successfully with ID (JSON response):', createdQuizId);
        } catch (jsonError) {
          console.error('Failed to parse JSON response for quiz creation:', jsonError.message);
          throw new Error('Errore nella risposta del server durante la creazione del quiz');
        }
      } else {
        // Per la creazione, abbiamo bisogno dell'ID, quindi non possiamo procedere senza JSON
        const responseText = await response.text();
        console.log('Non-JSON response body:', responseText);
        throw new Error('Il server non ha restituito un ID valido per il quiz creato');
      }
      
      return { id: createdQuizId, ...quizData };
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  /**
   * Elimina un quiz esistente
   * @param {number} quizId - ID del quiz da eliminare
   * @returns {Promise<void>}
   */
  async deleteQuiz(quizId) {
    try {
      console.log(`Deleting quiz ${quizId}...`);
      
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Quiz non trovato');
        }
        if (response.status === 403) {
          throw new Error('Non hai i permessi per eliminare questo quiz');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      console.log('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  /**
   * Ottiene domande casuali per un test
   * @param {number} quizId - ID del quiz
   * @param {number} size - Numero di domande da ottenere (5-150)
   * @returns {Promise<Array>} Lista domande casuali per il test
   */
  async getRandomQuestions(quizId, size) {
    try {
      console.log(`Fetching ${size} random questions for quiz ${quizId}...`);
      
      const response = await fetch(`${this.baseUrl}/api/v1/questions/random?size=${size}&quizId=${quizId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Quiz non trovato o senza domande');
        }
        if (response.status === 400) {
          throw new Error('Parametri non validi - controlla quizId e size');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      const questions = await response.json();
      console.log('Random questions loaded successfully:', questions);
      
      // Validate response structure
      if (!Array.isArray(questions)) {
        throw new Error('Formato risposta non valido dal server');
      }
      
      return questions;
    } catch (error) {
      console.error('Error fetching random questions:', error);
      throw error;
    }
  }

  /**
   * Crea una nuova domanda per un quiz
   * @param {Object} questionData - Dati della domanda { title, question, quizId, answers }
   * @returns {Promise<Object>} Domanda creata
   */
  async createQuestion(questionData) {
    try {
      console.log('Creating new question:', questionData);
      
      const response = await fetch(`${this.baseUrl}/api/v1/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: questionData.title || null,
          question: questionData.question,
          quizId: questionData.quizId,
          answers: questionData.answers
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Quiz non trovato');
        }
        if (response.status === 400) {
          throw new Error('Dati non validi - controlla domanda e risposte');
        }
        if (response.status === 403) {
          throw new Error('Non hai i permessi per aggiungere domande a questo quiz');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      // Gestisci la risposta che potrebbe non essere JSON
      let createdQuestion;
      const contentType = response.headers.get('content-type');
      console.log('Create Question Response Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const serverResponse = await response.json();
          console.log('Question created successfully (JSON response):', serverResponse);
          
          // Costruisci l'oggetto risposta con struttura consistente
          createdQuestion = {
            id: serverResponse.id || serverResponse || Date.now(), // ID dal server
            title: questionData.title,
            question: questionData.question,
            answers: questionData.answers
          };
        } catch (jsonError) {
          console.warn('Response claims to be JSON but is not valid:', jsonError.message);
          // Se la risposta non è JSON valido ma la richiesta è andata a buon fine,
          // restituisci i dati originali con un ID simulato
          createdQuestion = {
            id: Date.now(), // ID temporaneo
            title: questionData.title,
            question: questionData.question,
            answers: questionData.answers
          };
        }
      } else {
        // Se la risposta non è JSON, ma lo status è OK, considera l'operazione riuscita
        console.log('Question created successfully (non-JSON response)');
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        // Prova a estrarre un ID numerico dalla risposta testuale
        const possibleId = responseText ? parseInt(responseText.trim()) : null;
        
        createdQuestion = {
          id: possibleId || Date.now(), // ID dal testo o temporaneo
          title: questionData.title,
          question: questionData.question,
          answers: questionData.answers
        };
      }
      
      return createdQuestion;
    } catch (error) {
      console.error('Error creating question:', error);
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
      console.log('Editing question:', questionData);
      
      // PUT /api/v1/questions con PutQuestionDTO nel body
      const response = await fetch(`${this.baseUrl}/api/v1/questions`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: questionData.id,           // Integer - ID della domanda (obbligatorio)
          title: questionData.title,     // String - Titolo della domanda
          question: questionData.question // String - Testo della domanda
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
