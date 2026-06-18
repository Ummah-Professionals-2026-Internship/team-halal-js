import { apiFetch } from './client';

export async function createMentorProfile(profileData) {
  const res = await apiFetch('/api/mentors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to save mentor profile');
  }

  return data;
}

// Accepts any subset of mentor profile fields to update.
// e.g. updateMentorProfile({ jobTitle: 'Engineer' }) or updateMentorProfile({ frequency: 'Weekly', maxMentees: 3 })
export async function updateMentorProfile(updates) {
  const res = await apiFetch('/api/mentors/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to update mentor profile');
  }

  return data;
}