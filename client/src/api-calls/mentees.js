import { apiFetch } from './client';

export async function createMenteeProfile(profileData) {
  const res = await apiFetch('/api/mentees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to save mentee profile');
  }

  return data;
}

// Accepts any subset of mentee profile fields to update.
// e.g. updateMenteeProfile({ desiredCareer: 'Software Engineer' }) or updateMenteeProfile({ academicStatus: 'Junior', university: 'MIT' })
export async function updateMenteeProfile(updates) {
  const res = await apiFetch('/api/mentees/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to update mentee profile');
  }

  return data;
}

export async function getMatchSuggestions() {
  const res = await apiFetch('/api/matches');

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch matches');
  }

  return data;
}
