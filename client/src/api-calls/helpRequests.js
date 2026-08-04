import { apiFetch } from './client';

export async function submitHelpRequest({ topics, message }) {
  const res = await apiFetch('/api/help-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topics, message }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to submit help request');
  }

  return data;
}

export async function getHelpRequests() {
  const res = await apiFetch('/api/help-requests');

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch help requests');
  }

  return data;
}

export async function respondToHelpRequest(id, response) {
  const res = await apiFetch(`/api/help-requests/${id}/respond`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to send response');
  }

  return data;
}
