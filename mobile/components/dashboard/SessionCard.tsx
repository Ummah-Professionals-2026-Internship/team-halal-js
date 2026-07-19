import { useState } from 'react';
import { View, Text, Image, Pressable, Modal, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { cancelSession, type Session } from '../../lib/sessions-api';
import { resolveUploadUrl } from '../../lib/upload-url';
import { setPendingBooking } from '../../lib/booking-handoff';
import { useSession } from '../../lib/session-context';
import { cardShadow } from '../../constants/theme';

function formatCountdown(daysUntil: number) {
  if (daysUntil <= 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  return `In ${daysUntil} days`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

type Props = {
  session: Session;
  onCancelled: () => void;
};

// Port of web's SessionCard.jsx. Rendered on the mentor dashboard only, so
// the current user viewing this card is always the mentor and `mentee` is
// always the other party.
//
// Layout note: the 4 actions (Reschedule/Cancel/View Details/Join Meeting)
// used to sit in one non-wrapping row, which reliably overflowed on narrow
// phones. Now split into a wrapping row of the 3 secondary text actions plus
// a full-width Join Meeting button below — fixes the overflow and gives Join
// Meeting proper visual weight as the actual primary action on the card.
export function SessionCard({ session, onCancelled }: Props) {
  const { user } = useSession();
  const { _id: sessionId, mentee, scheduledTime, link, status, service, details } = session;
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const name = `${mentee?.firstName ?? ''} ${mentee?.lastName ?? ''}`.trim();
  const initial = mentee?.firstName?.[0]?.toUpperCase() ?? '?';
  const avatarUrl = resolveUploadUrl(mentee?.profilePicture);

  const when = new Date(scheduledTime);
  const dateStr = when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const daysUntil = Math.round((startOfDay(when).getTime() - startOfDay(new Date()).getTime()) / 86400000);

  const beyond48hrs = when.getTime() > Date.now() + 48 * 60 * 60 * 1000;
  const canCancel = status === 'scheduled' && beyond48hrs;

  const handleCancel = () => {
    if (!canCancel) return;
    Alert.alert(
      'Cancel session?',
      'Are you sure you want to cancel this scheduled session? This will notify the other participant.',
      [
        { text: 'Keep session', style: 'cancel' },
        {
          text: 'Cancel session',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelSession(sessionId);
              Alert.alert('Cancelled', 'Session successfully cancelled.');
              onCancelled();
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel session.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleJoin = () => {
    if (link) Linking.openURL(link);
  };

  const handleReschedule = () => {
    if (!canCancel || !user) return; // same 48h gate as cancel
    setPendingBooking({
      mentorId: user._id,
      mentorName: name, // the mentee's name, for the schedule screen's title
      mentorAvailability: user.manualAvailabilitySlots ?? [],
      rescheduleSessionId: sessionId,
    });
    router.push('/mentee/schedule');
  };

  return (
    <View className="bg-white rounded-xl border border-brand-cardBorder p-4 mb-3" style={cardShadow}>
      <View className="flex-row items-start justify-between gap-3 mb-3">
        <View className="flex-row items-center gap-3 flex-1">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-11 h-11 rounded-full" />
          ) : (
            <View className="w-11 h-11 rounded-full bg-brand-dark items-center justify-center">
              <Text className="text-white font-bold">{initial}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-bold text-brand-text text-sm" numberOfLines={1}>{name}</Text>
            {service ? <Text className="text-xs text-slate-500 capitalize mt-0.5">{service}</Text> : null}
          </View>
        </View>
        <View className="items-end">
          <View className="bg-brand-accent rounded-full px-2.5 py-1">
            <Text className="text-brand-text text-[11px] font-bold">{formatCountdown(daysUntil)}</Text>
          </View>
          <Text className="text-xs text-slate-500 mt-1.5">{dateStr}</Text>
          <Text className="text-xs text-slate-500">{timeStr}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2 pt-3 border-t border-brand-cardBorder">
        <Pressable
          onPress={handleReschedule}
          disabled={!canCancel}
          className={`px-3 py-1.5 rounded-lg border ${canCancel ? 'border-slate-200' : 'border-slate-100'}`}
        >
          <Text className={`text-xs font-semibold ${canCancel ? 'text-slate-600' : 'text-slate-300'}`}>
            Reschedule
          </Text>
        </Pressable>
        <Pressable
          onPress={handleCancel}
          disabled={!canCancel || cancelling}
          className={`px-3 py-1.5 rounded-lg border ${
            canCancel && !cancelling ? 'border-red-200' : 'border-red-100'
          }`}
        >
          <Text className={`text-xs font-semibold ${canCancel && !cancelling ? 'text-red-600' : 'text-red-300'}`}>
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </Text>
        </Pressable>
        <Pressable onPress={() => setShowModal(true)} className="px-3 py-1.5 rounded-lg border border-slate-200">
          <Text className="text-xs font-semibold text-slate-600">View Details</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleJoin}
        disabled={!link}
        className={`mt-2 h-[40px] rounded-lg items-center justify-center ${link ? 'bg-brand-accent' : 'bg-slate-100'}`}
      >
        <Text className={`text-sm font-bold ${link ? 'text-brand-text' : 'text-slate-400'}`}>
          {link ? 'Join Meeting' : 'No link yet'}
        </Text>
      </Pressable>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md gap-4">
            <View className="flex-row justify-between items-center border-b border-slate-100 pb-2">
              <Text className="text-base font-bold text-brand-text">Session Details</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Text className="text-slate-400 text-xl font-bold">×</Text>
              </Pressable>
            </View>

            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase">Participant</Text>
              <View className="flex-row items-center gap-2.5 mt-1.5">
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} className="w-9 h-9 rounded-full" />
                ) : (
                  <View className="w-9 h-9 rounded-full bg-brand-dark items-center justify-center">
                    <Text className="text-white font-bold text-xs">{initial}</Text>
                  </View>
                )}
                <View>
                  <Text className="font-semibold text-slate-900 text-xs">{name}</Text>
                  <Text className="text-[11px] text-slate-500">{mentee?.email || 'No email provided'}</Text>
                </View>
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase">Service Type</Text>
              <Text className="font-semibold text-slate-900 mt-1 capitalize text-xs">
                {service || 'Mentorship Program'}
              </Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Date</Text>
                <Text className="font-semibold text-slate-900 mt-1 text-xs">{dateStr}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Time</Text>
                <Text className="font-semibold text-slate-900 mt-1 text-xs">{timeStr}</Text>
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase">Meeting Link</Text>
              {link ? (
                <Pressable onPress={handleJoin}>
                  <Text className="text-brand-primary font-semibold underline text-xs mt-1">{link}</Text>
                </Pressable>
              ) : (
                <Text className="text-slate-400 mt-1 text-xs">No link available yet</Text>
              )}
            </View>

            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase">Session Notes</Text>
              <Text className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs italic mt-1.5 text-slate-600">
                {details ? `"${details}"` : 'No additional notes provided.'}
              </Text>
            </View>

            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase">Status</Text>
              <View
                className={`self-start rounded-full px-2.5 py-0.5 mt-1.5 ${
                  status === 'scheduled' ? 'bg-emerald-100' : status === 'completed' ? 'bg-blue-100' : 'bg-slate-100'
                }`}
              >
                <Text
                  className={`text-[10px] font-bold capitalize ${
                    status === 'scheduled'
                      ? 'text-emerald-800'
                      : status === 'completed'
                      ? 'text-blue-800'
                      : 'text-slate-800'
                  }`}
                >
                  {status}
                </Text>
              </View>
            </View>

            <Pressable onPress={() => setShowModal(false)} className="bg-brand-dark rounded-lg px-4 py-2 self-end">
              <Text className="text-white font-semibold text-xs">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
