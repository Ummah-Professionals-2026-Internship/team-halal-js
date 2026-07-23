import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MENTOR_SERVICES } from '../../constants/services';
import { cardShadow } from '../../constants/theme';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  heart: 'heart-outline',
  users: 'people-outline',
  document: 'document-text-outline',
  chat: 'chatbubble-outline',
  bulb: 'bulb-outline',
};

type Props = {
  services?: string[];
};

export function ServicesCard({ services = [] }: Props) {
  const hasSelection = services.length > 0;

  return (
    <View className="bg-white rounded-2xl p-5 border border-brand-cardBorder" style={cardShadow}>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-brand-text">
            {hasSelection ? 'Services You Offer' : 'Services You Can Offer'}
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {hasSelection
              ? 'The services mentees can request from you.'
              : 'Select services during setup to start matching with mentees.'}
          </Text>
        </View>
        <View className="rounded-full bg-brand-accent/15 px-3 py-1">
          <Text className="text-xs font-bold text-brand-text">
            {services.length} / {MENTOR_SERVICES.length}
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {MENTOR_SERVICES.map((service) => {
          const isOffered = hasSelection && services.includes(service.id);
          return (
            <View
              key={service.id}
              className={`rounded-xl border p-3.5 ${
                isOffered ? 'border-brand-accent bg-brand-accent/10' : 'border-slate-200 bg-white'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    isOffered ? 'bg-brand-accent' : 'bg-brand-dark/10'
                  }`}
                >
                  <Ionicons
                    name={ICONS[service.icon] ?? 'ellipse-outline'}
                    size={20}
                    color={isOffered ? '#00212C' : '#003F55'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-brand-text">{service.label}</Text>
                  <Text className="text-[11px] text-slate-500 mt-0.5">{service.description}</Text>
                </View>
                {isOffered && (
                  <View className="rounded-full bg-brand-accent px-2 py-0.5">
                    <Text className="text-[9px] font-bold uppercase text-brand-text">Offering</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
