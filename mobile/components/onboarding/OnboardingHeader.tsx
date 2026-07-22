import { View, Text, Pressable, Alert } from 'react-native';
import { useSession } from '../../lib/session-context';

type Props = {
  title: string;
};

export function OnboardingHeader({ title }: Props) {
  const { signOut } = useSession();

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can pick up onboarding again next time you log in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View className="flex-row items-start justify-between mb-1">
      <Text className="text-2xl text-brand-text flex-1 pr-3" style={{ fontFamily: 'Kollektif-Bold' }}>
        {title}
      </Text>
      <Pressable onPress={handleSignOut} hitSlop={8}>
        <Text className="text-brand-primary text-sm" style={{ fontFamily: 'Kollektif-Bold' }}>
          Sign out
        </Text>
      </Pressable>
    </View>
  );
}
