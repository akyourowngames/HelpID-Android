import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { deviceRegion } from './emergencyNumbers';

export function sanitizePhoneInput(input: string): string {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  const normalized = (hasPlus ? '+' : '') + digits;
  return normalized.slice(0, 16);
}

export function toE164(input: string, region = deviceRegion()): string | null {
  const sanitized = sanitizePhoneInput(input);
  if (!sanitized || sanitized === '+') return null;
  try {
    const parsed = parsePhoneNumberFromString(sanitized, region as CountryCode);
    if (!parsed || !parsed.isValid()) return null;
    return parsed.number;
  } catch {
    return null;
  }
}

export function normalizePhoneOrRaw(input: string, region = deviceRegion()): string {
  return toE164(input, region) ?? sanitizePhoneInput(input);
}

export function isValidPhone(input: string, region = deviceRegion()): boolean {
  return toE164(input, region) !== null;
}
