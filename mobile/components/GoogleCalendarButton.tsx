import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { GoogleIcon } from './GoogleIcon';
import { cardShadow } from '../constants/theme';
import { promptConnectGoogleCalendar, disconnectGoogleCalendar } from '../lib/auth-api';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

interface GoogleCalendarButtonProps {
  isConnected?: boolean;
  connectedEmail?: string;
  onStatusChange?: (connected: boolean) => void;
  containerStyle?: string;
}

export function GoogleCalendarButton({
  isConnected = false,
  connectedEmail = '',
  onStatusChange,
  containerStyle = 'my-2',
}: GoogleCalendarButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    setLoading(true);
    try {
      const success = await promptConnectGoogleCalendar();
      if (success) {
        onStatusChange?.(true);
      } else {
        setError('Google Calendar connection was cancelled or failed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError('');
    setLoading(true);
    try {
      await disconnectGoogleCalendar();
      onStatusChange?.(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <View className={`bg-white rounded-2xl border border-emerald-200 p-4 gap-3 ${containerStyle}`} style={cardShadow}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center border border-emerald-200">
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-base text-brand-text" style={fontBoldStyle}>
                Google Calendar Connected
              </Text>
              {connectedEmail ? (
                <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle} numberOfLines={1}>
                  {connectedEmail}
                </Text>
              ) : (
                <Text className="text-xs text-emerald-600 mt-0.5" style={fontStyle}>
                  Syncing availability automatically
                </Text>
              )}
            </View>
          </View>
          <Pressable
            onPress={handleDisconnect}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200"
          >
            {loading ? (
              <ActivityIndicator color="#EF4444" size="small" />
            ) : (
              <Text className="text-rose-600 text-xs" style={fontBoldStyle}>
                Disconnect
              </Text>
            )}
          </Pressable>
        </View>
        {error ? <Text className="text-brand-error text-xs" style={fontStyle}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View className={`bg-white rounded-2xl border border-brand-cardBorder p-4 gap-3 ${containerStyle}`} style={cardShadow}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-200">
            <GoogleIcon size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-base text-brand-text" style={fontBoldStyle}>
              Sync with Google Calendar
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
              Automatically block off busy times to prevent double booking.
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleConnect}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-brand-primary items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-white text-sm" style={fontBoldStyle}>
              Connect
            </Text>
          )}
        </Pressable>
      </View>
      {error ? <Text className="text-brand-error text-xs" style={fontStyle}>{error}</Text> : null}
    </View>
  );
}

export default GoogleCalendarButton;
