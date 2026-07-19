import { apiFetch } from './api-client';

export type SessionParticipant = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
};

export type Session = {
  _id: string;
  mentee: SessionParticipant;
  mentor: SessionParticipant;
  scheduledTime: string;
  link?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  service?: string;
  details?: string;
};

// Mentor-scoped: server's GET /api/sessions only returns sessions where
// mentor === req.user.id (confirmed in server/src/routes/sessions.js).
export async function getSessions(): Promise<Session[]> {
  const res = await apiFetch('/api/sessions');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load sessions');
  return data;
}

export async function cancelSession(sessionId: string): Promise<Session> {
  const res = await apiFetch(`/api/sessions/${sessionId}/cancel`, { method: 'PUT' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to cancel session');
  return data;
}

// Mentee-scoped equivalent of getSessions() — GET /api/sessions/mentee
// returns sessions where mentee === req.user.id.
export async function getMenteeSessions(): Promise<Session[]> {
  const res = await apiFetch('/api/sessions/mentee');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load sessions');
  return data;
}

export type BookedSlot = { scheduledTime: string };

// Real scheduled sessions for this mentor plus synthetic hourly entries
// derived from their Google-Calendar-busy cache — already unified server-side,
// the client just treats the whole array as "this mentor is busy then".
export async function getMentorBookedSlots(mentorId: string): Promise<BookedSlot[]> {
  const res = await apiFetch(`/api/sessions/mentor/${mentorId}/booked`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load mentor availability');
  return data;
}

export type CreateSessionPayload = {
  mentorId: string;
  scheduledTime: string;
  service: string;
  details?: string;
};

export async function createSession(payload: CreateSessionPayload): Promise<Session> {
  const res = await apiFetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to schedule session');
  return data;
}

export type RescheduleSessionPayload = {
  scheduledTime: string;
  service: string;
  details?: string;
};

export async function rescheduleSession(
  sessionId: string,
  payload: RescheduleSessionPayload
): Promise<Session> {
  const res = await apiFetch(`/api/sessions/${sessionId}/reschedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reschedule session');
  return data;
}
