// API configuration with runtime environment variable support
const getApiBaseUrl = () => {
  // In production build, this will be replaced by docker-entrypoint.sh
  // In development, it uses the standard Vite env variable
  if (import.meta.env.MODE === 'production') {
    console.log('Production mode');
    return 'VITE_API_BASE_URL_PLACEHOLDER';
  } else {
    console.log('Development mode - using Vite proxy');
    // In development, use empty string to leverage Vite proxy
    // The proxy will forward /api/* requests to localhost:8080
    return '';
  }
};

const API_BASE_URL = getApiBaseUrl();
import { getCsrfHeaders, clearCsrf } from './csrf.js';
import { 
  decodeJWT, 
  isTokenExpired, 
  getUserFromToken, 
  storeToken, 
  getStoredToken, 
  removeToken,
  hasValidToken 
} from '../utils/jwt.js';

// Servizio di autenticazione
class AuthService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Controlla lo stato della sessione lato server
   * @returns {Promise<boolean>} true se 200, false se 401 o errore
   */
  async checkServerSessionStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...getCsrfHeaders() },
        credentials: 'include'
      });
      if (response.status === 200) return true;
      if (response.status === 401) return false;
      console.warn(`Verifica status sessione ha restituito: ${response.status}`);
      return false;
    } catch (error) {
      console.error('Errore durante la verifica dello status sessione:', error);
      return false;
    }
  }

  /**
   * Effettua il login con credenziali username/email e password
   * @param {Object} credentials - {username: string, password: string}
   * @returns {Promise<Object>} Response del login con JWT token
   */
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/jwt/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          username: credentials.username, // Può essere username o email
          password: credentials.password
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenziali non valide');
        }
        throw new Error(`Errore login: ${response.status}`);
      }

      // Il backend restituisce il JWT token nel body della response
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('Nessun token ricevuto dal server');
      }

      // Il token potrebbe essere una stringa JWT o un JSON con il token
      let token;
      try {
        // Prova a parsare come JSON prima
        const jsonResponse = JSON.parse(responseText);
        token = jsonResponse.token || jsonResponse.access_token || responseText.trim();
      } catch (e) {
        // Se non è JSON, usa il testo direttamente
        token = responseText.trim();
      }
      
      console.log('🔑 Token ricevuto dal server:', token.substring(0, 50) + '...');
      
      // Verifica che il token sia valido
      const userData = getUserFromToken(token);
      if (!userData) {
        throw new Error('Token JWT non valido');
      }

      // Salva il token
      storeToken(token);
      console.log('💾 Token salvato in localStorage');
      
      // Verifica che il token sia stato salvato correttamente
      const savedToken = getStoredToken();
      if (savedToken) {
        console.log('✅ Token verificato in localStorage:', savedToken.substring(0, 20) + '...');
      } else {
        console.error('❌ Errore: token non salvato in localStorage');
      }
      
      return { 
        success: true, 
        token: token,
        user: userData
      };
      
    } catch (error) {
      console.error('Errore durante il login:', error);
      throw error;
    }
  }

  /**
   * Verifica lo stato di autenticazione corrente basandosi sul JWT token locale
   * @returns {Promise<Object>} Stato dell'autenticazione
   */
  async checkAuthStatus() {
    try {
      console.log('Verifica stato autenticazione');
      const token = getStoredToken();
      console.log('Token:', token);
      // 1) JWT path
      if (token) {
        if (isTokenExpired(token)) {
          console.log('Token scaduto');
          // Token scaduto, rimuovilo
          removeToken();
          return {
            authenticated: false,
            user: null,
            message: 'Token di autenticazione scaduto'
          };
        }
        console.log('Token valido');
        // Token valido, estrai i dati utente
        const userData = getUserFromToken(token);
        if (!userData) {
          // Token non valido, rimuovilo
          removeToken();
          return {
            authenticated: false,
            user: null,
            message: 'Token di autenticazione non valido'
          };
        }
        
        return {
          authenticated: true,
          user: userData,
          token: token,
          message: 'Autenticato tramite JWT'
        };
      }
      console.log('Token non valido');

      // 2) Session path (no token): prima controlla lo status della sessione
      const sessionOk = await this.checkServerSessionStatus();
      if (!sessionOk) {
        console.log('Sessione non valida');
        return {
          authenticated: false,
          user: null
        };
      }
  console.log('Sessione valida');
      // Se la sessione è valida, recupera i dati utente
      try {
        console.log('Recupero utente sessione');
        const response = await fetch(`${this.baseUrl}/api/v1/users`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', ...getCsrfHeaders() },
          credentials: 'include'
        });
        if (response.ok) {
          console.log('Sessione valida');
          const data = await response.json();
          return {
            authenticated: true,
            user: {
              id: data.id,
              username: data.username,
              email: data.email,
              exp: null,
              iat: null
            },
            message: 'Autenticato tramite sessione'
          };
        }
        // Se lo status era ok ma la fetch utente fallisce, consideriamo non autenticato
        return {
          authenticated: false,
          user: null,
          message: `Errore recupero utente: ${response.status}`
        };
      } catch (sessionErr) {
        console.error('Errore recupero utente sessione:', sessionErr);
        return {
          authenticated: false,
          user: null,
          message: 'Errore recupero utente sessione'
        };
      }
      
    } catch (error) {
      console.error('Errore verifica autenticazione:', error);
      // In caso di errore, rimuovi il token per sicurezza
      removeToken();
      return {
        authenticated: false,
        user: null,
        message: 'Errore verifica token'
      };
    }
  }

  /**
   * Effettua il logout rimuovendo il JWT token
   */
  async logout() {
    const token = getStoredToken();
    try {
      // Effettua sempre il tentativo di logout server-side
      const headers = { 'Content-Type': 'application/json', ...getCsrfHeaders() };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });
      if (!response.ok && response.status !== 204) {
        console.warn(`Logout server-side non ok: ${response.status}`);
      }
    } catch (error) {
      console.error('Errore durante il logout server-side:', error);
    } finally {
      // Pulisci sempre il token lato client
      removeToken();
      clearCsrf();
    }
    return { success: true };
  }

  /**
   * Utility per ottenere l'URL base dell'API
   * @returns {string} Base URL dell'API
   */
  getApiBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Ottiene il token JWT corrente
   * @returns {string|null} Il token JWT o null se non presente
   */
  getCurrentToken() {
    return getStoredToken();
  }

  /**
   * Ottiene i dati utente dal token corrente
   * @returns {Object|null} I dati utente o null se non valido
   */
  getCurrentUser() {
    const token = getStoredToken();
    return token ? getUserFromToken(token) : null;
  }

  /**
   * Registra un nuovo utente
   * @param {Object} userData - {username: string, email: string, password: string}
   * @returns {Promise<Object>} Response della registrazione
   */
  async register(userData) {
    try {
      console.log('📝 Registrazione utente:', userData.username);
      
      const response = await fetch(`${this.baseUrl}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.text();
          throw new Error(errorData || 'Dati non validi');
        }
        if (response.status === 409) {
          let conflictMsg = '';
          try {
            conflictMsg = await response.text();
          } catch {}
          // Passa il messaggio specifico dal backend se presente (es. "Username already in use" / "email already in use")
          throw new Error(conflictMsg || 'Username o email già esistenti');
        }
        throw new Error(`Errore registrazione: ${response.status}`);
      }

      console.log('✅ Registrazione completata con successo');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Errore registrazione:', error);
      throw error;
    }
  }

  /**
   * Conferma l'email dell'utente tramite token
   * @param {string} token - Token di verifica email
   * @returns {Promise<Object>} Response della conferma
   */
  async confirmEmail(token) {
    try {
      console.log('📧 Conferma email con token...');
      
      const response = await fetch(`${this.baseUrl}/api/v1/users/confirm?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders(),
        }
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Token non valido o scaduto');
        }
        if (response.status === 404) {
          throw new Error('Token non trovato');
        }
        throw new Error(`Errore conferma email: ${response.status}`);
      }

      console.log('✅ Email confermata con successo');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Errore conferma email:', error);
      throw error;
    }
  }

  /**
   * Avvia la procedura di reset password inviando l'email
   * @param {string} email - Indirizzo email dell'utente
   * @returns {Promise<void>} Risolve se la richiesta è andata a buon fine
   */
  async forgotPassword(email) {
    try {
      if (!email || !email.trim()) {
        throw new Error('Email richiesta');
      }
      const url = `${this.baseUrl}/api/v1/users/forgot-password?email=${encodeURIComponent(email.trim())}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getCsrfHeaders() },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Non rivelare se l'email esiste o meno
          return;
        }
        throw new Error(`Errore richiesta reset: ${response.status}`);
      }
    } catch (error) {
      console.error('Errore forgotPassword:', error);
      throw error;
    }
  }

  /**
   * Imposta una nuova password utilizzando il token di reset
   * @param {string} token - Token di reset ricevuto via email
   * @param {string} newPassword - Nuova password conforme ai requisiti
   * @returns {Promise<string>} Messaggio di successo dal backend
   */
  async resetPassword(token, newPassword) {
    try {
      if (!token || !token.trim()) {
        throw new Error('Token mancante');
      }
      if (!newPassword || !newPassword.trim()) {
        throw new Error('Nuova password richiesta');
      }
      const response = await fetch(`${this.baseUrl}/api/v1/users/set/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getCsrfHeaders() },
        credentials: 'include',
        body: JSON.stringify({ token: token.trim(), newPassword: newPassword })
      });
      if (!response.ok) {
        let details = '';
        try {
          details = await response.text();
        } catch {}
        throw new Error(details || `Errore reset password: ${response.status}`);
      }
      try {
        const text = await response.text();
        return text || 'Password reset successfully';
      } catch {
        return 'Password reset successfully';
      }
    } catch (error) {
      console.error('Errore resetPassword:', error);
      throw error;
    }
  }
  /**
   * Verifica se l'utente è attualmente autenticato
   * @returns {boolean} True se autenticato con token valido
   */
  isAuthenticated() {
    // Resta una verifica sincrona: true solo per JWT valido
    // La sessione viene verificata in modo asincrono via checkAuthStatus()
    return hasValidToken();
  }
}

// Esporta istanza singleton
export const authService = new AuthService();

// Esporta anche la classe per testing
export default AuthService;

