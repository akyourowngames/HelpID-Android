import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  BellRing,
  ChevronRight,
  ClipboardList,
  Phone,
  QrCode,
  Settings,
  Siren,
  UserRound,
} from 'lucide-react-native';
import { useProfile } from '../../src/state/ProfileProvider';
import { useSettings } from '../../src/state/SettingsProvider';
import { profileIsReady } from '../../src/types';
import { colors, fonts, radius, spacing } from '../../src/theme/tokens';
import { Button, Skeleton, Text } from '../../src/components/ui';
import { SosSheet } from '../../src/components/SosSheet';
import { TAB_BAR_SPACE } from '../../src/components/FloatingTabBar';
import { resolveEmergencyNumber } from '../../src/lib/emergencyNumbers';
import { dial, emergencyPhones } from '../../src/lib/sos';
import { cancelFollowUps, followUpsActive } from '../../src/lib/notifications';

export default function IdScreen() {
  const { profile, ready, refresh } = useProfile();
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const emergencyNumber = useMemo(() => resolveEmergencyNumber(), []);
  const [sosVisible, setSosVisible] = useState(false);
  const [followUpOn, setFollowUpOn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      followUpsActive()
        .then((value) => {
          if (active) setFollowUpOn(value);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const askForProfile = (message: string) => {
    Alert.alert(t('sosBlockedTitle'), message, [
      { text: t('close'), style: 'cancel' },
      { text: t('goToProfile'), onPress: () => router.navigate('/(tabs)/profile') },
    ]);
  };

  const handleSos = () => {
    if (!profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (emergencyPhones(profile).length === 0) {
      askForProfile(t('sosNoContacts'));
      return;
    }
    if (!profileIsReady(profile)) {
      askForProfile(t('sosBlockedBody'));
      return;
    }
    setSosVisible(true);
  };

  const handleStopFollowUps = async () => {
    await cancelFollowUps();
    setFollowUpOn(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
  };

  if (!ready || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: 18, gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton height={36} width={140} />
            <Skeleton height={40} width={40} radiusValue={20} />
          </View>
          <Skeleton height={40} width="65%" radiusValue={12} />
          <Skeleton height={34} width={160} radiusValue={17} />
          <Skeleton height={176} radiusValue={24} />
          <Skeleton height={52} radiusValue={14} />
          <Skeleton height={72} radiusValue={20} />
        </View>
      </SafeAreaView>
    );
  }

  const readyForSos = profileIsReady(profile);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.muted}
          />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Siren size={18} color={colors.white} strokeWidth={2.4} />
            </View>
            <Text style={styles.brandText}>{t('appName')}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel={t('settings')}
            style={({ pressed }) => [styles.gearButton, pressed && { opacity: 0.7 }]}
          >
            <Settings size={19} color={colors.inkSoft} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text variant="label">{t('emergencyId')}</Text>
            <Text variant="display" numberOfLines={2}>
              {profile.name || t('emergencyProfile')}
            </Text>
            <Pressable
              onPress={() => router.navigate('/(tabs)/profile')}
              style={({ pressed }) => [
                styles.statusChip,
                { borderColor: readyForSos ? colors.greenBorder : colors.amberBorder },
                pressed && { opacity: 0.75 },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: readyForSos ? colors.green : colors.amber },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: readyForSos ? colors.green : colors.amber },
                ]}
              >
                {readyForSos ? t('profileReady') : t('profileIncompleteChip')}
              </Text>
              <ChevronRight
                size={13}
                color={readyForSos ? colors.green : colors.amber}
                strokeWidth={2.4}
              />
            </Pressable>
          </View>
          <View style={styles.avatar}>
            <UserRound size={30} color={colors.mutedSoft} strokeWidth={1.6} />
          </View>
        </View>

        <View style={styles.body}>
          <Pressable
            onPress={handleSos}
            accessibilityRole="button"
            accessibilityLabel={t('sendSos')}
            style={({ pressed }) => [styles.sosCard, pressed && { opacity: 0.92 }]}
          >
            <LinearGradient
              colors={['#3A0D0D', '#17090A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sosGradient}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.sosTitle}>SOS</Text>
                <Text style={styles.sosSubtitle}>{t('sosCardSubtitle')}</Text>
              </View>
              <View style={styles.sosGlow}>
                <View style={styles.sosButton}>
                  <BellRing size={26} color={colors.white} strokeWidth={2.1} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          <View style={styles.quickRow}>
            <Button
              label={`${t('call')} ${emergencyNumber}`}
              variant="ink"
              onPress={() => dial(emergencyNumber).catch(() => undefined)}
              icon={<Phone size={17} color={colors.ink} strokeWidth={2.2} />}
              style={{ flex: 1, height: 56 }}
            />
            <Button
              label={t('showQr')}
              variant="ink"
              onPress={() => router.navigate('/(tabs)/qr')}
              icon={<QrCode size={17} color={colors.ink} strokeWidth={2.2} />}
              style={{ flex: 1, height: 56 }}
            />
          </View>

          {followUpOn ? (
            <View style={styles.followBanner}>
              <Text variant="caption" style={{ color: colors.amber, flex: 1 }}>
                {t('followUpActive')}
              </Text>
              <Pressable onPress={handleStopFollowUps} hitSlop={8}>
                <Text
                  variant="caption"
                  style={{ color: colors.ink, fontFamily: fonts.bold }}
                >
                  {t('stopFollowUps')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable
            onPress={() => router.navigate('/(tabs)/profile')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.infoRow, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.infoIcon}>
              <ClipboardList size={19} color={colors.inkSoft} strokeWidth={1.9} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.infoTitle}>{t('sectionPersonal')}</Text>
              <Text variant="caption">{t('personalInfoSub')}</Text>
            </View>
            <ChevronRight size={18} color={colors.mutedSoft} strokeWidth={2} />
          </Pressable>
        </View>
      </ScrollView>

      <SosSheet
        visible={sosVisible}
        profile={profile}
        onClose={() => setSosVisible(false)}
        onFollowUpsChange={setFollowUpOn}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 26,
  },
  heroLeft: {
    flex: 1,
    gap: 5,
  },
  statusChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  body: {
    paddingHorizontal: 18,
    gap: 20,
  },
  sosCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(227, 59, 59, 0.24)',
    overflow: 'hidden',
  },
  sosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 20,
    minHeight: 168,
  },
  sosTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -2,
    color: colors.white,
  },
  sosSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.62)',
    marginTop: 6,
    maxWidth: 195,
  },
  sosGlow: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(227, 59, 59, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.red,
    shadowOpacity: 0.65,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  followBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.amberSoft,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 12,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
});
