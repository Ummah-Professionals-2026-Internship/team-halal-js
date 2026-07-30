import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator, Switch } from 'react-native';
import { Text } from '../../components/AppText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { cardShadow } from '../../constants/theme';
import {
  getNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  type AppNotification,
  type NotificationPreferences,
} from '../../lib/notifications-api';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

const DEFAULT_PREFS: NotificationPreferences = { email: true, sms: true, inApp: true };

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [notifs, prefs] = await Promise.all([getNotifications(), getNotificationPreferences()]);
      setNotifications(notifs);
      setPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggleRead = async (notification: AppNotification) => {
    const next = !notification.isRead;
    setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, isRead: next } : n)));
    try {
      if (next) await markAsRead(notification._id);
      else await markAsUnread(notification._id);
    } catch {
      // Revert on failure
      setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, isRead: !next } : n)));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    const prev = notifications;
    setNotifications((cur) => cur.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllAsRead();
    } catch {
      setNotifications(prev);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const prev = preferences;
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setSavingPrefs(true);
    try {
      const data = await updateNotificationPreferences({ [key]: value });
      setPreferences(data);
    } catch {
      setPreferences(prev);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#00212C" />
          </Pressable>
          <Text className="text-2xl text-brand-text" style={fontBoldStyle}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllAsRead}>
            <Text className="text-brand-primary text-xs" style={fontBoldStyle}>Mark all as read</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#007CA6" className="mt-6" />
      ) : (
        <>
          {error ? <Text className="text-brand-error text-xs" style={fontStyle}>{error}</Text> : null}

          <View className="bg-white rounded-2xl border border-brand-cardBorder p-4" style={cardShadow}>
            {notifications.length === 0 ? (
              <Text className="text-slate-400 text-center py-8 text-sm" style={fontStyle}>
                You have no notifications yet.
              </Text>
            ) : (
              notifications.map((n, i) => (
                <Pressable
                  key={n._id}
                  onPress={() => handleToggleRead(n)}
                  className={`py-3.5 flex-row gap-3 items-start ${i > 0 ? 'border-t border-brand-cardBorder' : ''}`}
                >
                  <View className={`w-2 h-2 rounded-full mt-1.5 ${!n.isRead ? 'bg-brand-primary' : 'bg-transparent'}`} />
                  <View className="flex-1">
                    <Text
                      className={`text-sm text-brand-text ${!n.isRead ? '' : 'opacity-60'}`}
                      style={!n.isRead ? fontBoldStyle : fontStyle}
                    >
                      {n.message}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-1" style={fontStyle}>
                      {formatTimestamp(n.createdAt)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          <View className="bg-white rounded-2xl border border-brand-cardBorder p-4 gap-4" style={cardShadow}>
            <Text className="text-base text-brand-text" style={fontBoldStyle}>Notification Preferences</Text>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-sm text-brand-text" style={fontBoldStyle}>Email Alerts</Text>
                <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
                  Receipts for bookings and reschedules.
                </Text>
              </View>
              <Switch
                value={preferences.email}
                disabled={savingPrefs}
                onValueChange={(v) => handlePreferenceChange('email', v)}
                trackColor={{ true: '#007CA6' }}
              />
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-sm text-brand-text" style={fontBoldStyle}>SMS / WhatsApp Alerts</Text>
                <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
                  Reminders sent to your phone. Msg & data rates may apply.
                </Text>
              </View>
              <Switch
                value={preferences.sms}
                disabled={savingPrefs}
                onValueChange={(v) => handlePreferenceChange('sms', v)}
                trackColor={{ true: '#007CA6' }}
              />
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-sm text-brand-text" style={fontBoldStyle}>In-App Alerts</Text>
                <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
                  Show updates in this notifications list.
                </Text>
              </View>
              <Switch
                value={preferences.inApp}
                disabled={savingPrefs}
                onValueChange={(v) => handlePreferenceChange('inApp', v)}
                trackColor={{ true: '#007CA6' }}
              />
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}
