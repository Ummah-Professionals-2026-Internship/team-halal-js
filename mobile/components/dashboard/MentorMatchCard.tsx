import { useState } from 'react';
import { View, Image, Pressable, Linking, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { CompatibilityRing } from './CompatibilityRing';
import { resolveUploadUrl } from '../../lib/upload-url';
import { setPendingBooking } from '../../lib/booking-handoff';
import { cardShadow } from '../../constants/theme';
import type { MatchedMentor } from '../../lib/matches-api';

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };

export function MentorMatchCard({ mentor, recommended }: Props) {
  const [showConfidence, setShowConfidence] = useState(false);
  const name = `${mentor.firstName} ${mentor.lastName}`;
  const initial = mentor.firstName?.[0]?.toUpperCase() ?? '?';
  const title = [mentor.mentorProfile?.jobTitle, mentor.mentorProfile?.employer].filter(Boolean).join(' at ');
  const education = [mentor.majors?.[0], mentor.university].filter(Boolean).join(' from ');
  const topics = mentor.mentorProfile?.volunteeringFor ?? [];
  const avatarUrl = resolveUploadUrl(mentor.profilePicture);
  const confidence = mentor.confidence;
  const confidenceColor = confidence?.label === 'high'
    ? '#15803D'
    : confidence?.label === 'medium' ? '#B45309' : '#64748B';

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
            {confidence && (
              <Pressable
                onPress={() => setShowConfidence(true)}
                className="flex-row items-center gap-1"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${confidence.label} confidence. Learn how this recommendation was calculated.`}
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: confidenceColor }} />
                <Text className="text-[10px] capitalize" style={[fontStyle, { color: confidenceColor }]}>
                  {confidence.label} confidence
                </Text>
                <Ionicons name="information-circle-outline" size={12} color={confidenceColor} />
              </Pressable>
            )}
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

      {confidence && (
        <Modal visible={showConfidence} transparent animationType="fade" onRequestClose={() => setShowConfidence(false)}>
          <Pressable
            className="flex-1 bg-black/40 justify-end"
            onPress={() => setShowConfidence(false)}
            accessibilityRole="button"
            accessibilityLabel="Close confidence explanation"
          >
            <Pressable
              className="bg-white rounded-t-3xl px-6 pt-5 pb-8 gap-4"
              onPress={(event) => event.stopPropagation()}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-lg text-brand-text" style={fontBoldStyle}>How reliable is this match?</Text>
                  <Text className="text-sm text-slate-500 mt-1" style={fontStyle}>
                    Compatibility measures how closely you match. Confidence measures how much profile information was available.
                  </Text>
                </View>
                <Pressable onPress={() => setShowConfidence(false)} hitSlop={10} accessibilityLabel="Close">
                  <Ionicons name="close" size={24} color="#00212C" />
                </Pressable>
              </View>

              <View className="rounded-xl bg-slate-50 border border-slate-100 p-4 gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: confidenceColor }} />
                  <Text className="text-brand-text capitalize" style={fontBoldStyle}>
                    {confidence.label} confidence ({confidence.percentage}%)
                  </Text>
                </View>
                <Text className="text-sm text-slate-600" style={fontStyle}>
                  Based on {confidence.evaluatedCriteria.length} of {confidence.evaluatedCriteria.length + confidence.missingCriteria.length} matching areas.
                </Text>
              </View>

              {confidence.evaluatedCriteria.length > 0 && (
                <View className="gap-1.5">
                  <Text className="text-sm text-brand-text" style={fontBoldStyle}>Information evaluated</Text>
                  {confidence.evaluatedCriteria.map((criterion) => (
                    <View key={criterion} className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                      <Text className="text-sm text-slate-600 capitalize" style={fontStyle}>{criterion}</Text>
                    </View>
                  ))}
                </View>
              )}

              {confidence.missingCriteria.length > 0 && (
                <Text className="text-sm text-slate-500" style={fontStyle}>
                  Not evaluated: {confidence.missingCriteria.join(', ')}.
                </Text>
              )}

              {confidence.menteeMissingCriteria.length > 0 && (
                <Pressable
                  onPress={() => {
                    setShowConfidence(false);
                    router.push('/mentee/profile-settings' as never);
                  }}
                  className="bg-brand-dark rounded-lg px-5 py-3 items-center"
                >
                  <Text className="text-white text-sm" style={fontBoldStyle}>Complete My Profile</Text>
                </Pressable>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

type Props = {
  mentor: MatchedMentor;
  recommended?: boolean;
};
