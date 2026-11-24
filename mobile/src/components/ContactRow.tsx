import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Copy, MessageSquare, Phone } from 'lucide-react-native';
import { EmergencyContact } from '../types';
import { colors, radius, spacing } from '../theme/tokens';
import { RoundIcon, Text } from './ui';
import { useSettings } from '../state/SettingsProvider';

export function ContactRow({
  contact,
  onCall,
  onSms,
  onCopy,
}: {
  contact: EmergencyContact;
  onCall: () => void;
  onSms: () => void;
  onCopy: () => void;
}) {
  const { t } = useSettings();
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(contact.name.trim()[0] ?? '?').toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="heading" style={{ fontSize: 15 }}>
          {contact.name || '\u2014'}
        </Text>
        <Text variant="caption" style={{ marginTop: 2 }}>
          {contact.phone}
        </Text>
      </View>
      <View style={styles.actions}>
        <RoundIcon
          label={t('call')}
          onPress={onCall}
          icon={<Phone size={16} color={colors.ink} strokeWidth={2.2} />}
        />
        <RoundIcon
          label={t('sms')}
          onPress={onSms}
          icon={<MessageSquare size={16} color={colors.ink} strokeWidth={2.2} />}
        />
        <RoundIcon
          label={t('copy')}
          onPress={onCopy}
          icon={<Copy size={15} color={colors.muted} strokeWidth={2.2} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkSoft,
    fontFamily: 'Manrope_700Bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
});
