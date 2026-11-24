import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase, BackendMode } from './supabase';
import { readSecureJson, writeSecureJson } from './storage';
import { defaultProfile, EmergencyContact, UserProfile } from '../types';

const USER_KEY = 'helpid.user.id';
const PROFILE_KEY = 'helpid.profile.v1';
const PENDING_KEY = 'helpid.profile.pending';
const NETWORK_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms = NETWORK_TIMEOUT_MS): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

type ProfileRow = {
  id: string;
  name: string | null;
  blood_group: string | null;
  address: string | null;
  allergies: string[] | null;
  medical_notes: string[] | null;
  emergency_contacts: EmergencyContact[] | null;
  language: string | null;
  last_updated: string | number | null;
};

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    userId: row.id,
    name: row.name ?? '',
    bloodGroup: row.blood_group ?? '',
    address: row.address ?? '',
    allergies: Array.isArray(row.allergies) ? row.allergies : [],
    medicalNotes: Array.isArray(row.medical_notes) ? row.medical_notes : [],
    emergencyContacts: Array.isArray(row.emergency_contacts)
      ? row.emergency_contacts
          .filter((c) => c && typeof c === 'object')
          .map((c) => ({ name: String(c.name ?? ''), phone: String(c.phone ?? '') }))
      : [],
    language: row.language ?? 'en',
    lastUpdated: row.last_updated ? new Date(row.last_updated).getTime() : Date.now(),
  };
}

function profileToRow(profile: UserProfile) {
  return {
    id: profile.userId,
    name: profile.name,
    blood_group: profile.bloodGroup,
    address: profile.address,
    allergies: profile.allergies,
    medical_notes: profile.medicalNotes,
    emergency_contacts: profile.emergencyContacts,
    language: profile.language,
    last_updated: new Date(profile.lastUpdated).toISOString(),
  };
}

export async function ensureDemoIdentity(): Promise<{ userId: string; mode: 'demo' }> {
  try {
    const cached = await AsyncStorage.getItem(USER_KEY);
    if (cached?.startsWith('demo-')) return { userId: cached, mode: 'demo' };
    const id = `demo-${Crypto.randomUUID()}`;
    await AsyncStorage.setItem(USER_KEY, id);
    return { userId: id, mode: 'demo' };
  } catch {
    return { userId: `demo-${Date.now()}`, mode: 'demo' };
  }
}

export async function initIdentity(): Promise<{ userId: string; mode: BackendMode }> {
  if (supabase) {
    try {
      const sessionResult = await withTimeout(supabase.auth.getSession());
      const sessionUser = sessionResult?.data?.session?.user;
      if (sessionUser) {
        await AsyncStorage.setItem(USER_KEY, sessionUser.id).catch(() => undefined);
        return { userId: sessionUser.id, mode: 'supabase' };
      }
      const signInResult = await withTimeout(supabase.auth.signInAnonymously());
      if (signInResult && !signInResult.error && signInResult.data.user) {
        const id = signInResult.data.user.id;
        await AsyncStorage.setItem(USER_KEY, id).catch(() => undefined);
        return { userId: id, mode: 'supabase' };
      }
    } catch {
      // fall through to demo mode
    }
  }

  return ensureDemoIdentity();
}

export async function getCachedProfile(userId: string): Promise<UserProfile | null> {
  const cached = await readSecureJson<UserProfile>(PROFILE_KEY);
  if (!cached || cached.userId !== userId) return null;
  return cached;
}

export async function cacheProfile(profile: UserProfile): Promise<void> {
  await writeSecureJson(PROFILE_KEY, profile);
}

async function fetchRemoteProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProfile(data as ProfileRow) : null;
}

export async function fetchProfile(
  userId: string,
  mode: BackendMode,
): Promise<{ profile: UserProfile; remote: boolean }> {
  const cached = await getCachedProfile(userId);
  if (cached) return { profile: cached, remote: false };

  if (mode === 'supabase') {
    try {
      const remote = await withTimeout(fetchRemoteProfile(userId));
      if (remote) {
        await cacheProfile(remote);
        return { profile: remote, remote: true };
      }
      const seeded = defaultProfile(userId);
      await cacheProfile(seeded);
      pushRemote(seeded).catch(() => undefined);
      return { profile: seeded, remote: true };
    } catch {
      const seeded = defaultProfile(userId);
      await cacheProfile(seeded);
      return { profile: seeded, remote: false };
    }
  }

  const seeded = defaultProfile(userId);
  await cacheProfile(seeded);
  return { profile: seeded, remote: false };
}

export async function refreshProfile(
  userId: string,
  mode: BackendMode,
): Promise<UserProfile | null> {
  if (mode === 'supabase') {
    try {
      const remote = await withTimeout(fetchRemoteProfile(userId));
      if (remote) {
        await cacheProfile(remote);
        return remote;
      }
    } catch {
      // offline: fall back to cache
    }
  }
  return getCachedProfile(userId);
}

async function pushRemote(profile: UserProfile): Promise<boolean> {
  if (!supabase || profile.userId.startsWith('demo-')) return false;
  const { error } = await supabase.from('profiles').upsert(profileToRow(profile));
  if (error) throw error;
  return true;
}

export async function saveProfile(
  profile: UserProfile,
): Promise<{ profile: UserProfile; synced: boolean }> {
  const updated: UserProfile = { ...profile, lastUpdated: Date.now() };
  await cacheProfile(updated).catch(() => undefined);

  try {
    const synced = await withTimeout(pushRemote(updated));
    if (synced) await AsyncStorage.removeItem(PENDING_KEY);
    if (!synced) await writeSecureJson(PENDING_KEY, updated);
    return { profile: updated, synced: Boolean(synced) };
  } catch {
    await writeSecureJson(PENDING_KEY, updated).catch(() => undefined);
    return { profile: updated, synced: false };
  }
}

export async function syncPendingProfile(): Promise<boolean> {
  const pending = await readSecureJson<UserProfile>(PENDING_KEY);
  if (!pending) return false;
  try {
    const synced = await withTimeout(pushRemote(pending));
    if (synced) await AsyncStorage.removeItem(PENDING_KEY);
    return Boolean(synced);
  } catch {
    return false;
  }
}

export async function mintPublicLink(): Promise<{ url: string; publicKey: string } | null> {
  if (!supabase) return null;
  try {
    const response = await withTimeout(supabase.functions.invoke('mint', { body: {} }), 10000);
    if (!response || response.error) return null;
    const payload = response.data as { url?: string; publicKey?: string } | null;
    if (!payload?.publicKey) return null;
    return {
      publicKey: payload.publicKey,
      url:
        payload.url ||
        `${(process.env.EXPO_PUBLIC_WEB_BASE_URL ?? 'https://helper-id.vercel.app').replace(/\/+$/, '')}/e/${payload.publicKey}`,
    };
  } catch {
    return null;
  }
}
