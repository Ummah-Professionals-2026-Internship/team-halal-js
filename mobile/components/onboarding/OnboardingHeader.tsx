import { View, Text, Pressable, Alert } from 'react-native';
import { useSession } from '../../lib/session-context';

type Props = {
  title: string;
};

// Every onboarding screen is reached via router.replace, which clears the
// navigation stack — there is no back button to fall back on. This gives
// users stuck mid-onboarding (e.g. after force-quitting and reopening the
// app) a way out back to the login screen instead of being trapped.
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
      <Text className="text-2xl font-bold text-brand-text flex-1 pr-3">{title}</Text>
      <Pressable onPress={handleSignOut} hitSlop={8}>
        <Text className="text-brand-primary text-sm font-semibold">Sign out</Text>
      </Pressable>
    </View>
  );
}
