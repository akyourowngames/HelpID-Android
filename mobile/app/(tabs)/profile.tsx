import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Check,
  Copy,
  MessageSquare,
  Phone,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useProfile } from '../../src/state/ProfileProvider';
import { useSettings } from '../../src/state/SettingsProvider';
import {
  BLOOD_GROUPS,
  EmergencyContact,
  isValidName,
  UserProfile,
} from '../../src/types';
import { colors, radius, spacing } from '../../src/theme/tokens';
import {
  Button,
  Card,
  Field,
  ScreenHeader,
  SectionLabel,
  Skeleton,
  Text,
} from '../../src/components/ui';
import { BloodGroupPicker } from '../../src/components/BloodGroupPicker';
import { TAB_BAR_SPACE } from '../../src/components/FloatingTabBar';
import { isValidPhone, normalizePhoneOrRaw, sanitizePhoneInput, toE164 } from '../../src/lib/phone';
import { pickContactFromDevice } from '../../src/lib/contacts';
import { dial, smsOne } from '../../src/lib/sos';

function ensurePairs(list: EmergencyContact[]): EmergencyContact[] {
  const next = [...list];
  while (next.length < 2) next.push({ name: '', phone: '' });
  return next;
}

function splitLines(value: string): string[] {
  return value
    .replace(/,/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ProfileScreen() {
  const { profile, ready, save, saving } = useProfile();
  const { t, locale } = useSettings();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [blood, setBlood] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '' },
    { name: '', phone: '' },
  ]);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile || hydratedFor === profile.userId) return;
    setName(profile.name);
    setBlood(profile.bloodGroup);
    setAddress(profile.address);
    setAllergies(profile.allergies.join('\n'));
    setNotes(profile.medicalNotes.join('\n'));
    setContacts(ensurePairs(profile.emergencyContacts));
    setHydratedFor(profile.userId);
  }, [profile, hydratedFor]);

  const contactRows = useMemo(
    () => contacts.map((contact) => {
      const hasName = contact.name.trim().length > 0;
      const hasPhone = contact.phone.trim().length > 0;
      const nameError = hasName
        ? isValidName(contact.name)
          ? null
          : t('nameInvalid')
        : hasPhone
          ? t('required')
          : null;
      const phoneError = hasPhone
        ? isValidPhone(contact.phone)
          ? null
          : t('phoneInvalid')
        : null;
      return { ...contact, nameError, phoneError, hasName, hasPhone };
    }),
    [contacts, t],
  );

  const validContacts = useMemo(
    () =>
      contactRows.filter(
        (contact) =>
          (contact.hasName || contact.hasPhone) &&
          !contact.nameError &&
          !contact.phoneError,
      ),
    [contactRows],
  );

  const nameError = isValidName(name) ? null : t('nameInvalid');
  const bloodError = (BLOOD_GROUPS as readonly string[]).includes(blood)
    ? null
    : t('bloodInvalid');
  const isFormValid =
    !nameError &&
    !bloodError &&
    contactRows.every(
      (contact) =>
        (!contact.hasName && !contact.hasPhone) ||
        (!contact.nameError && !contact.phoneError),
    );

  const updateContact = (index: number, patch: Partial<EmergencyContact>) => {
    setContacts((current) =>
      current.map((contact, i) => (i === index ? { ...contact, ...patch } : contact)),
    );
  };

  const handlePick = async (index: number) => {
    const result = await pickContactFromDevice();
    if (result.status === 'denied') {
      Alert.alert(t('pickFromContacts'), t('permissionContacts'));
      return;
    }
    if (result.status !== 'picked') return;
    updateContact(index, {
      name: result.contact.name.slice(0, 40),
      phone: normalizePhoneOrRaw(result.contact.phone),
    });
    Haptics.selectionAsync().catch(() => undefined);
  };

  const handleSave = async () => {
    if (!profile || !isFormValid) return;
    const next: UserProfile = {
      userId: profile.userId,
      name: name.trim(),
      bloodGroup: blood,
      address: address.trim().slice(0, 120),
      allergies: splitLines(allergies),
      medicalNotes: splitLines(notes),
      emergencyContacts: validContacts.map((contact) => ({
        name: contact.name.trim(),
        phone: toE164(contact.phone) ?? sanitizePhoneInput(contact.phone),
      })),
      language: locale,
      lastUpdated: Date.now(),
    };
    const result = await save(next).catch(() => null);
    if (!result) {
      Alert.alert(t('save'), t('saveFailed'));
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  if (!ready || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title={t('profileTab')} subtitle={t('updateEmergencyInfo')} />
        <View style={{ padding: 18, gap: 16 }}>
          <Skeleton height={260} radiusValue={20} />
          <Skeleton height={180} radiusValue={20} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 72 + insets.bottom }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title={t('profileTab')} subtitle={t('updateEmergencyInfo')} />

          <View style={styles.body}>
            <Card style={{ gap: 14 }}>
              <SectionLabel>{t('sectionPersonal')}</SectionLabel>
              <Field
                label={t('fullName')}
                value={name}
                onChangeText={(value) => setName(value.slice(0, 40))}
                placeholder={t('fullName')}
                autoCapitalize="words"
                error={nameError}
              />
              <View style={{ gap: spacing.sm }}>
                <BloodGroupPicker value={blood} onChange={setBlood} />
                {bloodError ? (
                  <Text variant="caption" style={{ color: colors.red }}>
                    {bloodError}
                  </Text>
                ) : null}
              </View>
              <Field
                label={t('address')}
                value={address}
                onChangeText={(value) => setAddress(value.slice(0, 120))}
                placeholder={t('address')}
              />
            </Card>

            <Card style={{ gap: 14 }}>
              <SectionLabel>{t('sectionMedical')}</SectionLabel>
              <Field
                label={t('allergies')}
                value={allergies}
                onChangeText={setAllergies}
                placeholder={t('allergiesPlaceholder')}
                helper={t('onePerLine')}
                multiline
              />
              <Field
                label={t('medicalConditions')}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('notesPlaceholder')}
                helper={t('onePerLine')}
                multiline
              />
            </Card>

            <Card style={{ gap: spacing.md }}>
              <View style={styles.cardHeader}>
                <SectionLabel>{t('sectionContacts')}</SectionLabel>
                <Text variant="caption">
                  {t('totalContacts', { count: validContacts.length })}
                </Text>
              </View>

              {contacts.map((contact, index) => (
                <View key={index} style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <Text variant="caption" style={{ fontFamily: 'Manrope_700Bold', color: colors.inkSoft }}>
                      {t('contact', { n: index + 1 })}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      {isValidPhone(contact.phone) ? (
                        <>
                          <Pressable
                            onPress={() => dial(contact.phone).catch(() => undefined)}
                            hitSlop={6}
                            accessibilityLabel="Call contact"
                            style={styles.contactAction}
                          >
                            <Phone size={13} color={colors.inkSoft} strokeWidth={2.1} />
                          </Pressable>
                          <Pressable
                            onPress={() => smsOne(contact.phone, '').catch(() => undefined)}
                            hitSlop={6}
                            accessibilityLabel="Message contact"
                            style={styles.contactAction}
                          >
                            <MessageSquare size={13} color={colors.inkSoft} strokeWidth={2.1} />
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              Clipboard.setStringAsync(contact.phone).catch(() => undefined);
                              Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Success,
                              ).catch(() => undefined);
                            }}
                            hitSlop={6}
                            accessibilityLabel="Copy contact number"
                            style={styles.contactAction}
                          >
                            <Copy size={12} color={colors.muted} strokeWidth={2.1} />
                          </Pressable>
                        </>
                      ) : null}
                      <Pressable
                        onPress={() => handlePick(index)}
                        hitSlop={8}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      >
                        <Users size={14} color={colors.ink} strokeWidth={2.1} />
                        <Text variant="caption" style={{ color: colors.ink, fontFamily: 'Manrope_700Bold' }}>
                          {t('pickForContact')}
                        </Text>
                      </Pressable>
                      {contacts.length > 2 ? (
                        <Pressable
                          onPress={() =>
                            setContacts((current) => ensurePairs(current.filter((_, i) => i !== index)))
                          }
                          hitSlop={8}
                        >
                          <Trash2 size={16} color={colors.muted} strokeWidth={2} />
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                  <Field
                    value={contact.name}
                    onChangeText={(value) => updateContact(index, { name: value.slice(0, 40) })}
                    placeholder={t('fullName')}
                    autoCapitalize="words"
                    error={contactRows[index]?.nameError}
                  />
                  <Field
                    value={contact.phone}
                    onChangeText={(value) => updateContact(index, { phone: sanitizePhoneInput(value) })}
                    placeholder={t('phone')}
                    keyboardType="phone-pad"
                    error={contactRows[index]?.phoneError}
                  />
                </View>
              ))}

              <Button
                label={t('addContact')}
                variant="outline"
                compact
                onPress={() => setContacts((current) => [...current, { name: '', phone: '' }])}
                icon={<UserPlus size={15} color={colors.ink} strokeWidth={2.2} />}
              />
            </Card>

            <Button
              label={saving ? t('saving') : saved ? t('savedShort') : t('saveShort')}
              variant={saved ? 'success' : 'ink'}
              onPress={handleSave}
              disabled={!isFormValid || saving}
              loading={saving}
              icon={
                saved ? (
                  <Check size={16} color={colors.green} strokeWidth={2.6} />
                ) : undefined
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    paddingHorizontal: 18,
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactCard: {
    backgroundColor: colors.bgDeep,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactAction: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
