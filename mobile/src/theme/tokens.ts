import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  bg: '#0A0A0C',
  bgDeep: '#151518',
  surface: '#101013',
  raised: '#1B1B1F',
  ink: '#F4F2EE',
  inkSoft: '#CFCAC3',
  muted: '#8B8680',
  mutedSoft: '#66615B',
  line: '#232327',
  lineStrong: '#303035',
  red: '#E33B3B',
  redDark: '#B62424',
  redSoft: 'rgba(227, 59, 59, 0.14)',
  redBorder: 'rgba(227, 59, 59, 0.32)',
  green: '#7CC47F',
  greenSoft: 'rgba(124, 196, 127, 0.12)',
  greenBorder: 'rgba(124, 196, 127, 0.3)',
  amber: '#E0A94F',
  amberSoft: 'rgba(224, 169, 79, 0.12)',
  amberBorder: 'rgba(224, 169, 79, 0.3)',
  blue: '#7EA6C9',
  blueSoft: 'rgba(126, 166, 201, 0.12)',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.68)',
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

export const cardShadow: ViewStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.35,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 0,
};

export const textStyles: Record<string, TextStyle> = {
  display: {
    fontFamily: fonts.extrabold,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.2,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: colors.muted,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkSoft,
  },
};
