import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useSession } from '../lib/session-context';
import { Screen } from '../components/Screen';

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <Screen backgroundColor="#00202b" contentContainerClassName="flex-grow justify-center px-6 gap-4">
      <View className="gap-4">
        <Text className="text-3xl font-bold text-white text-center mb-4">Welcome Back</Text>

        {error ? <Text className="text-brand-errorDark text-center">{error}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#656565"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          className="h-[60px] bg-white rounded-lg px-5 text-lg text-brand-text"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#656565"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="h-[60px] bg-white rounded-lg px-5 text-lg text-brand-text"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="h-[60px] bg-brand-button rounded-lg items-center justify-center disabled:opacity-50"
        >
          <Text className="text-white text-lg font-bold">{loading ? 'Logging in...' : 'Log in'}</Text>
        </Pressable>

        <Link href="/register" className="text-center text-white text-base mt-2">
          Don&apos;t have an account? Sign Up
        </Link>
      </View>
    </Screen>
  );
}
