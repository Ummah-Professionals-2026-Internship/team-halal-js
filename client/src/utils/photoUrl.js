import { apiBaseUrl } from '../api-calls/client';

export const getPhotoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return apiBaseUrl ? `${apiBaseUrl}${cleanPath}` : cleanPath;
};
