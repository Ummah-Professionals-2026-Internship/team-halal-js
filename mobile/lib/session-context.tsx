import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getMe, login as apiLogin, register as apiRegister, type MeUser, type Role } from './auth-api';
import { clearSteps, ALL_ONBOARDING_KEYS } from './onboarding-storage';

type Status = 'loading' | 'signedIn' | 'signedOut';

type SessionContextValue = {
  status: Status;
  user: MeUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Role
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<MeUser | null>(null);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        setStatus('signedOut');
        return;
      }
      try {
        // Validates the stored token server-side, mirrors the web app's
        // useCurrentUser hook treating an invalid/expired token as signed out.
        const me = await getMe();
        setUser(me);
        setStatus('signedIn');
      } catch {
        await SecureStore.deleteItemAsync('token');
        setStatus('signedOut');
      }
    })();
  }, []);

  // Both signIn and signUp fetch the full /me projection right after auth,
  // rather than trusting the login/register response's slimmer `user` object
  // (id/firstName/lastName/email/role/hasCompletedProfile only) — an existing
  // mentor/mentee logging back in needs mentorProfile/manualAvailabilitySlots
  // etc. immediately for the dashboard, not just after a later refresh.
  async function signIn(email: string, password: string) {
    const data = await apiLogin(email, password);
    await SecureStore.setItemAsync('token', data.token);
    const me = await getMe();
    setUser(me);
    setStatus('signedIn');
  }

  async function signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Role
  ) {
    const data = await apiRegister(firstName, lastName, email, password, role);
    await SecureStore.setItemAsync('token', data.token);
    const me = await getMe();
    setUser(me);
    setStatus('signedIn');
  }

  async function signOut() {
    await SecureStore.deleteItemAsync('token');
    // Onboarding step keys aren't namespaced per-account — clear them so a
    // different user signing in next doesn't see this account's leftover data.
    await clearSteps(ALL_ONBOARDING_KEYS);
    setUser(null);
    setStatus('signedOut');
  }

  // Re-fetches /api/auth/me — used after onboarding completes so the cached
  // user (still hasCompletedProfile: false) doesn't send the user straight
  // back into onboarding via the (app)/index.tsx redirect.
  async function refreshUser() {
    const me = await getMe();
    setUser(me);
  }

  return (
    <SessionContext.Provider value={{ status, user, signIn, signUp, signOut, refreshUser }}>
      {children}
    </SessionContext.Provider>
  );
}
