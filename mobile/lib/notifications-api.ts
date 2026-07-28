import { apiFetch } from './api-client';

export type NotificationSender = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
};

export type AppNotification = {
  _id: string;
  recipient: string;
  sender?: NotificationSender;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  inApp: boolean;
};

export async function getNotifications(): Promise<AppNotification[]> {
  const res = await apiFetch('/api/notifications');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load notifications');
  return data;
}

export async function markAsRead(id: string): Promise<AppNotification> {
  const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to mark notification as read');
  return data;
}

export async function markAsUnread(id: string): Promise<AppNotification> {
  const res = await apiFetch(`/api/notifications/${id}/unread`, { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to mark notification as unread');
  return data;
}

export async function markAllAsRead(): Promise<{ message: string }> {
  const res = await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to mark all notifications as read');
  return data;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await apiFetch('/api/notifications/preferences');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notification preferences');
  return data;
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const res = await apiFetch('/api/notifications/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update notification preferences');
  return data;
}
