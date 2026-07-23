import AsyncStorage from '@react-native-async-storage/async-storage';

// Mirrors the web onboarding wizard's localStorage keys 1:1 (mentorStep1,
// mentorStep2, mentorResumeData, menteeStep1, menteeResumeData) so cross-step
// data survives the app being backgrounded/killed between wizard steps,
// same role localStorage plays across web page loads.
const KEYS = {
  mentorStep1: 'mentorStep1',
  mentorStep2: 'mentorStep2',
  mentorResumeData: 'mentorResumeData',
  menteeStep1: 'menteeStep1',
  menteeResumeData: 'menteeResumeData',
} as const;

export type StorageKey = keyof typeof KEYS;

// Keys aren't namespaced per-account, so a different user signing in after a
// sign-out could otherwise see a previous account's leftover step data.
export const ALL_ONBOARDING_KEYS = Object.keys(KEYS) as StorageKey[];

export async function saveStep<T>(key: StorageKey, value: T): Promise<void> {
  await AsyncStorage.setItem(KEYS[key], JSON.stringify(value));
}

export async function loadStep<T>(key: StorageKey): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEYS[key]);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function clearSteps(keys: StorageKey[]): Promise<void> {
  await AsyncStorage.multiRemove(keys.map((k) => KEYS[k]));
}
