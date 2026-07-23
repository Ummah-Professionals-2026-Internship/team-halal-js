import * as SecureStore from 'expo-secure-store';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || '';

/**
 * A wrapper around fetch that automatically attaches the JWT auth token
 * and the base API URL. All API functions should use this instead of raw fetch.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await SecureStore.getItemAsync('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
    'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };

  // Only attach the auth header if a token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(apiBaseUrl + endpoint, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error('[apiFetch Network Error]:', err);
    throw new Error('Could not connect to the server. Please check your connection and try again.');
  }

  // Every caller does `await res.json()` right after apiFetch. If the backend sends back
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
