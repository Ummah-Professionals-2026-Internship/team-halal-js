import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, FlatList, Animated, StyleSheet } from 'react-native';

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
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (open) {
      slideAnim.setValue(600);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [open, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
    });
  };

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
      handleClose();
    }
  };

  const handleRemove = (option: string) => {
    if (props.isMulti) {
      props.onChange(props.value.filter((v) => v !== option));
    }
  };

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm text-brand-text" style={{ fontFamily: 'Kollektif-Bold' }}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        className="min-h-[56px] bg-white rounded-lg px-4 justify-center border border-brand-border py-2"
      >
        {selectedValues.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {selectedValues.map((val) => (
              <View key={val} className="flex-row items-center bg-slate-100 rounded-full px-2.5 py-1 gap-1">
                <Text className="text-xs text-slate-700" style={{ fontFamily: 'Kollektif' }}>{val}</Text>
                {props.isMulti && (
                  <Pressable onPress={() => handleRemove(val)} hitSlop={8}>
                    <Text className="text-slate-400 font-bold">×</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-brand-placeholder text-base" style={{ fontFamily: 'Kollektif' }}>{placeholder}</Text>
        )}
      </Pressable>

      <Modal visible={open} transparent statusBarTranslucent animationType="fade" onRequestClose={handleClose}>
        <View style={StyleSheet.absoluteFillObject}>
          {/* Fullscreen dark backdrop - stays static, fades in */}
          <Pressable style={StyleSheet.absoluteFillObject} className="bg-black/40" onPress={handleClose} />

          {/* Bottom sheet pinned strictly to absolute bottom */}
          <View style={styles.sheetContainer} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.sheetContent,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text className="text-lg text-center py-4 border-b border-slate-200" style={{ fontFamily: 'Kollektif-Bold' }}>
                {label}
              </Text>
              <TextInput
                placeholder="Type to search..."
                value={search}
                onChangeText={setSearch}
                autoFocus
                style={{ fontFamily: 'Kollektif' }}
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
                      className={`px-5 py-3.5 border-b border-slate-100 ${isSelected ? 'bg-brand-primary/10' : ''}`}
                    >
                      <Text
                        className="text-base text-brand-text"
                        style={{ fontFamily: isSelected ? 'Kollektif-Bold' : 'Kollektif' }}
                      >
                        {item} {isSelected ? '(selected)' : ''}
                      </Text>
                    </Pressable>
                  );
                }}
              />
              {props.isMulti && (
                <Pressable
                  onPress={handleClose}
                  className="m-4 h-[48px] bg-brand-button rounded-lg items-center justify-center"
                >
                  <Text className="text-white text-base" style={{ fontFamily: 'Kollektif-Bold' }}>Done</Text>
                </Pressable>
              )}
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 560,
    paddingBottom: 40,
    width: '100%',
  },
});
