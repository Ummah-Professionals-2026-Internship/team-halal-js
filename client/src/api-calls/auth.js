import { apiFetch } from './client';

/**
 * Log in a user with email and password.
 * @returns {Promise<{token: string, user: object}>} The token and user object on success.
 * @throws Will throw an error with a message if the request fails.
 */
export async function login(email, password) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data; // { token, user }
}

/**
 * Register a new user.
 * @returns {Promise<{token: string, user: object}>} The token and user object on success.
 * @throws Will throw an error with a message if the request fails.
 */
export async function register(firstName, lastName, email, password, role) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, role }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data; // { token, user }
}

/**
 * Fetch the currently logged-in user from the token in localStorage.
 * @returns {Promise<object>} The user object.
 * @throws Will throw if the request fails or the token is invalid.
 */
export async function getMe() {
  const res = await apiFetch('/api/auth/me');

  if (!res.ok) {
    throw new Error('Failed to fetch current user');
  }

  return res.json(); // user object
}

/**
 * Disconnect the Google Calendar from the current user's account.
 * @returns {Promise<void>}
 * @throws Will throw if the request fails.
 */
export async function disconnectGoogle() {
  const res = await apiFetch('/api/auth/google/disconnect', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to disconnect Google Calendar');
  }
}
