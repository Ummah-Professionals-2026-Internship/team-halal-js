import React from 'react';
import '../global.css';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SessionProvider, useSession } from '../lib/session-context';
import { SplashScreenController } from '../components/SplashScreenController';


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kollektif: require('../assets/fonts/Kollektif.ttf'),
    'Kollektif-Bold': require('../assets/fonts/Kollektif-Bold.ttf'),
    'Kollektif-Italic': require('../assets/fonts/Kollektif-Italic.ttf'),
    'Kollektif-BoldItalic': require('../assets/fonts/Kollektif-BoldItalic.ttf'),
  });

  return (
    <SessionProvider>
      <SplashScreenController />
      {fontsLoaded ? <RootNavigator /> : null}
    </SessionProvider>
  );
}

function RootNavigator() {
  const { status } = useSession();

  return (
    <Stack>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={status !== 'signedIn'}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
