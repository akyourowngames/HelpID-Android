import { Share } from 'react-native';
import { UserProfile } from '../types';

export function buildShareText(profile: UserProfile): string {
  const lines: string[] = ['EMERGENCY MEDICAL PROFILE', ''];
  lines.push(`Name: ${profile.name}`);
  lines.push(`Blood group: ${profile.bloodGroup}`);
  if (profile.address) lines.push(`Address: ${profile.address}`);
  lines.push(`Emergency ID: ${profile.userId}`);

  if (profile.allergies.length > 0) {
    lines.push('', 'Allergies:');
    profile.allergies.forEach((item) => lines.push(`- ${item}`));
  }
  if (profile.medicalNotes.length > 0) {
    lines.push('', 'Medical conditions:');
    profile.medicalNotes.forEach((item) => lines.push(`- ${item}`));
  }
  if (profile.emergencyContacts.length > 0) {
    lines.push('', 'Emergency contacts:');
    profile.emergencyContacts.forEach((c) => lines.push(`- ${c.name}: ${c.phone}`));
  }
  return lines.join('\n');
}

export async function shareProfile(profile: UserProfile): Promise<void> {
  await Share.share({ message: buildShareText(profile), title: 'Emergency profile' });
}

export async function shareMessage(message: string): Promise<void> {
  await Share.share({ message });
}
