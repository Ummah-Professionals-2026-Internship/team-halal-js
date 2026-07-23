import type { AvailabilitySlot } from './onboarding-api';

export type PendingBooking = {
  mentorId: string;
  mentorName: string;
  mentorAvailability: AvailabilitySlot[];
  rescheduleSessionId?: string;
  selectedSlot?: string;
};

// Non-persisted, module-level handoff for passing a booking target between
// the dashboard/session-card entry points and the schedule/booking screens.
// Expo Router has no equivalent to React Router's navigate(path, {state}) for
// passing full objects between screens. Reads are deliberately non-destructive
// (not consumed-on-read): a read-and-clear pattern read inside a lazy state
// initializer or effect would break under React 19 Strict Mode's intentional
// double-invoke in dev — the first phantom invoke would consume it, leaving
// the second real one with null.
let pending: PendingBooking | null = null;

export function setPendingBooking(data: PendingBooking): void {
  pending = data;
}

export function getPendingBooking(): PendingBooking | null {
  return pending;
}

export function clearPendingBooking(): void {
  pending = null;
}
