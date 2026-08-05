import { apiFetch } from './api-client';
import type { AvailabilitySlot } from './onboarding-api';

export type MatchConfidence = {
  percentage: number;
  label: 'high' | 'medium' | 'low';
  evaluatedCriteria: string[];
  missingCriteria: string[];
  menteeMissingCriteria: string[];
};

export type MatchedMentor = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  majors?: string[];
  university?: string;
  linkedinUrl?: string;
  additionalInfo?: string;
  manualAvailabilitySlots?: AvailabilitySlot[];
  mentorProfile?: {
    jobTitle?: string;
    employer?: string;
    industry?: string;
    yearsOfProfExp?: number;
    volunteeringFor?: string[];
  };
  compatibilityScore: number;
  confidence?: MatchConfidence;
  matchReasons?: unknown;
};

export async function getMatchSuggestions(): Promise<MatchedMentor[]> {
  const res = await apiFetch('/api/matches');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to load match suggestions');
  return data;
}
