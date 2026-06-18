import { apiFetch } from './client';

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

  return data;
}

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

  return data;
}

export async function getMe() {
  const res = await apiFetch('/api/auth/me');
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch current user');
  }

  return data;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await apiFetch('/api/auth/change-password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to change password');
  }

  return data;
}

export async function deleteAccount() {
  const res = await apiFetch('/api/auth/delete-account', {
    method: 'DELETE',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete account');
  }

  return data;
}

export async function disconnectGoogle() {
  const res = await apiFetch('/api/auth/google/disconnect', {
    method: 'POST',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to disconnect Google Calendar');
  }
}
