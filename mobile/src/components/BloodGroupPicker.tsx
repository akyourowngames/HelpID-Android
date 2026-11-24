import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown } from 'lucide-react-native';
import { BLOOD_GROUPS } from '../types';
import { colors, fonts, radius, spacing } from '../theme/tokens';
import { SectionLabel, Text } from './ui';
import { useSettings } from '../state/SettingsProvider';

export function BloodGroupPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { t } = useSettings();

  return (
    <View style={{ gap: 8 }}>
      <SectionLabel>{t('bloodGroup')}</SectionLabel>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.field, pressed && { opacity: 0.75 }]}
      >
        <Text
          style={[
            styles.fieldText,
            !value && { color: colors.mutedSoft, fontFamily: fonts.medium },
          ]}
        >
          {value || t('selectBloodGroup')}
        </Text>
        <ChevronDown size={18} color={colors.muted} strokeWidth={2.1} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.handle} />
            <Text variant="heading">{t('bloodGroup')}</Text>
            <View style={styles.grid}>
              {BLOOD_GROUPS.map((group) => {
                const active = value === group;
                return (
                  <Pressable
                    key={group}
                    onPress={() => {
                      onChange(group);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      active && styles.optionActive,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={[styles.optionText, active && { color: colors.white }]}>
                      {group}
                    </Text>
                    {active ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    width: '23%',
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  optionActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  optionText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
  },
});
