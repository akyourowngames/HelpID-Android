import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { QrCode, Siren, UserRound } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { colors, radius } from '../theme/tokens';
import { useSettings } from '../state/SettingsProvider';

const ICONS = {
  index: Siren,
  qr: QrCode,
  profile: UserRound,
} as const;

export function FloatingTabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const { t } = useSettings();

  const labels: Record<string, string> = {
    index: t('idTab'),
    qr: t('qrTab'),
    profile: t('profileTab'),
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = ICONS[route.name as keyof typeof ICONS] ?? Siren;
          const label = labels[route.name] ?? route.name;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={() => {
                Haptics.selectionAsync().catch(() => undefined);
                navigateToTab(route.key);
              }}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
            >
              <Icon
                size={22}
                strokeWidth={focused ? 2.3 : 1.9}
                color={focused ? colors.red : colors.muted}
              />
              <View style={[styles.dot, focused && styles.dotActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const TAB_BAR_SPACE = 92;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    height: 58,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: colors.red,
  },
});
