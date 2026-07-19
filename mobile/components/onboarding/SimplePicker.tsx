import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function SimplePicker({ label, placeholder = 'Select...', value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-[56px] bg-white rounded-lg px-4 justify-center border border-brand-border"
      >
        <Text className={value ? 'text-brand-text text-base' : 'text-brand-placeholder text-base'}>
          {value || placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
          <View className="bg-white rounded-t-2xl max-h-[70%]">
            <Text className="text-lg font-bold text-center py-4 border-b border-slate-200">{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  className={`px-5 py-3 border-b border-slate-100 ${item === value ? 'bg-brand-primary/10' : ''}`}
                >
                  <Text className="text-base text-brand-text">{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
