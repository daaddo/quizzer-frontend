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
}

// Esporta istanza singleton
export const userApi = new UserApiService();
