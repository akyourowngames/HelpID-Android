import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronRight,
  CloudOff,
  Database,
  FileDown,
  Languages,
  Share2,
} from 'lucide-react-native';
import { useProfile } from '../src/state/ProfileProvider';
import { useSettings } from '../src/state/SettingsProvider';
import { LOCALES } from '../src/i18n';
import { colors, fonts, radius, spacing } from '../src/theme/tokens';
import {
  Card,
  Divider,
  ScreenHeader,
  StatusPill,
  Text,
} from '../src/components/ui';
import { shareProfile } from '../src/lib/share';
import { exportProfilePdf } from '../src/lib/pdf';

export default function SettingsScreen() {
  const { profile, mode, online } = useProfile();
  const { t, locale } = useSettings();
  const insets = useSafeAreaInsets();
  const [exporting, setExporting] = useState(false);

  const currentLocale = LOCALES.find((item) => item.code === locale);
  const synced = mode === 'supabase';
  const syncText = synced ? (online ? t('backendOn') : t('offline')) : t('backendOff');

  const handleShare = () => {
    if (profile) shareProfile(profile).catch(() => undefined);
  };

  const handleExport = async () => {
    if (!profile || exporting) return;
    setExporting(true);
    try {
      const ok = await exportProfilePdf(profile);
      if (!ok) Alert.alert(t('exportPdf'), t('saveFailed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={t('settings')} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 24 + insets.bottom, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Row
            icon={<Languages size={18} color={colors.inkSoft} strokeWidth={1.9} />}
            title={t('languageRow')}
            subtitle={currentLocale?.native ?? 'English'}
            onPress={() => router.push('/language')}
          />
          <Divider style={{ marginLeft: 64 }} />
          <View style={styles.row}>
            <View style={styles.icon}>
              {synced ? (
                <Database size={18} color={colors.green} strokeWidth={1.9} />
              ) : (
                <CloudOff size={18} color={colors.muted} strokeWidth={1.9} />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.rowTitle}>{t('dataSection')}</Text>
              <Text variant="caption">{syncText}</Text>
            </View>
            <StatusPill
              label={synced ? 'Supabase' : t('demo')}
              tone={synced ? 'green' : 'muted'}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Row
            icon={<Share2 size={18} color={colors.inkSoft} strokeWidth={1.9} />}
            title={t('shareInfo')}
            subtitle={t('personalInfoSub')}
            onPress={handleShare}
          />
          <Divider style={{ marginLeft: 64 }} />
          <Row
            icon={<FileDown size={18} color={colors.inkSoft} strokeWidth={1.9} />}
            title={t('exportPdf')}
            subtitle="PDF"
            onPress={handleExport}
            loading={exporting}
          />
        </Card>

        <Text variant="caption" style={styles.privacy}>
          {t('privacyNote')}
        </Text>
        <Text variant="caption" style={styles.privacy}>
          {t('disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.icon}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text variant="caption">{subtitle}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.muted} />
      ) : (
        <ChevronRight size={18} color={colors.mutedSoft} strokeWidth={2} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 64,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  privacy: {
    paddingHorizontal: 4,
    marginTop: 2,
  },
});
