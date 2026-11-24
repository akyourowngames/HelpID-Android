import { Platform } from 'react-native';
import * as Localization from 'expo-localization';

const NUMBER_BY_COUNTRY: Record<string, string> = {
  US: '911',
  CA: '911',
  IN: '112',
  GB: '999',
  IE: '112',
  AU: '000',
  NZ: '111',
  JP: '119',
  KR: '119',
  CN: '120',
  BR: '190',
  MX: '911',
  DE: '112',
  FR: '112',
  ES: '112',
  IT: '112',
  NL: '112',
  BE: '112',
  SE: '112',
  NO: '112',
  DK: '112',
  FI: '112',
  CH: '112',
  AT: '112',
  PL: '112',
  PT: '112',
  RO: '112',
  HU: '112',
  CZ: '112',
  GR: '112',
  TR: '112',
  ZA: '112',
  SG: '995',
  AE: '999',
};

export function deviceRegion(): string {
  try {
    return Localization.getLocales()[0]?.regionCode?.toUpperCase() ?? 'US';
  } catch {
    return 'US';
  }
}

export function resolveEmergencyNumber(region = deviceRegion()): string {
  if (Platform.OS === 'web') return '112';
  return NUMBER_BY_COUNTRY[region] ?? '112';
}
