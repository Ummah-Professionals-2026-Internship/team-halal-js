import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../../../lib/session-context';
import { getPendingBooking, setPendingBooking } from '../../../lib/booking-handoff';
import { getSessions, getMenteeSessions, getMentorBookedSlots } from '../../../lib/sessions-api';
import { toDateSlotId, formatSlotForDisplay } from '../../../lib/slot-format';
import { BookingAvailabilityGrid } from '../../../components/booking/BookingAvailabilityGrid';
import { Screen } from '../../../components/Screen';

export default function ScheduleScreen() {
  const { user } = useSession();
  const [booking] = useState(() => getPendingBooking());
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!booking) {
      router.replace('/');
    }
  }, [booking]);

  useEffect(() => {
    if (!booking || !user) return;
    (async () => {
      try {
        const [ownSessions, bookedSlots] = await Promise.all([
          user.role === 'mentor' ? getSessions() : getMenteeSessions(),
          getMentorBookedSlots(booking.mentorId),
        ]);
        const ids = new Set<string>();
        for (const s of ownSessions) {
          if (s.status === 'scheduled') ids.add(toDateSlotId(s.scheduledTime));
        }
        for (const b of bookedSlots) {
          ids.add(toDateSlotId(b.scheduledTime));
        }
        setUnavailable(ids);
      } catch {
        // Non-fatal — grid just shows all recurring-template slots as
        // available if the busy-slot fetch fails; server still enforces
        // duplicate-booking rejection on submit either way.
      } finally {
        setLoading(false);
      }
    })();
  }, [booking, user]);

  const display = useMemo(() => (selectedSlot ? formatSlotForDisplay(selectedSlot) : null), [selectedSlot]);

  if (!booking) return null;

  const handleConfirm = () => {
    if (!selectedSlot) return;
    setPendingBooking({ ...booking, selectedSlot });
    router.push('/mentee/booking');
  };

  return (
    <Screen keyboardAvoiding={false}>
      <Text className="text-xl font-bold text-brand-text">
        {booking.rescheduleSessionId
          ? `Reschedule Your Session With ${booking.mentorName}`
          : `Schedule a Session With ${booking.mentorName}`}
      </Text>

      {loading ? (
        <ActivityIndicator color="#007CA6" className="mt-6" />
      ) : (
        <BookingAvailabilityGrid
          mentorAvailability={booking.mentorAvailability}
          unavailableDateSlotIds={unavailable}
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
        />
      )}

      <View className="items-center bg-white rounded-xl p-4 shadow-sm">
        <Text className="font-bold text-brand-text text-sm mb-2">Selected Meeting Time</Text>
        {display ? (
          <Text className="font-bold text-brand-text text-base text-center">
            {display.day}{'\n'}
            {display.time} - {display.endTime}
          </Text>
        ) : (
          <Text className="text-slate-400 text-sm">Tap an available slot above</Text>
        )}
      </View>

      <Pressable
        onPress={handleConfirm}
        disabled={!selectedSlot}
        className="h-[52px] bg-brand-accent rounded-lg items-center justify-center disabled:opacity-40"
      >
        <Text className="text-brand-text font-bold text-sm">Confirm Booking</Text>
      </Pressable>
    </Screen>
  );
}
