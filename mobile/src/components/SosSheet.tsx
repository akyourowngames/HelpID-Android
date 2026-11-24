import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  Check,
  Copy,
  Phone,
  Share2,
  ShieldAlert,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { UserProfile } from '../types';
import { colors, radius, spacing } from '../theme/tokens';
import { Button, Card, Text } from './ui';
import { useSettings } from '../state/SettingsProvider';
import { getSosLocation } from '../lib/location';
import {
  buildSosMessage,
  dial,
  emergencyPhones,
  openSmsHandoff,
  SosDelivery,
} from '../lib/sos';
import {
  ensureNotificationPermission,
  notifySosDelivered,
  scheduleFollowUps,
} from '../lib/notifications';
import { shareMessage } from '../lib/share';
import { resolveEmergencyNumber } from '../lib/emergencyNumbers';

type Phase = 'countdown' | 'preparing' | 'handoff' | 'done';

const COUNTDOWN_SECONDS = 5;
const ESCALATION_SECONDS = 30;

export function SosSheet({
  visible,
  profile,
  onClose,
  onFollowUpsChange,
}: {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
  onFollowUpsChange?: (active: boolean) => void;
}) {
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const emergencyNumber = useMemo(() => resolveEmergencyNumber(), []);
  const phones = useMemo(() => emergencyPhones(profile), [profile]);

  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [escalation, setEscalation] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [locationDenied, setLocationDenied] = useState(false);
  const [delivery, setDelivery] = useState<SosDelivery | null>(null);
  const [followUps, setFollowUps] = useState(0);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    startedRef.current = false;
    setPhase('countdown');
    setCountdown(COUNTDOWN_SECONDS);
    setEscalation(null);
    setMessage('');
    setDelivery(null);
    setFollowUps(0);
    setLocationDenied(false);
    setBusy(false);
    setCopied(false);
  }, [visible]);

  const complete = useCallback(
    async (result: SosDelivery) => {
      setDelivery(result);
      setPhase('done');
      setEscalation(ESCALATION_SECONDS);
      notifySosDelivered(t('sosSentTitle'), t('sosSentBody'));
      const count = await scheduleFollowUps(t('followUpTitle'), t('followUpBody'));
      setFollowUps(count);
      onFollowUpsChange?.(count > 0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    },
    [t, onFollowUpsChange],
  );

  const begin = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setPhase('preparing');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);

    const location = await getSosLocation();
    setLocationDenied(location.denied);
    const composed = buildSosMessage(profile, location.coordinates);
    setMessage(composed);
    await ensureNotificationPermission();
    setPhase('handoff');
  }, [profile]);

  const startHandoff = useCallback(async () => {
    if (busy || !message) return;
    setBusy(true);
    try {
      const result = await openSmsHandoff(phones, message);
      setDelivery(result);
      if (result === 'sent' || result === 'shared') {
        await complete(result);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, message, phones, complete]);

  useEffect(() => {
    if (!visible || phase !== 'countdown') return;
    if (countdown <= 0) {
      begin().catch(() => undefined);
      return;
    }
    const timer = setTimeout(() => {
      Haptics.selectionAsync().catch(() => undefined);
      setCountdown((value) => value - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [visible, phase, countdown, begin]);

  useEffect(() => {
    if (!visible || escalation === null) return;
    if (escalation <= 0) {
      setEscalation(null);
      dial(emergencyNumber).catch(() => undefined);
      return;
    }
    const timer = setTimeout(() => {
      setEscalation((value) => (value === null ? null : value - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [visible, escalation, emergencyNumber]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const ringSize = 188;
  const ringStroke = 9;
  const ringRadius = (ringSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const progress = countdown / COUNTDOWN_SECONDS;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={phase === 'countdown' ? onClose : undefined}
        />
        <View
          style={[
            styles.sheet,
            {
              maxHeight: height * 0.92,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.iconBadge}>
                <ShieldAlert size={18} color={colors.red} strokeWidth={2.2} />
              </View>
              <View>
                <Text variant="heading">{t('emergencyId')}</Text>
                <Text variant="caption">
                  {t('totalContacts', { count: phones.length })}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel={t('close')}>
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xs }}
            showsVerticalScrollIndicator={false}
          >
          {phase === 'countdown' ? (
            <View style={styles.center}>
              <View style={{ width: ringSize, height: ringSize }}>
                <Svg width={ringSize} height={ringSize}>
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    stroke={colors.redSoft}
                    strokeWidth={ringStroke}
                    fill="none"
                  />
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    stroke={colors.red}
                    strokeWidth={ringStroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circumference * (1 - progress)}
                    transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  />
                </Svg>
                <View style={styles.ringInner}>
                  <Text style={styles.countdownNumber}>{countdown}</Text>
                  <Text variant="label">SOS</Text>
                </View>
              </View>
              <Text variant="title" style={{ marginTop: spacing.md }}>
                {t('sosCountdown', { seconds: countdown })}
              </Text>
              <Text variant="body" style={styles.centerText}>
                {t('sosHandoffBody')}
              </Text>
              <Button
                label={t('cancelSos')}
                variant="outline"
                onPress={onClose}
                style={{ alignSelf: 'stretch', marginTop: spacing.sm }}
              />
            </View>
          ) : null}

          {phase === 'preparing' ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.red} />
              <Text variant="heading" style={{ marginTop: spacing.lg }}>
                {t('sosPreparing')}
              </Text>
              <Text variant="caption" style={{ marginTop: 6 }}>
                {t('keepAppOpen')}
              </Text>
            </View>
          ) : null}

          {phase === 'handoff' ? (
            <View style={{ gap: spacing.md }}>
              <View>
                <Text variant="title">{t('sosHandoffTitle')}</Text>
                <Text variant="body" style={{ marginTop: 4 }}>
                  {t('sosHandoffBody')}
                </Text>
              </View>
              {locationDenied ? (
                <Text variant="caption" style={{ color: colors.amber }}>
                  {t('locationDenied')}
                </Text>
              ) : null}
              <Card style={styles.messageCard}>
                <Text variant="label">{t('messagePreview')}</Text>
                <Text variant="mono" selectable style={{ marginTop: 6 }}>
                  {message}
                </Text>
              </Card>
              <Button
                label={t('openSms')}
                onPress={startHandoff}
                loading={busy}
                icon={<Phone size={17} color={colors.white} strokeWidth={2.2} />}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  label={t('shareInstead')}
                  variant="outline"
                  onPress={() => shareMessage(message).catch(() => undefined)}
                  icon={<Share2 size={15} color={colors.ink} />}
                  style={{ flex: 1 }}
                  compact
                />
                <Button
                  label={copied ? t('copied') : t('copyMessage')}
                  variant="soft"
                  onPress={handleCopy}
                  icon={<Copy size={15} color={colors.ink} />}
                  style={{ flex: 1 }}
                  compact
                />
              </View>
              <Text variant="caption">{t('handoffNote')}</Text>
              {delivery === 'cancelled' ? (
                <Text variant="caption" style={{ color: colors.amber }}>
                  {t('smsCancelledNote')}
                </Text>
              ) : null}
            </View>
          ) : null}

          {phase === 'done' ? (
            <View style={{ gap: spacing.md }}>
              <View style={styles.doneBadge}>
                <Check size={26} color={colors.white} strokeWidth={3} />
              </View>
              <View>
                <Text variant="title">{t('sosSentTitle')}</Text>
                <Text variant="body" style={{ marginTop: 4 }}>
                  {t('sosSentBody')}
                </Text>
              </View>

              {followUps > 0 ? (
                <View style={styles.noteRow}>
                  <View style={styles.dotGreen} />
                  <Text variant="caption" style={{ flex: 1, color: colors.green }}>
                    {t('followUpCount', { count: followUps })}
                  </Text>
                </View>
              ) : (
                <Text variant="caption" style={{ color: colors.amber }}>
                  {t('notificationsDenied')}
                </Text>
              )}

              {escalation !== null ? (
                <Card style={[styles.escalation, { backgroundColor: colors.amberSoft, borderColor: colors.amberBorder }]}>
                  <Text variant="caption" style={{ color: colors.amber }}>
                    {t('autoCallIn', { number: emergencyNumber, seconds: escalation })}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                    <Button
                      label={t('callNow')}
                      variant="ink"
                      compact
                      onPress={() => dial(emergencyNumber).catch(() => undefined)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label={t('cancelAutoCall')}
                      variant="soft"
                      compact
                      onPress={() => setEscalation(null)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              ) : null}

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  label={t('shareSos')}
                  variant="outline"
                  onPress={() => shareMessage(message).catch(() => undefined)}
                  icon={<Share2 size={15} color={colors.ink} />}
                  style={{ flex: 1 }}
                  compact
                />
                <Button
                  label={copied ? t('copied') : t('copyMessage')}
                  variant="soft"
                  onPress={handleCopy}
                  icon={<Copy size={15} color={colors.ink} />}
                  style={{ flex: 1 }}
                  compact
                />
              </View>
              <Button label={t('done')} variant="ink" onPress={onClose} />
            </View>
          ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    gap: 4,
  },
  centerText: {
    textAlign: 'center',
    maxWidth: 300,
  },
  ringInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 58,
    lineHeight: 62,
    color: colors.ink,
    letterSpacing: -2,
  },
  messageCard: {
    backgroundColor: colors.bgDeep,
    borderColor: colors.line,
    padding: spacing.md,
  },
  doneBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  escalation: {
    padding: spacing.md,
  },
});
