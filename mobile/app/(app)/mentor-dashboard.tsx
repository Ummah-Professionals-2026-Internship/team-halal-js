import { useCallback, useEffect, useState } from 'react';
import { View, Image, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/AppText';
import { useSession } from '../../lib/session-context';
import { getSessions, type Session } from '../../lib/sessions-api';
import { getNotifications } from '../../lib/notifications-api';
import { resolveUploadUrl } from '../../lib/upload-url';
import { Screen } from '../../components/Screen';
import { ServicesCard } from '../../components/dashboard/ServicesCard';
import { AvailabilityCard } from '../../components/dashboard/AvailabilityCard';
import { UpcomingSessionsList } from '../../components/dashboard/UpcomingSessionsList';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function MentorDashboard() {
  const { user, signOut } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    const [sessionsResult, notifsResult] = await Promise.allSettled([getSessions(), getNotifications()]);
    if (sessionsResult.status === 'fulfilled') setSessions(sessionsResult.value);
    if (notifsResult.status === 'fulfilled') {
      setUnreadCount(notifsResult.value.filter((n) => !n.isRead).length);
    }
  }, []);

  useEffect(() => {
    loadDashboard().finally(() => setLoading(false));
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const avatarUrl = resolveUploadUrl(user?.profilePicture);
  const initial = user?.firstName?.[0]?.toUpperCase() ?? '?';
  const services = user?.mentorProfile?.volunteeringFor ?? [];

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-3">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-brand-button items-center justify-center">
              <Text className="text-white text-lg" style={fontBoldStyle}>{initial}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-xs text-slate-500" style={fontStyle}>{timeOfDayGreeting()}</Text>
            <Text className="text-lg text-brand-text" numberOfLines={1} style={fontBoldStyle}>{user?.firstName}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push('/notifications')}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-white border border-brand-cardBorder items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={20} color="#00212C" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand-error items-center justify-center">
                <Text className="text-white text-[9px]" style={fontBoldStyle}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => router.push('/mentor/profile-settings')}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-white border border-brand-cardBorder items-center justify-center"
          >
            <Ionicons name="settings-outline" size={20} color="#00212C" />
          </Pressable>
          <Pressable onPress={signOut} className="rounded-lg bg-brand-primary px-4 py-2.5">
            <Text className="text-white text-xs" style={fontBoldStyle}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      <ServicesCard services={services} />

      {user && <AvailabilityCard initialSlots={user.manualAvailabilitySlots ?? []} />}

      {loading ? (
        <ActivityIndicator color="#007CA6" className="mt-4" />
      ) : (
        <UpcomingSessionsList sessions={sessions} onRefresh={loadDashboard} />
      )}
    </Screen>
  );
}
