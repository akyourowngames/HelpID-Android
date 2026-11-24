import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { isLocale, Locale, translate, TranslationKey } from '../i18n';

const LOCALE_KEY = 'helpid.locale';

type SettingsValue = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatDate: (timestamp: number) => string;
};

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LOCALE_KEY);
      if (isLocale(stored)) {
        setLocaleState(stored);
        return;
      }
      const deviceCode = Localization.getLocales()[0]?.languageCode ?? null;
      if (isLocale(deviceCode)) setLocaleState(deviceCode);
    })().catch(() => undefined);
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await AsyncStorage.setItem(LOCALE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const formatDate = useCallback(
    (timestamp: number) => {
      try {
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(timestamp));
      } catch {
        return new Date(timestamp).toDateString();
      }
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, formatDate }),
    [locale, setLocale, t, formatDate],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
