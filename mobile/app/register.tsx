import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useSession } from '../lib/session-context';
import { Screen } from '../components/Screen';
import type { Role } from '../lib/auth-api';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterScreen() {
  const { signUp } = useSession();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentee' as Role,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key: keyof typeof formData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!PASSWORD_REGEX.test(formData.password)) {
      setError(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
      );
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.firstName, formData.lastName, formData.email, formData.password, formData.role);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = 'h-[60px] bg-white rounded-lg px-5 text-lg text-brand-text';

  return (
    <Screen backgroundColor="#00202b" contentContainerClassName="flex-grow justify-center px-6 py-10 gap-4">
      <Text className="text-3xl font-bold text-white text-center mb-4">Create an Account</Text>

      {error ? <Text className="text-brand-errorDark text-center">{error}</Text> : null}

      <TextInput
        placeholder="First Name"
        placeholderTextColor="#656565"
        value={formData.firstName}
        onChangeText={setField('firstName')}
        className={inputClasses}
      />
      <TextInput
        placeholder="Last Name"
        placeholderTextColor="#656565"
        value={formData.lastName}
        onChangeText={setField('lastName')}
        className={inputClasses}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#656565"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={formData.email}
        onChangeText={setField('email')}
        className={inputClasses}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#656565"
        secureTextEntry
        value={formData.password}
        onChangeText={setField('password')}
        className={inputClasses}
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#656565"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={setField('confirmPassword')}
        className={inputClasses}
      />

      <View className="flex-row gap-3">
        {(['mentee', 'mentor'] as const).map((role) => (
          <Pressable
            key={role}
            onPress={() => setFormData((prev) => ({ ...prev, role }))}
            className={`flex-1 h-[52px] rounded-lg items-center justify-center border ${
              formData.role === role ? 'bg-brand-button border-brand-button' : 'bg-transparent border-white/40'
            }`}
          >
            <Text className="text-white font-semibold capitalize">{role}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="h-[60px] bg-brand-button rounded-lg items-center justify-center mt-2 disabled:opacity-50"
      >
        <Text className="text-white text-lg font-bold">
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </Pressable>

      <Link href="/login" className="text-center text-white text-base mt-2">
        Already have an account? Log in
      </Link>
    </Screen>
  );
}
