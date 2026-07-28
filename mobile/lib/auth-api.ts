import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { apiFetch } from './api-client';

WebBrowser.maybeCompleteAuthSession();

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

export type MeUser = {
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
  if (!res.ok) {
    const err: any = new Error(data.message || 'Login failed');
    err.isGoogleAccount = data.isGoogleAccount;
    throw err;
  }
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

/**
 * Triggers Google OAuth sign-in flow via in-app browser sheet (expo-web-browser).
 * Returns the issued JWT token string upon successful Google authentication, or null if cancelled.
 */
export async function promptGoogleSignIn(): Promise<string | null> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.68.100:5000';
  const returnUrl = Linking.createURL('/');
  const authUrl = `${baseUrl}/api/auth/google/signin?app_redirect=${encodeURIComponent(returnUrl)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

  if (result.type === 'success' && result.url) {
    const urlStr = result.url;
    const parsed = Linking.parse(urlStr);
    let token = (parsed.queryParams?.token as string) || (parsed.queryParams?.tempToken as string);
    
    if (!token && (urlStr.includes('token=') || urlStr.includes('tempToken='))) {
      const match = urlStr.match(/[?&](?:tempT|t)oken=([^&]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    return token || null;
  }
  return null;
}
