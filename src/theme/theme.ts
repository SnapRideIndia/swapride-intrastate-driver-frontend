import { MD3LightTheme as DefaultPaperTheme } from 'react-native-paper';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import { DefaultTheme as DefaultNavigationTheme } from '@react-navigation/native';
import { colors } from './colors';

export const paperTheme = {
  ...DefaultPaperTheme,
  colors: {
    ...DefaultPaperTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    outline: colors.border,
    error: colors.error,
    onSurface: colors.textPrimary,
  },
};

export const navigationTheme: NavigationTheme = {
  ...DefaultNavigationTheme,
  colors: {
    ...DefaultNavigationTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};

