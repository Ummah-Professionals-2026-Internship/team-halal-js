import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../../../lib/session-context';
import { getPendingBooking, clearPendingBooking } from '../../../lib/booking-handoff';
import { createSession, rescheduleSession } from '../../../lib/sessions-api';
import { parseSlotToISO, formatSlotForDisplay } from '../../../lib/slot-format';
import { Screen } from '../../../components/Screen';

export default function BookingScreen() {
  const { user } = useSession();
  const [booking] = useState(() => getPendingBooking());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking || !booking.selectedSlot) {
      router.replace('/');
    }
  }, [booking]);

  const display = useMemo(
    () => (booking?.selectedSlot ? formatSlotForDisplay(booking.selectedSlot) : null),
    [booking]
  );

  if (!booking || !booking.selectedSlot) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const scheduledTime = parseSlotToISO(booking.selectedSlot!);
      if (booking.rescheduleSessionId) {
        await rescheduleSession(booking.rescheduleSessionId, {
          scheduledTime,
          service: 'mentorship program',
          details: note,
        });
      } else {
        await createSession({
          mentorId: booking.mentorId,
          scheduledTime,
          service: 'mentorship program',
          details: note,
        });
      }
      clearPendingBooking();
      router.replace(user?.role === 'mentor' ? '/mentor-dashboard' : '/mentee-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule the session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text className="text-xl font-bold text-brand-text text-center">
        {booking.rescheduleSessionId ? 'Confirm Reschedule' : 'Confirm Booking'}
      </Text>

      <View className="bg-[#C5DCE8] rounded-2xl p-6 gap-4">
        <Text className="text-brand-text">
          {booking.rescheduleSessionId
            ? `You're about to reschedule your session with ${booking.mentorName} to`
            : `You're about to schedule a mentorship session with ${booking.mentorName} on`}
        </Text>

        {display ? (
          <Text className="font-bold text-brand-text text-lg">
            {display.day} {display.time} - {display.endTime}
          </Text>
        ) : (
          <Text className="font-bold text-brand-text text-lg">— time to be confirmed —</Text>
        )}

        <Text className="text-sm text-brand-text">
          Your mentor will be notified that a session is scheduled. You will both get a reminder
          before the session begins.
        </Text>

        <Text className="font-semibold text-brand-text text-sm">Additional Info (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          editable={!loading}
          multiline
          numberOfLines={4}
          placeholder="Share any questions or context for your mentor..."
          placeholderTextColor="#5a6b73"
          className="bg-white rounded-lg p-3 text-sm text-brand-text min-h-[100px]"
          textAlignVertical="top"
        />

        {error ? <Text className="text-red-700 font-semibold text-xs">{error}</Text> : null}

        <Pressable
          onPress={handleConfirm}
          disabled={loading}
          className="h-[48px] bg-brand-accent rounded-lg items-center justify-center disabled:opacity-40"
        >
          <Text className="text-brand-text font-bold text-sm">
            {loading ? 'Booking Session...' : 'Confirm'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
