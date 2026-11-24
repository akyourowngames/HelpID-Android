import { UserProfile } from '../types';

export type QrPayload = {
  v: 1;
  t: 'HID';
  id: string;
  n: string;
  bg: string;
  a: string;
  al: string[];
  md: string[];
  c: [string, string][];
};

export function buildOfflineQr(profile: UserProfile): string {
  const payload: QrPayload = {
    v: 1,
    t: 'HID',
    id: profile.userId,
    n: profile.name,
    bg: profile.bloodGroup,
    a: profile.address,
    al: profile.allergies,
    md: profile.medicalNotes,
    c: profile.emergencyContacts.map((contact) => [contact.name, contact.phone]),
  };
  return JSON.stringify(payload);
}

export function readOfflineQr(value: string): QrPayload | null {
  try {
    const parsed = JSON.parse(value) as QrPayload;
    if (parsed?.v !== 1 || parsed?.t !== 'HID') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function qrSummary(profile: UserProfile): string[] {
  const rows: string[] = [];
  if (profile.name) rows.push(`Name: ${profile.name}`);
  if (profile.bloodGroup) rows.push(`Blood group: ${profile.bloodGroup}`);
  if (profile.allergies.length) rows.push(`Allergies: ${profile.allergies.join(', ')}`);
  if (profile.medicalNotes.length)
    rows.push(`Conditions: ${profile.medicalNotes.join(', ')}`);
  if (profile.address) rows.push(`Address: ${profile.address}`);
  profile.emergencyContacts.forEach((c) => rows.push(`${c.name}: ${c.phone}`));
  return rows;
}
