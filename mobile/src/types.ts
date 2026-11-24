export type EmergencyContact = {
  name: string;
  phone: string;
};

export type UserProfile = {
  userId: string;
  name: string;
  bloodGroup: string;
  address: string;
  allergies: string[];
  medicalNotes: string[];
  emergencyContacts: EmergencyContact[];
  language: string;
  lastUpdated: number;
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export function defaultProfile(userId = ''): UserProfile {
  return {
    userId,
    name: 'John Doe',
    bloodGroup: 'O+',
    address: '',
    allergies: [],
    medicalNotes: ['Diabetic', 'High Blood Pressure'],
    emergencyContacts: [
      { name: 'Father', phone: '+919876543210' },
      { name: 'Mother', phone: '+918765432109' },
    ],
    language: 'en',
    lastUpdated: Date.now(),
  };
}

export function profileIsReady(profile: UserProfile): boolean {
  const hasName = profile.name.trim().length > 0;
  const hasBlood = profile.bloodGroup.trim().length > 0;
  const contacts = profile.emergencyContacts.filter(
    (c) => c.phone.trim() && c.name.trim(),
  );
  if (!hasName || !hasBlood || contacts.length === 0) return false;

  const defaults = defaultProfile(profile.userId);
  const unchangedDefaults =
    profile.name.trim().toLowerCase() === defaults.name.toLowerCase() &&
    profile.bloodGroup.trim().toLowerCase() === defaults.bloodGroup.toLowerCase() &&
    JSON.stringify(profile.emergencyContacts) ===
      JSON.stringify(defaults.emergencyContacts);
  return !unchangedDefaults;
}

export function isValidName(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && v.length <= 40 && /^[\p{L} ]+$/u.test(v);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}
