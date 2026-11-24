import './cryptoPolyfill';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

const KEY_ALIAS = 'helpid.cache.key';
const PREFIX = 'enc::';

let memoryKey: string | null = null;

async function getKey(): Promise<string | null> {
  if (memoryKey) return memoryKey;
  try {
    if (Platform.OS === 'web') {
      const existing = await AsyncStorage.getItem(KEY_ALIAS);
      const key = existing ?? Crypto.randomUUID().replace(/-/g, '');
      if (!existing) await AsyncStorage.setItem(KEY_ALIAS, key);
      memoryKey = key;
      return key;
    }
    let key = await SecureStore.getItemAsync(KEY_ALIAS);
    if (!key) {
      key = Crypto.randomUUID().replace(/-/g, '') + Crypto.randomUUID().replace(/-/g, '');
      await SecureStore.setItemAsync(KEY_ALIAS, key);
    }
    memoryKey = key;
    return key;
  } catch {
    return null;
  }
}

export async function writeSecureJson(key: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value);
  const secret = await getKey();
  let payload = raw;
  if (secret) {
    try {
      payload = PREFIX + CryptoJS.AES.encrypt(raw, secret).toString();
    } catch {
      // Never lose the profile just because the RNG/keystore misbehaves.
      payload = raw;
    }
  }
  await AsyncStorage.setItem(key, payload);
}

export async function readSecureJson<T>(key: string): Promise<T | null> {
  const stored = await AsyncStorage.getItem(key);
  if (!stored) return null;
  try {
    if (stored.startsWith(PREFIX)) {
      const secret = await getKey();
      if (!secret) return null;
      const decrypted = CryptoJS.AES.decrypt(stored.slice(PREFIX.length), secret).toString(
        CryptoJS.enc.Utf8,
      );
      if (!decrypted) return null;
      return JSON.parse(decrypted) as T;
    }
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // best effort
  }
}
