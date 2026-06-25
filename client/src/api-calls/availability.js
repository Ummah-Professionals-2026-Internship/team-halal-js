import { apiFetch } from './client';

// Accepts any subset of availability fields to update.
// e.g. updateAvailability({ manualAvailabilitySlots: [...] }) or updateAvailability({ manualAvailabilitySlots: [...], manualBlockedSlots: [...] })
export async function updateAvailability(updates) {
  const res = await apiFetch('/api/availability', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to update availability');
  }

  return data;
}
