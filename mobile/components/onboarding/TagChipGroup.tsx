import { View, Text, Pressable } from 'react-native';

type Tag = { id: string; label: string; description?: string };

type Props = {
  tags: Tag[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function TagChipGroup({ tags, value, onChange }: Props) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <View className="gap-2">
      {tags.map((tag) => {
        const selected = value.includes(tag.id);
        return (
          <Pressable
            key={tag.id}
            onPress={() => toggle(tag.id)}
            className={`rounded-lg border px-4 py-3 ${
              selected ? 'bg-brand-button border-brand-button' : 'bg-white border-brand-border'
            }`}
          >
            <Text
              style={{ fontFamily: 'Kollektif-Bold' }}
              className={selected ? 'text-white' : 'text-brand-text'}
            >
              {tag.label}
            </Text>
            {tag.description ? (
              <Text
                style={{ fontFamily: 'Kollektif' }}
                className={selected ? 'text-white/80 text-xs mt-0.5' : 'text-brand-muted text-xs mt-0.5'}
              >
                {tag.description}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
