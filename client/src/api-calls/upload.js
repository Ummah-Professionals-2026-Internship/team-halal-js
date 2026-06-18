import { apiFetch } from './client';

/**
 * Upload a profile picture.
 * @param {FormData} formData - A FormData object with the 'profilePicture' field attached.
 * @returns {Promise<{filePath: string}>} Object containing the uploaded file path.
 * @throws Will throw if the upload fails.
 */
export async function uploadProfilePicture(formData) {
  const res = await apiFetch('/api/upload/profile-picture', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type here — the browser sets it automatically with the boundary for FormData
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Profile picture upload failed');
  }

  return data; // { filePath }
}

/**
 * Upload a resume file.
 * @param {FormData} formData - A FormData object with the 'resume' field attached.
 * @returns {Promise<{filePath: string}>} Object containing the uploaded file path.
 * @throws Will throw if the upload fails.
 */
export async function uploadResume(formData) {
  const res = await apiFetch('/api/upload/resume', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type here — the browser sets it automatically with the boundary for FormData
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Resume upload failed');
  }

  return data; // { filePath }
}
