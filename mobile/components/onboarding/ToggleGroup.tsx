import { View, Text, Pressable } from 'react-native';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function ToggleGroup<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View className="flex-row gap-3">
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          className={`flex-1 h-[52px] rounded-lg items-center justify-center border ${
            value === opt.value ? 'bg-brand-button border-brand-button' : 'bg-white border-brand-border'
          }`}
        >
          <Text className={value === opt.value ? 'text-white font-semibold' : 'text-brand-text font-semibold'}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
