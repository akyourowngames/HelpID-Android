import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Copy, Link2, RefreshCw, Share2, WifiOff } from 'lucide-react-native';
import { useProfile } from '../../src/state/ProfileProvider';
import { useSettings } from '../../src/state/SettingsProvider';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { Button, Card, Skeleton, Text, ScreenHeader } from '../../src/components/ui';
import { TAB_BAR_SPACE } from '../../src/components/FloatingTabBar';
import { buildOfflineQr } from '../../src/lib/qr';
import { mintPublicLink } from '../../src/lib/profileStore';
import { backendConfigured } from '../../src/lib/supabase';

type Mode = 'link' | 'offline';

export default function QrScreen() {
  const { profile, ready } = useProfile();
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const shotRef = useRef<ViewShotRef>(null);
  const modeTouched = useRef(false);

  const [mode, setMode] = useState<Mode>('offline');
  const [link, setLink] = useState('');
  const [minting, setMinting] = useState(backendConfigured);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const mint = useCallback(async () => {
    if (!backendConfigured) return;
    setMinting(true);
    setError(false);
    const result = await mintPublicLink();
    setMinting(false);
    if (result) {
      setLink(result.url);
      if (!modeTouched.current) setMode('link');
    } else {
      setError(true);
      if (!modeTouched.current) setMode('offline');
    }
  }, []);

  useEffect(() => {
    mint().catch(() => undefined);
  }, [mint]);

  const offlineContent = useMemo(
    () => (profile ? buildOfflineQr(profile) : ''),
    [profile],
  );
  const content = mode === 'link' && link ? link : offlineContent;
  const qrSize = Math.min(width - 132, 236);

  const selectMode = (next: Mode) => {
    modeTouched.current = true;
    setMode(next);
  };

  const handleCopy = async () => {
    if (!content) return;
    await Clipboard.setStringAsync(content);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    setTimeout(() => setCopied(false), 1600);
  };

  const handleShare = async () => {
    if (!content) return;
    try {
      const available = await Sharing.isAvailableAsync();
      const uri = await shotRef.current?.capture?.();
      if (available && uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: mode === 'link' ? t('shareLink') : t('shareCard'),
          UTI: 'public.png',
        });
        return;
      }
    } catch {
      // fall back to text
    }
    await Share.share({
      message: mode === 'link' ? `${t('scanThisCode')}\n${content}` : offlineContent,
    });
  };

  if (!ready || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title={t('emergencyAccess')} subtitle={t('scanToView')} />
        <View style={{ padding: 18, gap: 16 }}>
          <Skeleton height={330} radiusValue={20} />
          <Skeleton height={80} radiusValue={20} />
        </View>
      </SafeAreaView>
    );
  }

  const usingLink = mode === 'link' && Boolean(link);
  const statusLabel = minting
    ? t('creatingLink')
    : usingLink
      ? t('secureLinkReady')
      : error
        ? t('secureUnavailable')
        : t('offlineCard');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 48 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t('emergencyAccess')} subtitle={t('scanToView')} />

        <View style={styles.body}>
          {backendConfigured ? (
            <View style={styles.segment}>
              <Pressable
                disabled={!link}
                onPress={() => selectMode('link')}
                style={[
                  styles.segmentItem,
                  usingLink && styles.segmentActive,
                  !link && { opacity: 0.35 },
                ]}
              >
                <Link2 size={13} color={usingLink ? colors.bg : colors.muted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: usingLink ? colors.bg : colors.muted },
                  ]}
                >
                  {t('secureLink')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => selectMode('offline')}
                style={[styles.segmentItem, !usingLink && styles.segmentActive]}
              >
                <WifiOff size={13} color={!usingLink ? colors.bg : colors.muted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: !usingLink ? colors.bg : colors.muted },
                  ]}
                >
                  {t('offlineCard')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Card style={styles.qrCard}>
            <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
              <View style={styles.qrWhite}>
                <QRCode
                  value={content || 'HelpID'}
                  size={qrSize}
                  color="#0A0A0C"
                  backgroundColor="#FFFFFF"
                />
              </View>
            </ViewShot>

            <View style={styles.statusRow}>
              {minting ? (
                <ActivityIndicator size="small" color={colors.muted} />
              ) : (
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: usingLink
                        ? colors.green
                        : error
                          ? colors.amber
                          : colors.mutedSoft,
                    },
                  ]}
                />
              )}
              <Text variant="caption" style={styles.statusText}>
                {statusLabel}
              </Text>
              {error && !minting ? (
                <Pressable
                  onPress={() => mint().catch(() => undefined)}
                  hitSlop={8}
                  style={styles.retryLink}
                >
                  <RefreshCw size={12} color={colors.ink} />
                  <Text variant="caption" style={{ color: colors.ink, fontFamily: 'Manrope_700Bold' }}>
                    {t('retry')}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <Text variant="caption" style={styles.qrNote}>
              {usingLink ? t('secureQrNote') : t('offlineQrNote')}
            </Text>
          </Card>

          <View style={styles.actionRow}>
            <Button
              label={usingLink ? t('shareLink') : t('shareCard')}
              variant="ink"
              compact
              onPress={handleShare}
              icon={<Share2 size={15} color={colors.ink} />}
              style={{ flex: 1 }}
            />
            <Button
              label={copied ? t('copied') : usingLink ? t('copyLink') : t('copyData')}
              variant="outline"
              compact
              onPress={handleCopy}
              icon={<Copy size={15} color={colors.ink} />}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
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
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.bgDeep,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  segmentText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  qrCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  qrWhite: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    textAlign: 'center',
  },
  retryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 4,
  },
  qrNote: {
    textAlign: 'center',
    maxWidth: 300,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
