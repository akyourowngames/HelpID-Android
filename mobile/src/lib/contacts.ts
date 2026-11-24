import * as Contacts from 'expo-contacts';
import { EmergencyContact } from '../types';

export type PickResult =
  | { status: 'picked'; contact: EmergencyContact }
  | { status: 'denied' }
  | { status: 'cancelled' };

export async function pickContactFromDevice(): Promise<PickResult> {
  try {
    const permission = await Contacts.requestPermissionsAsync();
    if (permission.status !== 'granted') return { status: 'denied' };

    const contact = await Contacts.Contact.presentPicker();
    if (!contact) return { status: 'cancelled' };

    const details = await contact.getDetails([
      Contacts.ContactField.FULL_NAME,
      Contacts.ContactField.PHONES,
    ]);
    const name = details.fullName?.trim() ?? '';
    const phone = details.phones?.[0]?.number?.trim() ?? '';
    if (!name && !phone) return { status: 'cancelled' };
    return { status: 'picked', contact: { name, phone } };
  } catch {
    return { status: 'denied' };
  }
}
