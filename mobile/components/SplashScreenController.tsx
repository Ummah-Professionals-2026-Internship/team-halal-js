import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useSession } from '../lib/session-context';
import { Logo } from './Logo';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { status } = useSession();
  const [isReady, setIsReady] = useState(false);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide native OS splash screen immediately so custom React Native screen is displayed
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      // Hold custom logo screen for 2.5 seconds, then smoothly fade out to reveal login/dashboard
      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }).start(() => {
          setIsReady(true);
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [status, opacityAnim]);

  if (isReady) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, { opacity: opacityAnim }]}
      pointerEvents={status !== 'loading' ? 'none' : 'auto'}
    >
      <View style={styles.logoContainer}>
        <Logo width={280} height={90} color="#FDFDFB" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    elevation: 999999,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
