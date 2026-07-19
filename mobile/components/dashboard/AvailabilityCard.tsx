import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AvailabilityGrid } from '../onboarding/AvailabilityGrid';
import { updateMentorAvailability, type AvailabilitySlot } from '../../lib/onboarding-api';
import { cardShadow } from '../../constants/theme';

type Props = {
  initialSlots: AvailabilitySlot[];
};

// Port of MentorAvailabilityCard.jsx: editable weekly grid + submit via
// PATCH /api/mentors/me. Intentionally skips the web version's live
// booked-session overlay (see plan) — Upcoming Sessions on the same screen
// already surfaces booked sessions in text form.
export function AvailabilityCard({ initialSlots }: Props) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (next: AvailabilitySlot[]) => {
    setSlots(next);
    setSaved(false);
  };

  const handleSubmit = async () => {
    if (slots.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await updateMentorAvailability(slots);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl p-5 border border-brand-cardBorder" style={cardShadow}>
      <Text className="text-base font-bold text-brand-text">Mentoring Hours</Text>
      <Text className="text-xs text-slate-500 mt-0.5 mb-4">
        Tap cells to set when you're available.
      </Text>

      <View className="rounded-xl bg-[#8ACBDB]/25 p-3">
        <AvailabilityGrid onChange={handleChange} initialSlots={initialSlots} />
      </View>

      {error ? <Text className="text-brand-error text-xs mt-3">{error}</Text> : null}

      <View className="mt-4 flex-row items-center justify-between gap-3">
        <Text className="text-xs text-slate-500">
          {slots.length > 0 ? `${slots.length} hour${slots.length === 1 ? '' : 's'} selected` : 'No hours selected yet'}
        </Text>
        <Pressable
          onPress={handleSubmit}
          disabled={slots.length === 0 || submitting}
          className="bg-brand-accent rounded-lg px-5 py-2.5 disabled:opacity-40"
        >
          <Text className="text-brand-text font-bold text-sm">
            {submitting ? 'Saving...' : saved ? '✓ Hours Submitted' : 'Submit New Hours'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
