import { View, Text, Image, Pressable, Linking } from 'react-native';
import { router } from 'expo-router';
import { CompatibilityRing } from './CompatibilityRing';
import { resolveUploadUrl } from '../../lib/upload-url';
import { setPendingBooking } from '../../lib/booking-handoff';
import { cardShadow } from '../../constants/theme';
import type { MatchedMentor } from '../../lib/matches-api';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

export function MentorMatchCard({ mentor, recommended }: Props) {
  const name = `${mentor.firstName} ${mentor.lastName}`;
  const initial = mentor.firstName?.[0]?.toUpperCase() ?? '?';
  const title = [mentor.mentorProfile?.jobTitle, mentor.mentorProfile?.employer].filter(Boolean).join(' at ');
  const education = [mentor.majors?.[0], mentor.university].filter(Boolean).join(' from ');
  const topics = mentor.mentorProfile?.volunteeringFor ?? [];
  const avatarUrl = resolveUploadUrl(mentor.profilePicture);

  const handleSchedule = () => {
    setPendingBooking({
      mentorId: mentor._id,
      mentorName: name,
      mentorAvailability: mentor.manualAvailabilitySlots ?? [],
    });
    router.push('/mentee/schedule');
  };

  const handleLinkedIn = () => {
    if (mentor.linkedinUrl) Linking.openURL(mentor.linkedinUrl);
  };

  return (
    <View className="bg-white rounded-xl p-4 border border-brand-cardBorder gap-3" style={cardShadow}>
      <View className="flex-row items-center gap-3">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="w-14 h-14 rounded-full" />
        ) : (
          <View className="w-14 h-14 rounded-full bg-brand-button items-center justify-center">
            <Text className="text-white text-xl" style={fontBoldStyle}>{initial}</Text>
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-brand-text text-base" style={fontBoldStyle}>{name}</Text>
            {recommended && (
              <View className="bg-brand-accent/20 rounded-full px-2 py-0.5">
                <Text className="text-brand-text text-xs" style={fontBoldStyle}>★ Recommended</Text>
              </View>
            )}
          </View>
          {title ? <Text className="text-sm text-brand-text" style={fontStyle}>{title}</Text> : null}
          {education ? <Text className="text-sm text-brand-text" style={fontStyle}>({education})</Text> : null}
        </View>
        {typeof mentor.compatibilityScore === 'number' && (
          <View className="items-center gap-1">
            <CompatibilityRing score={mentor.compatibilityScore} />
            <Text className="text-[10px] text-brand-text" style={fontStyle}>Match</Text>
          </View>
        )}
      </View>

      {topics.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {topics.map((topic) => (
            <View key={topic} className="flex-row items-center gap-1.5 bg-brand-accent/15 rounded-full px-2.5 py-1">
              <View className="w-2 h-2 rounded-full bg-brand-accent" />
              <Text className="text-brand-text text-xs" style={fontBoldStyle}>{topic}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row items-center justify-between">
        {mentor.linkedinUrl ? (
          <Pressable onPress={handleLinkedIn}>
            <Text className="text-brand-dark underline text-sm" style={fontStyle}>LinkedIn</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable onPress={handleSchedule} className="bg-brand-dark rounded-lg px-5 py-2">
          <Text className="text-white text-sm" style={fontBoldStyle}>Schedule Meeting</Text>
        </Pressable>
      </View>
    </View>
  );
}

type Props = {
  mentor: MatchedMentor;
  recommended?: boolean;
};
