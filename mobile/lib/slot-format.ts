// Consolidates slot-id parsing/formatting logic that's duplicated across
// MentorAvailabilityCard.jsx, MenteeSchedulePage.jsx, and MenteeBooking.jsx
// on web into one shared module.

const TIMES = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM',
  '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM',
];

function to24Hour(time: string): number {
  const [hourStr, period] = time.split(' ');
  let hour = parseInt(hourStr, 10);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour;
}

function endTimeFor(time: string): string {
  const idx = TIMES.indexOf(time);
  return TIMES[idx + 1] ?? '9 PM';
}

// Date -> "YYYY-MM-DD-{h} AM/PM" (local time), e.g. "2026-07-21-9 AM"
export function toDateSlotId(scheduledTime: string | Date): string {
  const d = new Date(scheduledTime);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const h = d.getHours();
  const timeStr = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
  return `${dateStr}-${timeStr}`;
}

// "YYYY-MM-DD-H AM/PM" -> ISO string, for the create/reschedule session API calls.
export function parseSlotToISO(dateSlotId: string): string {
  const parts = dateSlotId.split('-');
  const dateStr = parts.slice(0, 3).join('-');
  const timeStr = parts.slice(3).join('-');
  const hour = to24Hour(timeStr);
  return new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`).toISOString();
}

export type SlotDisplay = {
  day: string;
  time: string;
  endTime: string;
};

// "YYYY-MM-DD-H AM/PM" -> human-readable day/time/end-time for confirmation screens.
export function formatSlotForDisplay(dateSlotId: string): SlotDisplay {
  const parts = dateSlotId.split('-');
  const dateStr = parts.slice(0, 3).join('-');
  const time = parts.slice(3).join('-');
  const dateObj = new Date(`${dateStr}T00:00:00`);
  const day = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return { day, time, endTime: endTimeFor(time) };
}
