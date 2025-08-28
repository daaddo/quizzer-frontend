// JWT utility functions for token management

/**
 * Decodes a JWT token and returns the payload
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} The decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Gets the expiration time of a JWT token
 * @param {string} token - The JWT token
 * @returns {Date|null} The expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
};

/**
 * Gets user data from JWT token
 * @param {string} token - The JWT token
 * @returns {Object|null} User data object or null if invalid
 */
export const getUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }
  
  return {
    id: decoded.id,
    username: decoded.sub, // 'sub' contains the username
    email: decoded.email,
    exp: decoded.exp,
    iat: decoded.iat
  };
};

/**
 * Storage keys for JWT token
 */
export const TOKEN_STORAGE_KEY = 'quizzer_jwt_token';

/**
 * Stores JWT token in localStorage
 * @param {string} token - The JWT token to store
 */
export const storeToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

/**
 * Retrieves JWT token from localStorage
 * @returns {string|null} The stored token or null if not found
 */
export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Removes JWT token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/**
 * Checks if there's a valid (non-expired) token stored
 * @returns {boolean} True if valid token exists
 */
export const hasValidToken = () => {
  const token = getStoredToken();
  return token && !isTokenExpired(token);
};

