import { authService } from './auth.js';

let csrfToken = null;
let csrfHeaderName = 'x-xsrf-token';
let csrfParameterName = '_csrf';
let initialized = false;
let initPromise = null;

const CSRF_TOKEN_KEY = 'csrfToken';
const CSRF_HEADER_NAME_KEY = 'csrfHeaderName';
const CSRF_PARAMETER_NAME_KEY = 'csrfParameterName';

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {}
  return null;
}

function loadFromStorage() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const storedToken = storage.getItem(CSRF_TOKEN_KEY);
    const storedHeaderName = storage.getItem(CSRF_HEADER_NAME_KEY);
    const storedParamName = storage.getItem(CSRF_PARAMETER_NAME_KEY);
    if (storedToken) {
      csrfToken = storedToken;
      if (storedHeaderName) csrfHeaderName = storedHeaderName;
      if (storedParamName) csrfParameterName = storedParamName;
      return true;
    }
  } catch {}
  return false;
}

function persistToStorage() {
  const storage = getStorage();
  if (!storage) return;
  try {
    if (csrfToken) storage.setItem(CSRF_TOKEN_KEY, csrfToken);
    if (csrfHeaderName) storage.setItem(CSRF_HEADER_NAME_KEY, csrfHeaderName);
    if (csrfParameterName) storage.setItem(CSRF_PARAMETER_NAME_KEY, csrfParameterName);
  } catch {}
}

export function getCsrfToken() {
  return csrfToken;
}

export function getCsrfHeaderName() {
  return csrfHeaderName;
}

export function getCsrfParameterName() {
  return csrfParameterName;
}

// Cookie helper
function getCookieValue(name) {
  try {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const pattern = new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\\/\+^]/g, '\\$&') + '=([^;]*)');
    const match = document.cookie.match(pattern);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function getXsrfTokenFromCookie() {
  return getCookieValue('XSRF-TOKEN');
}

// Header XSRF senza codifica: inviamo il valore RAW del cookie
export function getCsrfHeaders() {
  // Usa esplicitamente il valore del cookie XSRF-TOKEN; in fallback usa l'eventuale token memorizzato
  const tokenValue = getXsrfTokenFromCookie() || csrfToken;
  if (tokenValue) {
    return { 'x-xsrf-token': tokenValue };
  }
  return {};
}

function resolveApiBaseUrl() {
  try {
    const fromAuth = (authService && typeof authService.getApiBaseUrl === 'function')
      ? (authService.getApiBaseUrl() || '')
      : '';
    if (fromAuth) return fromAuth;
  } catch {}
  // In produzione, authService dovrebbe fornire la base URL corretta (placeholder sostituito in build)
  // Sviluppo: punta direttamente al backend, evitando il proxy del dev server
  return 'http://localhost:8080';
}

export async function initCsrf(force = false) {
  // Non effettuare più la GET al backend. Usa cookie/localStorage.
  if (initialized && !force && initPromise) {
    return initPromise;
  }
  initialized = true;

  // Prova a caricare da storage
  loadFromStorage();

  // Preferisci sempre il cookie XSRF-TOKEN se presente
  const cookieToken = getXsrfTokenFromCookie();
  if (cookieToken) {
    csrfToken = cookieToken;
  }
  persistToStorage();

  const result = { token: csrfToken, headerName: csrfHeaderName, parameterName: csrfParameterName };
  initPromise = Promise.resolve(result);
  return result;
}

export function clearCsrf() {
  csrfToken = null;
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(CSRF_TOKEN_KEY);
    storage.removeItem(CSRF_HEADER_NAME_KEY);
    storage.removeItem(CSRF_PARAMETER_NAME_KEY);
  } catch {}
}


