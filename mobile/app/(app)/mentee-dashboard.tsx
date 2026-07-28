import { useCallback, useEffect, useState } from 'react';
import { View, Image, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/AppText';
import { useSession } from '../../lib/session-context';
import { getMatchSuggestions, type MatchedMentor } from '../../lib/matches-api';
import { getMenteeSessions, type Session } from '../../lib/sessions-api';
import { resolveUploadUrl } from '../../lib/upload-url';
import { Screen } from '../../components/Screen';
import { MentorMatchCard } from '../../components/dashboard/MentorMatchCard';
import { UpcomingSessionsList } from '../../components/dashboard/UpcomingSessionsList';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function MenteeDashboard() {
  const { user, signOut } = useSession();
  const [mentors, setMentors] = useState<MatchedMentor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setError('');
    const [matchesResult, sessionsResult] = await Promise.allSettled([
      getMatchSuggestions(),
      getMenteeSessions(),
    ]);
    if (matchesResult.status === 'fulfilled') {
      setMentors(matchesResult.value);
    } else {
      setError(matchesResult.reason instanceof Error ? matchesResult.reason.message : 'Failed to load match suggestions');
    }
    if (sessionsResult.status === 'fulfilled') {
      setSessions(sessionsResult.value);
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
  const [recommended, ...moreMentors] = mentors;

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
            onPress={() => router.push('/mentee/profile-settings')}
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

      {loading ? (
        <ActivityIndicator color="#007CA6" className="mt-6" />
      ) : (
        <>
          <UpcomingSessionsList sessions={sessions} onRefresh={loadDashboard} />

          <View>
            <Text className="text-base text-brand-text mb-3" style={fontBoldStyle}>Your Mentor Matches</Text>
            {error ? (
              <Text className="text-brand-error text-center mt-2" style={fontStyle}>{error}</Text>
            ) : mentors.length === 0 ? (
              <View className="bg-white rounded-2xl border border-dashed border-brand-cardBorder p-6 items-center">
                <Text className="text-slate-500 text-center" style={fontStyle}>
                  No mentor matches yet — check back soon as more mentors join.
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                <View>
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                    <Text className="text-xs text-slate-500" style={fontStyle}>Recommended for you</Text>
                  </View>
                  <MentorMatchCard mentor={recommended} recommended />
                </View>

                {moreMentors.length > 0 && (
                  <View>
                    <Text className="text-xs text-slate-500 mb-2" style={fontStyle}>More Mentors</Text>
                    <View className="gap-3">
                      {moreMentors.map((mentor) => (
                        <MentorMatchCard key={mentor._id} mentor={mentor} />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}
