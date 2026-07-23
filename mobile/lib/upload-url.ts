import { apiBaseUrl } from './api-client';

// Server returns relative paths (e.g. /uploads/profile-pictures/xxx.jpg) resolved
// same-origin on web. Mobile has no origin to inherit, so paths need the API
// base URL prepended before they're usable in an <Image source={{uri}}> tag.
export function resolveUploadUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return apiBaseUrl + path;
}
