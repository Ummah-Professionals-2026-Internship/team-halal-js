import { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useSession } from '../../lib/session-context';
import { getSessions, type Session } from '../../lib/sessions-api';
import { resolveUploadUrl } from '../../lib/upload-url';
import { Screen } from '../../components/Screen';
import { ServicesCard } from '../../components/dashboard/ServicesCard';
import { AvailabilityCard } from '../../components/dashboard/AvailabilityCard';
import { UpcomingSessionsList } from '../../components/dashboard/UpcomingSessionsList';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

export default function MentorDashboard() {
  const { user, signOut } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch {
      // Sessions are secondary to the rest of the dashboard
    }
  }, []);

  useEffect(() => {
    loadSessions().finally(() => setLoading(false));
  }, [loadSessions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const avatarUrl = resolveUploadUrl(user?.profilePicture);
  const initial = user?.firstName?.[0]?.toUpperCase() ?? '?';
  const services = user?.mentorProfile?.volunteeringFor ?? [];

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-brand-button items-center justify-center">
              <Text className="text-white text-lg" style={fontBoldStyle}>{initial}</Text>
            </View>
          )}
          <View>
            <Text className="text-lg text-brand-text" style={fontBoldStyle}>Welcome, {user?.firstName}</Text>
            <Text className="text-xs text-slate-500" style={fontStyle}>Mentor</Text>
          </View>
        </View>
        <Pressable onPress={signOut} className="rounded-lg bg-brand-primary px-4 py-2">
          <Text className="text-white text-xs" style={fontBoldStyle}>Sign out</Text>
        </Pressable>
      </View>

      <ServicesCard services={services} />

      {user && <AvailabilityCard initialSlots={user.manualAvailabilitySlots ?? []} />}

      {loading ? (
        <ActivityIndicator color="#007CA6" className="mt-4" />
      ) : (
        <UpcomingSessionsList sessions={sessions} onRefresh={loadSessions} />
      )}
    </Screen>
  );
}
