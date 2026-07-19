import { apiFetch } from './api-client';

export type Role = 'mentee' | 'mentor';

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  hasCompletedProfile: boolean;
};

type AuthResponse = {
  token: string;
  user: SessionUser;
};

// Shape of GET /api/auth/me — a different (larger, non-overlapping-on-id/email) projection
// of the User document than the login/register response's `user` object.
// Field list must match server/src/routes/auth.js's GET /me .select(...) string exactly.
export type MeUser = {
  // Mongoose always returns _id regardless of the .select() field list — the
  // server already sends it, this type just never declared it until now.
  _id: string;
  firstName: string;
  lastName: string;
  role: Role;
  profilePicture?: string;
  hasCompletedProfile: boolean;
  manualAvailabilitySlots?: { day: string; startTime: string; endTime: string }[];
  mentorProfile?: {
    jobTitle?: string;
    employer?: string;
    industry?: string;
    yearsOfProfExp?: number;
    volunteeringFor?: string[];
  };
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: Role
): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function getMe(): Promise<MeUser> {
  const res = await apiFetch('/api/auth/me');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch current user');
  return data;
}
