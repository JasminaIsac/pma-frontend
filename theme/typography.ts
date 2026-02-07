import { TextStyle } from 'react-native';

// Folosim doar Baloo pentru titluri
export const fonts: { [key: string]: string } = {
  title: 'Baloo2_700Bold',
};

// Greutăți de font (opțional, nu mai sunt neapărat necesare)
export const fontWeights: { [key: string]: string } = {
  regular: '400',
  bold: '700',
};

// Mărimile de font standardizate
export const fontSizes: { [key: string]: number } = {
  xs: 10,
  sm: 12,
  md: 15,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 26,
  title: 42,
};

// Înălțimi de linie standardizate
export const lineHeights: { [key: string]: number } = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 34,
  title: 42,
};

export const textPresets: { [key: string]: TextStyle } = {
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.title,
    lineHeight: lineHeights.title,
  },

  headerLarge: {
    fontSize: fontSizes.xxl,
    marginBottom: 12,
    fontWeight: '800',
  },
  headerMedium: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSmall: {
    fontSize: fontSizes.md,
    marginBottom: 6,
    fontWeight: '700',
  },

  bodyLarge: {
    fontSize: fontSizes.lg,
  },
  bodyMedium: {
    fontSize: fontSizes.md,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
  },

  bodyLargeBold: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  bodyMediumBold: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  bodySmallBold: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },

  noData: {
    fontSize: fontSizes.md,
  },

  tag: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },

  button: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },

  caption: {
    fontSize: fontSizes.xs,
  },

  dayNumber: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
  },
};
