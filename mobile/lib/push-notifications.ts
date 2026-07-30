import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiFetch } from './api-client';

/**
 * Safely requests push notification permissions and registers the Expo push token on the backend server.
 * Includes fallback protection for Expo Go SDK 53/54 where native push tokens are disabled.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Check if running inside standard Expo Go app (SDK 53+ removed native push tokens from Expo Go)
  const isExpoGo = Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';

  if (isExpoGo) {
    console.log('[Push Notifications] Running in Expo Go. In-app notifications feed and preferences are active!');
    return null;
  }

  if (!Device.isDevice) {
    console.log('[Push Notifications] Remote push notifications require a physical device.');
    return null;
  }

  try {
    // Dynamic require prevents top-level side effects of expo-notifications in Expo Go
    const Notifications = require('expo-notifications');

    // Configure foreground notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push Notifications] Permission denied by user.');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007CA6',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    if (token) {
      console.log('[Push Notifications] Expo Push Token generated:', token);
      await sendPushTokenToServer(token);
    }

    return token;
  } catch (error) {
    console.warn('[Push Notifications] Setup bypassed:', error);
    return null;
  }
}

async function sendPushTokenToServer(pushToken: string) {
  try {
    const res = await apiFetch('/api/auth/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pushToken }),
    });
    if (res.ok) {
      console.log('[Push Notifications] Token registered on backend server.');
    }
  } catch (err) {
    console.error('[Push Notifications] Failed to register token on server:', err);
  }
}
