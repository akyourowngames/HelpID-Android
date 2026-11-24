import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  cacheProfile,
  ensureDemoIdentity,
  fetchProfile,
  getCachedProfile,
  initIdentity,
  refreshProfile,
  saveProfile,
  syncPendingProfile,
} from '../lib/profileStore';
import { BackendMode } from '../lib/supabase';
import { defaultProfile, UserProfile } from '../types';

type ProfileValue = {
  userId: string | null;
  mode: BackendMode;
  profile: UserProfile | null;
  ready: boolean;
  online: boolean;
  saving: boolean;
  save: (next: UserProfile) => Promise<{ synced: boolean }>;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<BackendMode>('demo');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [saving, setSaving] = useState(false);
  const identityRef = useRef<{ userId: string; mode: BackendMode } | null>(null);
  const readyRef = useRef(false);
  const fallbackRef = useRef(false);

  const markReady = useCallback((next: UserProfile) => {
    readyRef.current = true;
    setProfile(next);
    setReady(true);
  }, []);

  const loadFallback = useCallback(async () => {
    if (readyRef.current || fallbackRef.current) return;
    fallbackRef.current = true;
    const identity = await ensureDemoIdentity();
    identityRef.current = identity;
    const fallbackProfile = defaultProfile(identity.userId);
    setUserId(identity.userId);
    setMode('demo');
    markReady(fallbackProfile);
    cacheProfile(fallbackProfile).catch(() => undefined);
  }, [markReady]);

  useEffect(() => {
    let cancelled = false;
    const watchdog = setTimeout(() => {
      if (!cancelled) loadFallback().catch(() => undefined);
    }, 12000);

    (async () => {
      try {
        const identity = await initIdentity();
        if (cancelled || fallbackRef.current) return;
        identityRef.current = identity;
        setUserId(identity.userId);
        setMode(identity.mode);

        const cached = await getCachedProfile(identity.userId);
        if (cached && !cancelled && !fallbackRef.current) {
          markReady(cached);
        }

        const result = await fetchProfile(identity.userId, identity.mode);
        if (!cancelled && !fallbackRef.current) {
          markReady(result.profile);
        }
      } catch {
        if (!cancelled) await loadFallback();
      } finally {
        clearTimeout(watchdog);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
    };
  }, [loadFallback, markReady]);

  const refresh = useCallback(async () => {
    const identity = identityRef.current;
    if (!identity) return;
    const next = await refreshProfile(identity.userId, identity.mode);
    if (next) setProfile(next);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected);
      setOnline(isOnline);
      if (isOnline) {
        (async () => {
          await syncPendingProfile();
          await refresh();
        })().catch(() => undefined);
      }
    });
    return unsubscribe;
  }, [refresh]);

  const save = useCallback(
    async (next: UserProfile) => {
      const identity = identityRef.current;
      if (!identity) return { synced: false };
      setSaving(true);
      try {
        const result = await saveProfile({
          ...next,
          userId: identity.userId,
          language: next.language || 'en',
        });
        setProfile(result.profile);
        return { synced: result.synced };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ userId, mode, profile, ready, online, saving, save, refresh }),
    [userId, mode, profile, ready, online, saving, save, refresh],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
