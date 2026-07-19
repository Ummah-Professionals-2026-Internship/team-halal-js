import { apiFetch } from './api-client';

export type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

// React Native's FormData expects a { uri, name, type } part for files, unlike
// the web's raw File object — the TS DOM lib doesn't know this shape, hence the cast.
function buildFormData(fieldName: string, file: PickedFile): FormData {
  const formData = new FormData();
  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  return formData;
}

export async function uploadProfilePicture(file: PickedFile): Promise<{ filePath: string }> {
  const formData = buildFormData('profilePicture', file);
  // Do not set Content-Type — fetch must set it automatically to include the multipart boundary.
  const res = await apiFetch('/api/upload/profile-picture', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Profile picture upload failed');
  return data;
}

export type ResumeParsedData = {
  university: string;
  majors: string;
  desiredCareer: string;
  phone: string;
  linkedinUrl: string;
};

export async function uploadResume(
  file: PickedFile
): Promise<{ filePath: string; parsedData: ResumeParsedData }> {
  const formData = buildFormData('resume', file);
  const res = await apiFetch('/api/upload/resume', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Resume upload failed');
  return data;
}
