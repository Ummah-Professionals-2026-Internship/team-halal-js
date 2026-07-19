import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, FlatList, type GestureResponderEvent } from 'react-native';

type SingleProps = {
  label: string;
  placeholder?: string;
  options: string[];
  isMulti?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiProps = {
  label: string;
  placeholder?: string;
  options: string[];
  isMulti: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type Props = SingleProps | MultiProps;

export function SearchableSelectField(props: Props) {
  const { label, placeholder = 'Search...', options } = props;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase())).slice(0, 100),
    [options, search]
  );

  const selectedValues = props.isMulti ? props.value : props.value ? [props.value] : [];

  const handleSelect = (option: string) => {
    if (props.isMulti) {
      if (!props.value.includes(option)) {
        props.onChange([...props.value, option]);
      }
      setSearch('');
    } else {
      props.onChange(option);
      setOpen(false);
    }
  };

  const handleRemove = (option: string) => {
    if (props.isMulti) {
      props.onChange(props.value.filter((v) => v !== option));
    }
  };

  const stopPropagation = (e: GestureResponderEvent) => e.stopPropagation();

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className="min-h-[56px] bg-white rounded-lg px-4 justify-center border border-brand-border py-2"
      >
        {selectedValues.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {selectedValues.map((val) => (
              <View key={val} className="flex-row items-center bg-slate-100 rounded-full px-2.5 py-1 gap-1">
                <Text className="text-xs text-slate-700">{val}</Text>
                {props.isMulti && (
                  <Pressable onPress={() => handleRemove(val)} hitSlop={8}>
                    <Text className="text-slate-400 font-bold">×</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-brand-placeholder text-base">{placeholder}</Text>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
          <Pressable className="bg-white rounded-t-2xl max-h-[80%]" onPress={stopPropagation}>
            <Text className="text-lg font-bold text-center py-4 border-b border-slate-200">{label}</Text>
            <TextInput
              placeholder="Type to search..."
              value={search}
              onChangeText={setSearch}
              autoFocus
              className="mx-4 my-3 h-[44px] bg-slate-100 rounded-lg px-3 text-base"
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => {
                const isSelected = selectedValues.includes(item);
                return (
                  <Pressable
                    onPress={() => !isSelected && handleSelect(item)}
                    className={`px-5 py-3 border-b border-slate-100 ${isSelected ? 'bg-brand-primary/10' : ''}`}
                  >
                    <Text className="text-base text-brand-text">
                      {item} {isSelected ? '(selected)' : ''}
                    </Text>
                  </Pressable>
                );
              }}
            />
            {props.isMulti && (
              <Pressable
                onPress={() => setOpen(false)}
                className="m-4 h-[48px] bg-brand-button rounded-lg items-center justify-center"
              >
                <Text className="text-white font-semibold">Done</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
