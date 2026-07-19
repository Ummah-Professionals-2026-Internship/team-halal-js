import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import type { AvailabilitySlot } from '../../lib/onboarding-api';
import { cardShadow } from '../../constants/theme';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const TIMES = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM',
  '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM',
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function to24Hour(time: string): number {
  const [hourStr, period] = time.split(' ');
  let hour = parseInt(hourStr, 10);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour;
}

type Props = {
  mentorAvailability: AvailabilitySlot[];
  unavailableDateSlotIds: Set<string>;
  selectedSlot: string | null;
  onSelect: (dateSlotId: string) => void;
};

// Booking-mode grid: single-select over real calendar dates, distinct from
// onboarding's AvailabilityGrid (multi-select over an abstract weekly
// template). Deliberately does not port web's 12-week auto-advance / auto-
// select-first-slot behavior — see plan. Cell states are collapsed to
// unavailable/available/selected rather than web's 5 distinct states.
export function BookingAvailabilityGrid({
  mentorAvailability,
  unavailableDateSlotIds,
  selectedSlot,
  onSelect,
}: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const recurringSet = useMemo(
    () => new Set(mentorAvailability.map((s) => `${s.day}-${s.startTime}`)),
    [mentorAvailability]
  );

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  const weekLabel = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startMonth = MONTHS[weekStart.getMonth()];
    const endMonth = MONTHS[weekEnd.getMonth()];
    return startMonth === endMonth
      ? `Week of ${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.getFullYear()}`
      : `Week of ${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()} ${weekEnd.getFullYear()}`;
  }, [weekStart]);

  const now = Date.now();
  const beyond48h = now + 48 * 60 * 60 * 1000;

  const cellState = (dayIdx: number, time: string): 'unavailable' | 'available' | 'selected' => {
    const day = DAYS[dayIdx];
    const recurringId = `${day}-${time}`;
    const dateSlotId = `${isoDate(weekDates[dayIdx])}-${time}`;

    if (selectedSlot === dateSlotId) return 'selected';

    const slotDate = new Date(weekDates[dayIdx]);
    slotDate.setHours(to24Hour(time), 0, 0, 0);

    const canSelect =
      slotDate.getTime() > beyond48h &&
      recurringSet.has(recurringId) &&
      !unavailableDateSlotIds.has(dateSlotId);

    return canSelect ? 'available' : 'unavailable';
  };

  const hasAvailableThisWeek = useMemo(() => {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      for (const time of TIMES) {
        if (cellState(dayIdx, time) !== 'unavailable') return true;
      }
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDates, recurringSet, unavailableDateSlotIds, selectedSlot]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  return (
    <View className="bg-white rounded-xl p-2 border border-brand-cardBorder" style={cardShadow}>
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-xs text-slate-500">{weekLabel}</Text>
        <View className="flex-row gap-3">
          <Pressable onPress={prevWeek} hitSlop={8}>
            <Text className="text-brand-primary text-base font-bold">‹</Text>
          </Pressable>
          <Pressable onPress={nextWeek} hitSlop={8}>
            <Text className="text-brand-primary text-base font-bold">›</Text>
          </Pressable>
        </View>
      </View>

      {!hasAvailableThisWeek && (
        <Text className="text-center text-xs text-slate-500 mb-2">
          No available times this week — try Next Week
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row">
            <View className="w-[56px]" />
            {DAYS.map((day, i) => (
              <View key={day} className="w-[40px] items-center py-1">
                <Text className="text-[10px] text-slate-400">{weekDates[i].getDate()}</Text>
                <Text className="text-xs font-semibold text-brand-text">{day}</Text>
              </View>
            ))}
          </View>
          {TIMES.map((time) => (
            <View key={time} className="flex-row items-center">
              <View className="w-[56px] justify-center">
                <Text className="text-xs text-brand-muted">{time}</Text>
              </View>
              {DAYS.map((day, dayIdx) => {
                const state = cellState(dayIdx, time);
                const dateSlotId = `${isoDate(weekDates[dayIdx])}-${time}`;
                return (
                  <Pressable
                    key={day}
                    disabled={state === 'unavailable'}
                    onPress={() => onSelect(dateSlotId)}
                    className={`w-[40px] h-[32px] m-[1px] rounded ${
                      state === 'selected'
                        ? 'bg-brand-button'
                        : state === 'available'
                        ? 'bg-[#8fd19e]'
                        : 'bg-[#eef1f2]'
                    }`}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row justify-center gap-4 mt-2">
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-[#8fd19e]" />
          <Text className="text-[10px] text-slate-500">Available</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-brand-button" />
          <Text className="text-[10px] text-slate-500">Selected</Text>
        </View>
      </View>
    </View>
  );
}
