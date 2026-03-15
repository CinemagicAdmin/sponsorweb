'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { storage } from '@/utils/storage';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  isProfileComplete: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Default (empty) state used for SSR and initial client render
const emptyState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// Read from localStorage (client only)
function readStoredAuth(): AuthState {
  const user = storage.getUser();
  const token = storage.getAccessToken();
  if (user && token && user.isOtpVerify === 1) {
    return { user, token, isAuthenticated: true };
  }
  return emptyState;
}

// useSyncExternalStore subscribe — localStorage doesn't fire events for
// same-tab changes, so we use a manual notify pattern.
let listeners: Array<() => void> = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function notifyListeners() {
  listeners.forEach((l) => l());
}

// Snapshots for useSyncExternalStore
let cachedSnapshot: AuthState | null = null;
function getSnapshot(): AuthState {
  if (!cachedSnapshot) {
    cachedSnapshot = readStoredAuth();
  }
  return cachedSnapshot;
}
function getServerSnapshot(): AuthState {
  return emptyState;
}

function invalidateSnapshot() {
  cachedSnapshot = null;
  notifyListeners();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore ensures server and client initial render match (emptyState),
  // then hydrates from localStorage on the client without hydration mismatch.
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [override, setOverride] = useState<AuthState | null>(null);
  const current = override ?? stored;

  // Server returns true (loading), client returns false after hydration
  const isLoading = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );

  const setAuth = useCallback(
    (user: User, token: string, refreshToken: string) => {
      storage.setAccessToken(token);
      storage.setRefreshToken(refreshToken);
      storage.setUser(user as unknown as Record<string, unknown>);
      const next: AuthState = {
        user,
        token,
        isAuthenticated: user.isOtpVerify === 1,
      };
      setOverride(next);
      invalidateSnapshot();
    },
    [],
  );

  const setUser = useCallback((user: User) => {
    storage.setUser(user as unknown as Record<string, unknown>);
    setOverride((prev) => (prev ? { ...prev, user } : { user, token: null, isAuthenticated: true }));
    invalidateSnapshot();
  }, []);

  const isProfileComplete = Boolean(
    current.user?.firstName && current.user?.email,
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    storage.clear();
    setOverride(emptyState);
    invalidateSnapshot();
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...current, isLoading, setAuth, setUser, isProfileComplete, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
