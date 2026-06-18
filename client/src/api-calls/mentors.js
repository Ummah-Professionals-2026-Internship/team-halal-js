import { apiFetch } from './client';

/**
 * Create or update the mentor's profile with the full onboarding data.
 * @param {object} profileData - The complete mentor profile object to save.
 * @returns {Promise<object>} The saved mentor user object.
 * @throws Will throw if the request fails.
 */
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

  return data; // saved mentor user object
}
