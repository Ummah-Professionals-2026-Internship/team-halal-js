import { apiFetch } from './api-client';
import type { Role } from './auth-api';

export type AvailabilitySlot = {
  day: string;
  startTime: string;
  endTime: string;
};

// Field names/shape match exactly what server/src/routes/Mentor.js and
// Mentee.js read off req.body — both routes read a flat body, not a nested
// mentorProfile/menteeProfile object.
export type CreateMentorProfilePayload = {
  gender: 'male' | 'female';
  phone: string;
  linkedinUrl: string;
  referralSource: string;
  profilePicture?: string;
  state: string;
  timeZone: string;
  additionalInfo: string;
  university: string;
  majors: string[];
  calendarAccess: boolean;
  resume: string;
  jobTitle: string;
  employer: string;
  industry: string;
  yearsOfProfExp: number;
  frequency: string;
  volunteeringFor: string[];
  customMeetingLink?: string;
  manualAvailabilitySlots: AvailabilitySlot[];
};

export type CreateMenteeProfilePayload = {
  gender: 'male' | 'female';
  phone: string;
  linkedinUrl: string;
  referralSource: string;
  profilePicture?: string;
  state: string;
  timeZone: string;
  additionalInfo: string;
  university: string;
  majors: string[];
  calendarAccess: boolean;
  resume: string;
  academicStatus: string;
  desiredCareer: string;
  desiredServices: string[];
  manualAvailabilitySlots: AvailabilitySlot[];
};

export async function createMentorProfile(payload: CreateMentorProfilePayload) {
  const res = await apiFetch('/api/mentors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to save mentor profile');
  return data;
}

export async function createMenteeProfile(payload: CreateMenteeProfilePayload) {
  const res = await apiFetch('/api/mentees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to save mentee profile');
  return data;
}

export function firstOnboardingStep(role: Role): '/mentor/profile-setup' | '/mentee/profile-setup' {
  return role === 'mentor' ? '/mentor/profile-setup' : '/mentee/profile-setup';
}

export async function updateMentorAvailability(manualAvailabilitySlots: AvailabilitySlot[]) {
  const res = await apiFetch('/api/mentors/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ manualAvailabilitySlots }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to update availability');
  return data;
}
