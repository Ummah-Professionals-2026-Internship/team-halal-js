import { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useSession } from '../../lib/session-context';
import { getMatchSuggestions, type MatchedMentor } from '../../lib/matches-api';
import { resolveUploadUrl } from '../../lib/upload-url';
import { Screen } from '../../components/Screen';
import { MentorMatchCard } from '../../components/dashboard/MentorMatchCard';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

export default function MenteeDashboard() {
  const { user, signOut } = useSession();
  const [mentors, setMentors] = useState<MatchedMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = useCallback(async () => {
    setError('');
    try {
      const data = await getMatchSuggestions();
      setMentors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load match suggestions');
    }
  }, []);

  useEffect(() => {
    loadMatches().finally(() => setLoading(false));
  }, [loadMatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const avatarUrl = resolveUploadUrl(user?.profilePicture);
  const [recommended, ...moreMentors] = mentors;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-300" />
          )}
          <View>
            <Text className="text-lg text-brand-text" style={fontBoldStyle}>Welcome, {user?.firstName}</Text>
            <Text className="text-xs text-slate-500" style={fontStyle}>Mentee</Text>
          </View>
        </View>
        <Pressable onPress={signOut} className="rounded-lg bg-brand-primary px-4 py-2">
          <Text className="text-white text-xs" style={fontBoldStyle}>Sign out</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#007CA6" className="mt-6" />
      ) : error ? (
        <Text className="text-brand-error text-center mt-4" style={fontStyle}>{error}</Text>
      ) : mentors.length === 0 ? (
        <Text className="text-slate-500 text-center mt-4" style={fontStyle}>
          No mentor matches yet — check back soon as more mentors join.
        </Text>
      ) : (
        <>
          <Text className="text-base text-brand-text" style={fontBoldStyle}>Recommended Mentor</Text>
          <MentorMatchCard mentor={recommended} recommended />

          {moreMentors.length > 0 && (
            <>
              <Text className="text-base text-brand-text mt-2" style={fontBoldStyle}>More Mentors</Text>
              <View className="gap-3">
                {moreMentors.map((mentor) => (
                  <MentorMatchCard key={mentor._id} mentor={mentor} />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
