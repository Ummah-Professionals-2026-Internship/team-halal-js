import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { apiFetch, apiBaseUrl } from './api-client';

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
  email: string;
  role: Role;
  profilePicture?: string;
  hasCompletedProfile: boolean;
  phone?: string;
  state?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  university?: string;
  majors?: string[];
  additionalInfo?: string;
  resume?: string;
  calendarAccess?: boolean;
  googleCalendarTokens?: {
    email?: string;
  };
  notificationPreferences?: { email: boolean; sms: boolean; inApp: boolean };
  manualAvailabilitySlots?: { day: string; startTime: string; endTime: string }[];
  mentorProfile?: {
    jobTitle?: string;
    employer?: string;
    industry?: string;
    yearsOfProfExp?: number;
    volunteeringFor?: string[];
    customMeetingLink?: string;
    maxMentees?: number;
    frequency?: string;
  };
  menteeProfile?: {
    academicStatus?: string;
    desiredCareer?: string;
    desiredServices?: string[];
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
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || apiBaseUrl || 'http://192.168.68.100:5000';
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

/**
 * Triggers Google Calendar OAuth flow via in-app browser sheet.
 * Returns true if connected successfully, false if cancelled or failed.
 */
export async function promptConnectGoogleCalendar(): Promise<boolean> {
  const token = await SecureStore.getItemAsync('token');
  if (!token) {
    throw new Error('You must be logged in to connect your Google Calendar.');
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_URL || apiBaseUrl || 'http://192.168.68.100:5000';
  const returnUrl = Linking.createURL('/');
  const authUrl = `${baseUrl}/api/auth/google?token=${token}&app_redirect=${encodeURIComponent(returnUrl)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
  if (result.type === 'success' && result.url) {
    return !result.url.includes('calendarError=true');
  }
  return false;
}

/**
 * Disconnects Google Calendar for the authenticated user.
 */
export async function disconnectGoogleCalendar(): Promise<void> {
  const res = await apiFetch('/api/auth/google/disconnect', {
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || data.message || 'Failed to disconnect Google Calendar');
  }
}
