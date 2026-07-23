import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../../lib/session-context';
import { firstOnboardingStep } from '../../lib/onboarding-api';
import { Screen } from '../../components/Screen';

// Pure router: sends signed-in users to onboarding (if profile incomplete) or
// their role's dashboard. Renders nothing itself.
export default function Home() {
  const { user } = useSession();

  useEffect(() => {
    if (!user) return;
    if (!user.hasCompletedProfile) {
      router.replace(firstOnboardingStep(user.role));
    } else {
      router.replace(user.role === 'mentor' ? '/mentor-dashboard' : '/mentee-dashboard');
    }
  }, [user]);

  return (
    <Screen scroll={false} keyboardAvoiding={false} contentContainerClassName="flex-1 items-center justify-center">
      <ActivityIndicator color="#007CA6" />
    </Screen>
  );
}
