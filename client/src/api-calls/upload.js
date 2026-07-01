import { apiFetch } from './client';

export async function uploadProfilePicture(formData) {
  const res = await apiFetch('/api/upload/profile-picture', {
    method: 'POST',
    // Do not set Content-Type — the browser must set it automatically to include the multipart boundary
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Profile picture upload failed');
  }

  return data;
}

export async function uploadResume(formData) {
  const res = await apiFetch('/api/upload/resume', {
    method: 'POST',
    // Do not set Content-Type — the browser must set it automatically to include the multipart boundary
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Resume upload failed');
  }

  return data;
}
