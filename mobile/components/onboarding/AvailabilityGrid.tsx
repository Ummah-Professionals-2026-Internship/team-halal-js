import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import type { AvailabilitySlot } from '../../lib/onboarding-api';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const TIME_SLOTS = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM',
  '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM',
];

function slotId(day: string, time: string) {
  return `${day}-${time}`;
}

function endTimeFor(timeIndex: number) {
  return TIME_SLOTS[timeIndex + 1] ?? '9 PM';
}

type Props = {
  onChange: (slots: AvailabilitySlot[]) => void;
  initialSlots?: AvailabilitySlot[];
};

// Simplified RN port of the web's AvailabilityPick.jsx for onboarding use only
// (no conflicts/booked-session overlay props — onboarding never passes those on
// web either). Tap-to-toggle per cell instead of web's drag-select, a deliberate
// simplification (see plan) rather than a gesture-parity port.
export function AvailabilityGrid({ onChange, initialSlots = [] }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSlots.map((s) => slotId(s.day, s.startTime)))
  );

  const emit = (next: Set<string>) => {
    setSelected(next);
    const slots: AvailabilitySlot[] = Array.from(next).map((id) => {
      const [day, ...rest] = id.split('-');
      const startTime = rest.join('-');
      const timeIndex = TIME_SLOTS.indexOf(startTime);
      return { day, startTime, endTime: endTimeFor(timeIndex) };
    });
    onChange(slots);
  };

  const toggle = (day: string, time: string) => {
    const id = slotId(day, time);
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    emit(next);
  };

  return (
    <View>
      <Text className="text-sm text-brand-muted mb-2">
        Tap a cell to mark yourself available that hour, weekly.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row">
            <View className="w-[56px]" />
            {DAYS.map((day) => (
              <View key={day} className="w-[40px] items-center justify-center py-1">
                <Text className="text-xs font-semibold text-brand-text">{day}</Text>
              </View>
            ))}
          </View>
          {TIME_SLOTS.map((time) => (
            <View key={time} className="flex-row items-center">
              <View className="w-[56px] justify-center">
                <Text className="text-xs text-brand-muted">{time}</Text>
              </View>
              {DAYS.map((day) => {
                const isOn = selected.has(slotId(day, time));
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggle(day, time)}
                    className={`w-[40px] h-[32px] m-[1px] rounded ${isOn ? 'bg-brand-button' : 'bg-[#eef1f2]'}`}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
