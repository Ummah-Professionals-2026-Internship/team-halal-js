import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getMe, login as apiLogin, register as apiRegister, type MeUser, type Role } from './auth-api';
import { clearSteps, ALL_ONBOARDING_KEYS } from './onboarding-storage';

type Status = 'loading' | 'signedIn' | 'signedOut';

type SessionContextValue = {
  status: Status;
  user: MeUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
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
        const me = await getMe();
        setUser(me);
        setStatus('signedIn');
      } catch {
        await SecureStore.deleteItemAsync('token');
        setStatus('signedOut');
      }
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const data = await apiLogin(email, password);
    await SecureStore.setItemAsync('token', data.token);
    const me = await getMe();
    setUser(me);
    setStatus('signedIn');
  }

  async function signInWithToken(token: string) {
    await SecureStore.setItemAsync('token', token);
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
    await clearSteps(ALL_ONBOARDING_KEYS);
    setUser(null);
    setStatus('signedOut');
  }

  async function refreshUser() {
    const me = await getMe();
    setUser(me);
  }

  return (
    <SessionContext.Provider value={{ status, user, signIn, signInWithToken, signUp, signOut, refreshUser }}>
      {children}
    </SessionContext.Provider>
  );
}
