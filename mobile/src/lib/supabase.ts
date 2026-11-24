import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const backendConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = backendConfigured
  ? createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const webBaseUrl =
  process.env.EXPO_PUBLIC_WEB_BASE_URL?.trim().replace(/\/+$/, '') ||
  'https://helper-id.vercel.app';

export type BackendMode = 'supabase' | 'demo';
