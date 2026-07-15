const apiBaseUrl = import.meta.env.VITE_API_URL || '';

/**
 * A wrapper around fetch that automatically attaches the JWT auth token
 * and the base API URL. All API functions should use this instead of raw fetch.
 *
 * @param {string} endpoint - The API path, e.g. '/api/auth/login'
 * @param {RequestInit} options - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
    'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  };

  // Only attach the auth header if a token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(apiBaseUrl + endpoint, {
      ...options,
      headers,
    });
  } catch {
    // fetch() itself only throws on network-level failures (DNS, offline, CORS) —
    // a reachable-but-erroring server (500, proxy error, etc.) still resolves normally.
    throw new Error('Could not connect to the server. Please check your connection and try again.');
  }

  // Every caller does `await res.json()` right after apiFetch. If the backend (or the
  // dev proxy standing in for it, e.g. a 502 when the backend isn't running) sends back
  // a non-JSON or empty body, the native res.json() throws a cryptic
  // "Unexpected end of JSON input" instead of a message callers can show a user.
  // Override it here so every call site gets a clear error for free.
  const originalJson = res.json.bind(res);
  res.json = async () => {
    try {
      return await originalJson();
    } catch {
      throw new Error(
        res.ok
          ? 'Server returned an unexpected response. Please try again.'
          : `Server is unreachable or returned an error (status ${res.status}). Please try again in a moment.`
      );
    }
  };

  return res;
}

export { apiBaseUrl };
