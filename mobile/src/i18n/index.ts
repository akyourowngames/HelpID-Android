import type { Dict, TranslationKey } from './en';
import { en } from './en';
import { es } from './es';
import { hi } from './hi';
import { fr } from './fr';
import { de } from './de';

export type { Dict, TranslationKey };

export type Locale = 'en' | 'es' | 'hi' | 'fr' | 'de';

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Espa\u00f1ol' },
  { code: 'hi', label: 'Hindi', native: '\u0939\u093f\u0928\u094d\u0926\u0940' },
  { code: 'fr', label: 'French', native: 'Fran\u00e7ais' },
  { code: 'de', label: 'German', native: 'Deutsch' },
];

export const dictionaries: Record<Locale, Partial<Dict>> = { en, es, hi, fr, de };

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && value in dictionaries;
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const raw = (dictionaries[locale] as Partial<Dict>)[key] ?? en[key];
  if (!params) return raw;
  return Object.entries(params).reduce(
    (acc, [name, value]) => acc.replace(new RegExp(`{{${name}}}`, 'g'), String(value)),
    raw,
  );
}
