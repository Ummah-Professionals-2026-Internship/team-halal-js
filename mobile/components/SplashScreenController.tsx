import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useSession } from '../lib/session-context';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  return null;
}
