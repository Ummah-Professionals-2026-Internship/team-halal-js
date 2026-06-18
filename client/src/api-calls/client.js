const apiBaseUrl = import.meta.env.VITE_API_URL || '';

/**
 * A wrapper around fetch that automatically attaches the JWT auth token
 * and the base API URL. All API functions should use this instead of raw fetch.
 *
 * @param {string} endpoint - The API path, e.g. '/api/auth/login'
 * @param {RequestInit} options - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  // Only attach the auth header if a token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(apiBaseUrl + endpoint, {
    ...options,
    headers,
  });
}

export { apiBaseUrl };
