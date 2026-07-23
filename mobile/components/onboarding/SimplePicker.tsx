import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, Animated, StyleSheet } from 'react-native';

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function SimplePicker({ label, placeholder = 'Select...', value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
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

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm text-brand-text" style={{ fontFamily: 'Kollektif-Bold' }}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        className="h-[56px] bg-white rounded-lg px-4 justify-center border border-brand-border"
      >
        <Text
          style={{ fontFamily: 'Kollektif' }}
          className={value ? 'text-brand-text text-base' : 'text-brand-placeholder text-base'}
        >
          {value || placeholder}
        </Text>
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
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      handleClose();
                    }}
                    className={`px-5 py-3.5 border-b border-slate-100 ${item === value ? 'bg-brand-primary/10' : ''}`}
                  >
                    <Text className="text-base text-brand-text" style={{ fontFamily: item === value ? 'Kollektif-Bold' : 'Kollektif' }}>
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
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
    maxHeight: 520,
    paddingBottom: 40,
    width: '100%',
  },
});
