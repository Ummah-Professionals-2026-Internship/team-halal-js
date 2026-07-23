import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useSession } from '../lib/session-context';
import { promptGoogleSignIn } from '../lib/auth-api';
import { Screen } from '../components/Screen';
import { GoogleIcon } from '../components/GoogleIcon';

export default function LoginScreen() {
  const { signIn, signInWithToken } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const token = await promptGoogleSignIn();
      if (token) {
        await signInWithToken(token);
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen backgroundColor="#00202b" contentContainerClassName="flex-grow justify-center px-6 gap-4">
      <View className="gap-4">
        <Text className="text-3xl text-white text-center mb-4" style={{ fontFamily: 'Kollektif-Bold' }}>
          Welcome Back
        </Text>

        {error ? <Text className="text-brand-errorDark text-center" style={{ fontFamily: 'Kollektif' }}>{error}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#656565"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ fontFamily: 'Kollektif' }}
          className="h-[60px] bg-white rounded-lg px-5 text-lg text-brand-text"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#656565"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ fontFamily: 'Kollektif' }}
          className="h-[60px] bg-white rounded-lg px-5 text-lg text-brand-text"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={loading || googleLoading}
          className="h-[60px] bg-brand-button rounded-lg items-center justify-center disabled:opacity-50"
        >
          <Text className="text-white text-lg" style={{ fontFamily: 'Kollektif-Bold' }}>
            {loading ? 'Logging in...' : 'Log in'}
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center gap-3 my-1">
          <View className="flex-1 h-[1px] bg-[#CFC5B3]/40" />
          <Text className="text-[#9a9a9a] text-sm font-medium" style={{ fontFamily: 'Kollektif' }}>
            or
          </Text>
          <View className="flex-1 h-[1px] bg-[#CFC5B3]/40" />
        </View>

        {/* Sign in with Google */}
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="h-[60px] bg-white rounded-lg flex-row items-center justify-center gap-3 border border-[#CFC5B3] disabled:opacity-50"
        >
          {googleLoading ? (
            <ActivityIndicator color="#007CA6" />
          ) : (
            <>
              <GoogleIcon size={24} />
              <Text className="text-[#3c3c3c] text-lg" style={{ fontFamily: 'Kollektif-Bold' }}>
                Sign in with Google
              </Text>
            </>
          )}
        </Pressable>

        <Link href="/register" className="text-center text-white text-base mt-2" style={{ fontFamily: 'Kollektif' }}>
          Don&apos;t have an account? Sign Up
        </Link>
      </View>
    </Screen>
  );
}
