import { View, Text } from 'react-native';
import { SessionCard } from './SessionCard';
import { cardShadow } from '../../constants/theme';
import type { Session } from '../../lib/sessions-api';

type Props = {
  sessions: Session[];
  onRefresh: () => void;
};

// Port of UpcomingSessions.jsx — splits scheduled/completed, renders
// SessionCard list with empty states.
export function UpcomingSessionsList({ sessions, onRefresh }: Props) {
  const upcoming = sessions.filter((s) => s.status === 'scheduled');
  const completed = sessions.filter((s) => s.status === 'completed');

  return (
    <View className="bg-white rounded-2xl p-5 border border-brand-cardBorder" style={cardShadow}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-brand-text">Upcoming Sessions</Text>
        <View className="bg-brand-accent/15 rounded-full px-3 py-1">
          <Text className="text-xs font-bold text-brand-text">{upcoming.length}</Text>
        </View>
      </View>

      {upcoming.length === 0 ? (
        <Text className="text-xs text-slate-500 mb-2">No upcoming sessions scheduled yet.</Text>
      ) : (
        upcoming.map((session) => (
          <SessionCard key={session._id} session={session} onCancelled={onRefresh} />
        ))
      )}

      {completed.length > 0 && (
        <>
          <Text className="text-base font-bold text-brand-text mt-4 mb-4">
            Completed ({completed.length})
          </Text>
          {completed.map((session) => (
            <SessionCard key={session._id} session={session} onCancelled={onRefresh} />
          ))}
        </>
      )}
    </View>
  );
}
