import { apiFetch } from './client';

export async function submitFeedback({ sessionId, meetingRating, usefulAdviceRating, comments }) {
  const res = await apiFetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, meetingRating, usefulAdviceRating, comments }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to submit feedback');
  }

  return data;
}

export async function getFeedback() {
  const res = await apiFetch('/api/feedback');

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch feedback');
  }

  return data;
}

export async function sendFeedbackFollowUp(feedbackId, message) {
  const res = await apiFetch(`/api/feedback/${feedbackId}/follow-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to send follow-up');
  }

  return data;
}

export async function replyToFeedbackFollowUp(feedbackId, reply) {
  const res = await apiFetch(`/api/feedback/${feedbackId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to send reply');
  }

  return data;
}

export async function getFeedbackForSession(sessionId) {
  const res = await apiFetch(`/api/feedback/session/${sessionId}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch session feedback');
  }

  return data;
}

export async function checkMyFeedback(sessionId) {
  const res = await apiFetch(`/api/feedback/mine/${sessionId}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to check feedback status');
  }

  return data.submitted;
}
