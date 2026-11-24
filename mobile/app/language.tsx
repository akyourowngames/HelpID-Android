import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useSettings } from '../src/state/SettingsProvider';
import { LOCALES, Locale } from '../src/i18n';
import { colors, radius, spacing } from '../src/theme/tokens';
import { Button, Card, ScreenHeader, Text } from '../src/components/ui';

export default function LanguageScreen() {
  const { locale, setLocale, t } = useSettings();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Locale>(locale);

  const apply = async () => {
    await setLocale(selected);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={t('selectLanguage')}
        subtitle={t('chooseLanguage')}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 24 + insets.bottom, gap: spacing.md }}>
        {LOCALES.map((item) => {
          const active = item.code === selected;
          return (
            <Pressable
              key={item.code}
              onPress={() => setSelected(item.code)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="heading" style={{ fontSize: 16 }}>
                  {item.native}
                </Text>
                <Text variant="caption">{item.label}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <Check size={13} color={colors.white} strokeWidth={3} /> : null}
              </View>
            </Pressable>
          );
        })}

        <Card style={{ backgroundColor: colors.bgDeep, padding: spacing.md }}>
          <Text variant="caption">{t('forMedicalEmergencies')}</Text>
        </Card>

        <Button label={t('apply')} onPress={apply} style={{ marginTop: spacing.sm }} />
        <Button label={t('back')} variant="ghost" compact onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionActive: {
    borderColor: colors.redBorder,
    backgroundColor: colors.redSoft,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
});
