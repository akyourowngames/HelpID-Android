import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { cardShadow, colors, fonts, radius, spacing, textStyles } from '../theme/tokens';

type Variant = keyof typeof textStyles;

export function Text({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  return <RNText {...rest} style={[textStyles[variant], style]} />;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="label" style={styles.sectionLabel}>
      {children}
    </Text>
  );
}

type ButtonVariant = 'primary' | 'ink' | 'outline' | 'soft' | 'ghost' | 'success';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
  compact,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const palette = buttonPalettes[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && !isDisabled && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        isDisabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <>
          {icon}
          <RNText
            numberOfLines={1}
            style={[styles.buttonText, { color: palette.text }, compact && { fontSize: 13 }]}
          >
            {label}
          </RNText>
        </>
      )}
    </Pressable>
  );
}

function RoundIcon({
  icon,
  onPress,
  label,
  tone = 'default',
}: {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.roundIcon,
        tone === 'danger' && { backgroundColor: colors.redSoft, borderColor: colors.redBorder },
        pressed && { opacity: 0.7 },
      ]}
    >
      {icon}
    </Pressable>
  );
}

export { RoundIcon };

export function Field({
  label,
  error,
  helper,
  multiline,
  style,
  right,
  ...props
}: TextInputProps & {
  label?: string;
  error?: string | null;
  helper?: string;
  multiline?: boolean;
  style?: StyleProp<TextStyle>;
  right?: React.ReactNode;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <View>
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.mutedSoft}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            !!error && { borderColor: colors.red },
            Boolean(right) && { paddingRight: 46 },
            style,
          ]}
        />
        {right ? <View style={styles.inputRight}>{right}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" style={{ color: colors.red }}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption">{helper}</Text>
      ) : null}
    </View>
  );
}

export function StatusPill({
  label,
  tone,
  dot = true,
}: {
  label: string;
  tone: 'green' | 'amber' | 'red' | 'muted';
  dot?: boolean;
}) {
  const tones = {
    green: { bg: colors.greenSoft, fg: colors.green },
    amber: { bg: colors.amberSoft, fg: colors.amber },
    red: { bg: colors.redSoft, fg: colors.red },
    muted: { bg: colors.bgDeep, fg: colors.muted },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: tones.bg }]}>
      {dot ? <View style={[styles.pillDot, { backgroundColor: tones.fg }]} /> : null}
      <RNText style={[styles.pillText, { color: tones.fg }]}>{label}</RNText>
    </View>
  );
}

export function Skeleton({
  height,
  width,
  radiusValue = radius.md,
  style,
}: {
  height: number;
  width?: number | `${number}%`;
  radiusValue?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useSharedValue(0.45);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress]);
  const animated = useAnimatedStyle(() => ({ opacity: progress.value }));
  return (
    <Animated.View
      style={[
        {
          height,
          width: width ?? '100%',
          borderRadius: radiusValue,
          backgroundColor: colors.line,
        },
        animated,
        style,
      ]}
    />
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.ink }}>{'\u2190'}</RNText>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text variant="title">{title}</Text>
          {subtitle ? (
            <Text variant="caption" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
}

const buttonPalettes: Record<
  ButtonVariant,
  { bg: string; text: string; border: string }
> = {
  primary: { bg: colors.red, text: colors.white, border: colors.red },
  ink: { bg: colors.raised, text: colors.ink, border: colors.lineStrong },
  outline: { bg: colors.raised, text: colors.ink, border: colors.line },
  soft: { bg: colors.bgDeep, text: colors.ink, border: colors.bgDeep },
  ghost: { bg: 'transparent', text: colors.muted, border: 'transparent' },
  success: { bg: colors.greenSoft, text: colors.green, border: colors.greenBorder },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    ...cardShadow,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    width: '100%',
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 11,
  },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonCompact: {
    minHeight: 42,
    borderRadius: radius.sm,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  roundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputRight: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  screenHeader: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
