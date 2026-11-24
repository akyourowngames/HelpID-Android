import { Platform, Share } from 'react-native';
import * as SMS from 'expo-sms';
import { Linking } from 'react-native';
import { UserProfile } from '../types';
import { mapsLink } from './location';

export type SosDelivery = 'sent' | 'cancelled' | 'shared' | 'unavailable';

export function buildSosMessage(
  profile: UserProfile,
  coords: { latitude: number; longitude: number } | null,
  test = false,
): string {
  const link = mapsLink(coords);
  return [
    test ? 'TEST SOS: Please ignore.' : 'SOS! I need help.',
    profile.name.trim() ? `Name: ${profile.name}` : '',
    profile.bloodGroup.trim() ? `Blood: ${profile.bloodGroup}` : '',
    profile.address.trim() ? `Address: ${profile.address}` : '',
    link ? `Location: ${link}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function emergencyPhones(profile: UserProfile): string[] {
  return profile.emergencyContacts
    .map((c) => c.phone.trim())
    .filter(Boolean)
    .filter((phone, index, list) => list.indexOf(phone) === index);
}

export async function openSmsHandoff(
  phones: string[],
  message: string,
): Promise<SosDelivery> {
  if (phones.length === 0) return 'unavailable';
  try {
    const available = await SMS.isAvailableAsync();
    if (!available) {
      await Share.share({ message });
      return 'shared';
    }
    const { result } = await SMS.sendSMSAsync(phones, message);
    return result === 'sent' ? 'sent' : 'cancelled';
  } catch {
    try {
      await Share.share({ message });
      return 'shared';
    } catch {
      return 'unavailable';
    }
  }
}

export async function smsOne(phone: string, message: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Share.share({ message });
    return;
  }
  const available = await SMS.isAvailableAsync();
  if (!available) {
    await Share.share({ message });
    return;
  }
  await SMS.sendSMSAsync([phone], message);
}

export async function dial(number: string): Promise<void> {
  try {
    await Linking.openURL(`tel:${number.replace(/[^\d+*#]/g, '')}`);
  } catch {
    // dialer unavailable
  }
}
