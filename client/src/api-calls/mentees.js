import { apiFetch } from './client';

/**
 * Create or update the mentee's profile with the full onboarding data.
 * @param {object} profileData - The complete mentee profile object to save.
 * @returns {Promise<object>} The saved mentee user object.
 * @throws Will throw if the request fails.
 */
export async function createMenteeProfile(profileData) {
  const res = await apiFetch('/api/mentees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to save mentee profile');
  }

  return data; // saved mentee user object
}
