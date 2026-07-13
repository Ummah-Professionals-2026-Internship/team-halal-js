import { apiFetch } from './client';

export async function getNotifications() {
    const res = await apiFetch('/api/notifications');
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to load notifications');
    }
    return data;
}

export async function markAsRead(id) {
    const res = await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to mark notification as read');
    }
    return data;
}

export async function markAllAsRead() {
    const res = await apiFetch('/api/notifications/read-all', {
        method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to mark all notifications as read');
    }
    return data;
}

export async function getNotificationPreferences() {
    const res = await apiFetch('/api/notifications/preferences');
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch notification preferences');
    }
    return data;
}

export async function updateNotificationPreferences(preferences) {
    const res = await apiFetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to update notification preferences');
    }
    return data;
}
