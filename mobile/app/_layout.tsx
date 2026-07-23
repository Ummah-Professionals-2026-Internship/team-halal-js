import React from 'react';
import '../global.css';
import { Text, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SessionProvider, useSession } from '../lib/session-context';
import { SplashScreenController } from '../components/SplashScreenController';

// Set Kollektif default props for Text and TextInput
if ((Text as any).defaultProps) {
  (Text as any).defaultProps.style = { fontFamily: 'Kollektif', ...((Text as any).defaultProps.style || {}) };
} else {
  (Text as any).defaultProps = { style: { fontFamily: 'Kollektif' } };
}

if ((TextInput as any).defaultProps) {
  (TextInput as any).defaultProps.style = { fontFamily: 'Kollektif', ...((TextInput as any).defaultProps.style || {}) };
} else {
  (TextInput as any).defaultProps = { style: { fontFamily: 'Kollektif' } };
}

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
