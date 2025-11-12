import { getStoredToken } from '../utils/jwt.js';
import { getCsrfHeaders } from './csrf.js';

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
    ...getCsrfHeaders(),
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
   * Ottiene la lista dei quiz emessi (issued) per un dato quiz
   * GET /api/v1/users/issued-quizzes/{quizId}
   * @param {number} quizId
   * @returns {Promise<Array>} List<IssuedQuizInfosDto>
   */
  async getIssuedQuizzes(quizId) {
    try {
      if (!quizId && quizId !== 0) {
        throw new Error('quizId mancante');
      }

      const response = await fetch(`${this.baseUrl}/api/v1/users/issued-quizzes/${encodeURIComponent(quizId)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 404) {
          throw new Error('Quiz non trovato o nessun quiz creato');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Formato risposta non valido');
      }
      return data;
    } catch (error) {
      console.error('Error fetching issued quizzes:', error);
      throw error;
    }
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
        headers: getAuthHeaders(),
        credentials: 'include'
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
        headers: getAuthHeaders(),
        credentials: 'include'
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
        headers: getAuthHeaders(),
        credentials: 'include'
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
   * Aggiorna un quiz esistente (titolo, descrizione e stato pubblico)
   * @param {Object} quizData - Dati del quiz { id, title, description, isPublic }
   * @returns {Promise<Object>} Quiz aggiornato
   */
  async updateQuiz(quizData) {
    try {
      console.log('Updating quiz:', quizData);
      
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          isPublic: quizData.isPublic
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
            description: quizData.description,
            isPublic: quizData.isPublic
          };
        }
      } else {
        // Se la risposta non è JSON, ma lo status è OK, considera l'operazione riuscita
        console.log('Quiz updated successfully (non-JSON response)');
        updatedQuiz = {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          isPublic: quizData.isPublic
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
   * @param {Object} quizData - Dati del quiz { title, description, isPublic }
   * @returns {Promise<Object>} Quiz creato con ID
   */
  async createQuiz(quizData) {
    try {
      console.log('Creating new quiz:', quizData);
      
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: quizData.title,
          description: quizData.description,
          isPublic: quizData.isPublic || false
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
        headers: getAuthHeaders(),
        credentials: 'include'
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
        headers: getAuthHeaders(),
        credentials: 'include'
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
        credentials: 'include',
        body: JSON.stringify({
          title: questionData.title,
          question: questionData.question,
          quizId: questionData.quizId,
          isMultipleChoice: Array.isArray(questionData.answers)
            ? questionData.answers.filter((a) => (a && (a.isCorrect === true || a.correct === true))).length > 1
            : false,
          answers: (questionData.answers || []).map((a) => ({
            answer: a?.answer,
            isCorrect: a?.isCorrect === true || a?.correct === true
          }))
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
        credentials: 'include',
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

  /**
   * Verifica se per un token è richiesto l'inserimento di dati aggiuntivi
   * GET /api/v1/quizzes/doesRequireDetails?token=...
   * @param {string} token
   * @returns {Promise<boolean>} true se richiesti, false altrimenti
   */
  async doesRequireDetails(token) {
    try {
      if (!token) throw new Error('Token mancante');
      const url = `${this.baseUrl}/api/v1/quizzes/doesRequireDetails?token=${encodeURIComponent(token)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 400) throw new Error('Token non valido');
        if (response.status === 404) throw new Error('Quiz non trovato');
        if (response.status === 401) throw new Error('Non autorizzato');
        throw new Error(`Errore API: ${response.status}`);
      }
      const text = (await response.text() || '').trim();
      if (/^(true|false)$/i.test(text)) {
        return /^true$/i.test(text);
      }
      // Se il server risponde JSON booleano
      try {
        const data = JSON.parse(text);
        if (typeof data === 'boolean') return data;
      } catch {}
      throw new Error('Risposta non valida dal server');
    } catch (error) {
      console.error('Error checking doesRequireDetails:', error);
      throw error;
    }
  }

  /**
   * Genera un token di link per un quiz e costruisce l'URL utilizzabile
   * @param {Object} params
   * @param {number} params.quizId - ID del quiz
   * @param {number} params.numberOfQuestions - Numero di domande
   * @param {string} params.duration - Durata nel formato HH:mm:ss (accetta anche HH:mm)
   * @param {string|null} params.expirationDate - Data scadenza nel formato YYYY-MM-DDTHH:mm:ss oppure null
   * @param {boolean} [params.requiredDetails=false] - Se richiedere informazioni aggiuntive
   * @returns {Promise<{ token: string, link: string }>} Token e link completo
   */
  async generateLink({ quizId, numberOfQuestions, duration, expirationDate, requiredDetails, requiredQuestions }) {
    try {
      // Normalizza durata: consenti HH:mm e converti in HH:mm:ss
      let normalizedDuration = duration || null;
      if (normalizedDuration && /^\d{2}:\d{2}$/.test(normalizedDuration)) {
        normalizedDuration = `${normalizedDuration}:00`;
      }

      // Normalizza expirationDate: accetta stringa da input datetime-local (YYYY-MM-DDTHH:mm)
      let normalizedExpiration = expirationDate || null;
      if (normalizedExpiration && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalizedExpiration)) {
        normalizedExpiration = `${normalizedExpiration}:00`;
      }

      // Normalizza e valida requiredQuestions
      let normalizedRequired = [];
      if (Array.isArray(requiredQuestions)) {
        normalizedRequired = requiredQuestions
          .map((q) => Number(q))
          .filter((q) => Number.isInteger(q) && q > 0);
        // de-duplica mantenendo l'ordine
        const seen = new Set();
        normalizedRequired = normalizedRequired.filter((q) => {
          if (seen.has(q)) return false;
          seen.add(q);
          return true;
        });
      }

      if (numberOfQuestions != null && normalizedRequired.length > Number(numberOfQuestions)) {
        throw new Error('Il numero di domande necessarie non può superare il numero totale di domande');
      }

      const body = {
        quizId,
        numberOfQuestions,
        duration: normalizedDuration,
        expirationDate: normalizedExpiration,
        requiredDetails: Boolean(requiredDetails),
        requiredQuestions: normalizedRequired
      };

      const response = await fetch(`${this.baseUrl}/api/v1/quizzes/link`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        let errorMessage = `Errore API: ${response.status}`;
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {}
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 400) {
          throw new Error(errorMessage || 'Parametri non validi');
        }
        if (response.status === 404) {
          throw new Error('Quiz non trovato');
        }
        throw new Error(errorMessage);
      }

      // La risposta è un token come testo semplice
      const token = (await response.text()).trim();
      if (!token) {
        throw new Error('Token non valido ricevuto dal server');
      }

      // Costruisci link frontend al percorso /takingquiz
      const frontendOrigin = typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : '';
      const link = `${frontendOrigin}/takingquiz?token=${encodeURIComponent(token)}`;
      return { token, link };
    } catch (error) {
      console.error('Error generating link:', error);
      throw error;
    }
  }

  /**
   * Ottiene set casuale di domande tramite token (POST)
   * Il backend può restituire:
   * - Array di domande
   * - Oggetto con chiave tipo "QuizInfos[...]": [...]
   * - Oggetto { questions: [...], meta: {...} }
   * Lasciamo che il chiamante normalizzi il formato.
   * @param {string} token
   * @param {{ user_name?: string, surname?: string, middleName?: string } | null} [additionalInfo]
   * @returns {Promise<any>} Payload bruto dal server
   */
  async getRandomQuestionsByToken(token, additionalInfo) {
    try {
      const url = `${this.baseUrl}/api/v1/quizzes/random?token=${encodeURIComponent(token)}`;
      const hasBody = additionalInfo && typeof additionalInfo === 'object' && (additionalInfo.user_name || additionalInfo.surname || additionalInfo.middleName);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: hasBody ? JSON.stringify({
          user_name: additionalInfo.user_name || '',
          surname: additionalInfo.surname || '',
          middleName: additionalInfo.middleName || ''
        }) : null
      });

      if (!response.ok) {
        if (response.status === 400) throw new Error('Richiesta non valida o dati mancanti');
        if (response.status === 403) throw new Error('Accesso negato o quiz già richiesto');
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching questions by token:', error);
      throw error;
    }
  }

  /**
   * Ottiene le informazioni tentativi per un issued quiz (per token)
   * GET /api/v1/users/issued-quizzes-infos/{token}
   * @param {string} tokenId
   * @returns {Promise<Array>} List<UserQuizAttemptDto>
   */
  async getIssuedQuizInfos(tokenId) {
    try {
      if (!tokenId) throw new Error('Token mancante');
      const response = await fetch(`${this.baseUrl}/api/v1/users/issued-quizzes-infos/${encodeURIComponent(tokenId)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Non autorizzato');
        if (response.status === 403) throw new Error('Accesso negato');
        if (response.status === 404) throw new Error('Quiz emesso non trovato');
        throw new Error(`Errore API: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching issued quiz infos:', error);
      throw error;
    }
  }

  /**
   * Invia le risposte per un quiz identificato da token
   * @param {string} token
   * @param {Record<number, number[]>} answersMap - Mappa { questionId: [answerId, ...] }
   * @returns {Promise<Record<number, { selectedOptions: number[], correctOptions: number[] }>>}
   */
  async submitAnswersByToken(token, answersMap) {
    try {
      const url = `${this.baseUrl}/api/v1/quizzes/postAnswers?token=${encodeURIComponent(token)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(answersMap)
      });

      if (!response.ok) {
        // Prova a leggere il corpo per messaggi dettagliati (JSON o testo)
        let detailedMessage = null;
        try {
          const raw = await response.text();
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object') {
                detailedMessage = parsed.error || parsed.message || raw;
              } else {
                detailedMessage = raw;
              }
            } catch {
              detailedMessage = raw;
            }
          }
        } catch {}

        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 403) {
          // Caso specifico richiesto: tempo scaduto
          const dm = (detailedMessage || '').toString();
          if (/time is up/i.test(dm) || /expired/i.test(dm)) {
            throw new Error('Il tempo per consegnare il quiz è finito');
          }
          throw new Error(detailedMessage || 'Accesso negato o token già usato');
        }
        if (response.status === 400) {
          throw new Error(detailedMessage || 'Dati non validi inviati al server');
        }
        throw new Error(detailedMessage || `Errore API: ${response.status}`);
      }

      const data = await response.json();
      return data || {};
    } catch (error) {
      console.error('Error submitting answers by token:', error);
      throw error;
    }
  }

  /**
   * Elimina il tentativo di un utente per un issued quiz
   * DELETE /api/v1/quizzes/attempt?token=...&userId=...
   * @param {string} token
   * @param {number} userId
   * @returns {Promise<void>}
   */
  async deleteAttempt(token, userId) {
    try {
      if (!token) throw new Error('Token mancante');
      if (userId == null) throw new Error('userId mancante');
      const url = `${this.baseUrl}/api/v1/quizzes/attempt?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non autorizzato');
        if (response.status === 403) throw new Error('Accesso negato');
        if (response.status === 404) throw new Error('Tentativo non trovato');
        throw new Error(`Errore API: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting attempt:', error);
      throw error;
    }
  }

  /**
   * Aggiorna la scadenza di un issued quiz
   * PUT /api/v1/quizzes/issued/expiration
   * @param {string} token
   * @param {string} expirationDateISO - formato YYYY-MM-DDTHH:mm:ss
   * @returns {Promise<void>}
   */
  async updateIssuedExpiration(token, expirationDateISO) {
    try {
      if (!token) throw new Error('Token mancante');
      if (!expirationDateISO) throw new Error('Data di scadenza mancante');
      const body = { token, expirationDate: expirationDateISO };
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes/issued/expiration`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non autorizzato');
        if (response.status === 403) throw new Error('Accesso negato');
        if (response.status === 404) throw new Error('Quiz emesso non trovato');
        if (response.status === 400) throw new Error('Data di scadenza non valida');
        throw new Error(`Errore API: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating issued expiration:', error);
      throw error;
    }
  }

  /**
   * Aggiorna il numero di domande di un issued quiz
   * PUT /api/v1/quizzes/issued/number-of-questions
   * @param {string} token
   * @param {number} numberOfQuestions - > 0
   * @returns {Promise<void>}
   */
  async updateIssuedNumberOfQuestions(token, numberOfQuestions) {
    try {
      if (!token) throw new Error('Token mancante');
      if (!numberOfQuestions || Number.isNaN(Number(numberOfQuestions)) || Number(numberOfQuestions) < 1) {
        throw new Error('Numero domande non valido');
      }
      const body = { token, numberOfQuestions: Number(numberOfQuestions) };
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes/issued/number-of-questions`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non autorizzato');
        if (response.status === 403) throw new Error('Accesso negato');
        if (response.status === 404) throw new Error('Quiz emesso non trovato');
        if (response.status === 400) throw new Error('Numero domande non valido');
        throw new Error(`Errore API: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating issued number of questions:', error);
      throw error;
    }
  }

  /**
   * Elimina un issued quiz
   * DELETE /api/v1/quizzes/issued?token=...
   * @param {string} token
   * @returns {Promise<void>}
   */
  async deleteIssuedQuiz(token) {
    try {
      if (!token) throw new Error('Token mancante');
      const url = `${this.baseUrl}/api/v1/quizzes/issued?token=${encodeURIComponent(token)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non autorizzato');
        if (response.status === 403) throw new Error('Accesso negato');
        if (response.status === 404) throw new Error('Quiz emesso non trovato');
        throw new Error(`Errore API: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting issued quiz:', error);
      throw error;
    }
  }

  /**
   * Ottiene tutti i quiz pubblici con paginazione
   * GET /api/v1/publicquizz
   * @param {number} [page=0] - Numero pagina (0-based)
   * @param {number} [size=10] - Dimensione pagina
   * @param {string} [sortBy='quiz_id'] - Campo per ordinamento
   * @returns {Promise<Object>} Pagina di quiz pubblici { content: [], pageable: {}, totalPages, totalElements, ... }
   */
  async getPublicQuizzes(page = 0, size = 10, sortBy = 'quiz_id') {
    try {
      const url = `${this.baseUrl}/api/v1/publicquizz?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching public quizzes:', error);
      throw error;
    }
  }

  /**
   * Restituisce le domande complete dato un token e payload di domande
   * POST /api/v1/quizzes/questions-by-token
   * @param {string} token
   * @param {Record<number, { selectedOptions?: number[], correctOptions?: number[] }>} questionsPayload
   * @returns {Promise<Array<{ id:number, title:string, question:string, answers:Array<{ id:number, answer:string, correct:boolean }> }>>}
   */
  async getQuestionsByTokenWithPayload(token, questionsPayload) {
    try {
      if (!token) throw new Error('Token mancante');
      if (!questionsPayload || typeof questionsPayload !== 'object') {
        throw new Error('Payload domande non valido');
      }
      const url = `${this.baseUrl}/api/v1/quizzes/questions-by-token`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ token, questions: questionsPayload })
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non autorizzato');
        if (response.status === 403) throw new Error('Accesso negato');
        if (response.status === 404) throw new Error('Token o domande non trovati');
        if (response.status === 400) throw new Error('Richiesta non valida');
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching questions by token (POST):', error);
      throw error;
    }
  }

  /**
   * Restituisce le domande complete per un tentativo utente dato token
   * POST /api/v1/quizzes/questions-by-token
   * Body: { token, user_id }
   * @param {string} token
   * @param {number} userId
   * @returns {Promise<Array<{ id:number, title:string, question:string, answers:Array<{ id:number, answer:string, correct:boolean }> }>>}
   */
  async getQuestionsByTokenForUser(token, userId) {
    try {
      if (!token) throw new Error('Token mancante');
      if (userId == null || Number.isNaN(Number(userId))) {
        throw new Error('userId non valido');
      }
      const url = `${this.baseUrl}/api/v1/quizzes/questions-by-token`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ token, user_id: Number(userId) })
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non autorizzato');
        if (response.status === 403) throw new Error('Accesso negato');
        if (response.status === 404) throw new Error('Token o tentativo non trovato');
        if (response.status === 400) throw new Error('Richiesta non valida');
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching questions by token for user (POST):', error);
      throw error;
    }
  }

  /**
   * Salva i risultati privati di un quiz
   * POST /api/v1/quizzes/postPrivateAnswers
   * @param {Object} quizInfos - Dati del quiz con domande e risposte { quizId, title, description, domande: [{ titolo, descrizione, risposte: [{ testo, corretta, chosen }] }] }
   * @returns {Promise<void>}
   */
  async savePrivateAnswers(quizInfos) {
    try {
      console.log('Saving private quiz answers:', quizInfos);
      
      const response = await fetch(`${this.baseUrl}/api/v1/quizzes/postPrivateAnswers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(quizInfos)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorizzato - effettua nuovamente il login');
        }
        if (response.status === 400) {
          throw new Error('Dati non validi');
        }
        if (response.status === 403) {
          throw new Error('Accesso negato');
        }
        throw new Error(`Errore API: ${response.status}`);
      }

      console.log('Private answers saved successfully');
    } catch (error) {
      console.error('Error saving private answers:', error);
      throw error;
    }
  }
}

// Esporta istanza singleton
export const userApi = new UserApiService();
