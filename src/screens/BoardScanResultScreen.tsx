import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import {
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import BaseLayout from '../layouts/BaseLayout';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.BOARD_SCAN_RESULT
>;

type Variant = 'error' | 'warning' | 'info';

const getVariantUi = (variant: Variant) => {
  switch (variant) {
    case 'warning':
      return {
        Icon: AlertTriangle,
        iconBg: colors.warningTint,
        iconColor: colors.warning,
        accent: colors.warning,
        heroBorder: 'rgba(217,119,6,0.18)',
      };
    case 'info':
      return {
        Icon: Info,
        iconBg: colors.primaryTint,
        iconColor: colors.primary,
        accent: colors.primary,
        heroBorder: 'rgba(23,81,188,0.18)',
      };
    case 'error':
    default:
      return {
        Icon: AlertCircle,
        iconBg: colors.errorTint,
        iconColor: colors.error,
        accent: colors.error,
        heroBorder: 'rgba(220,38,38,0.18)',
      };
  }
};

const BoardScanResultScreen = ({ navigation, route }: Props) => {
  const { variant, title, message, tripId, routeName } = route.params;

  const v = getVariantUi(variant);
  const safeTitle =
    title ||
    (variant === 'warning'
      ? 'Cannot board'
      : variant === 'info'
        ? 'Notice'
        : 'Boarding failed');

  const safeMessage =
    message ||
    (variant === 'warning'
      ? 'This ticket cannot be used right now.'
      : variant === 'info'
        ? 'Please check and try again.'
        : 'Could not complete boarding. Please try again.');

  const scanAgain = () => {
    navigation.replace(ROUTES.SCAN_TICKET, {
      tripId,
      routeName,
    });
  };

  const backToBoard = () => {
    navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.SCAN });
  };

  return (
    <BaseLayout style={{ backgroundColor: colors.surface }}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 24 + 88 },
          ]}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={ZoomIn.springify().damping(14)}
            style={[styles.heroIcon, { backgroundColor: v.iconBg, borderColor: v.heroBorder }]}>
            <v.Icon size={56} color={v.iconColor} strokeWidth={2.2} />
          </Animated.View>

          <Animated.Text entering={FadeIn.delay(120)} style={styles.title}>
            {safeTitle}
          </Animated.Text>

          <Animated.Text entering={FadeIn.delay(180)} style={styles.subtitle}>
            {safeMessage}
          </Animated.Text>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.btnSecondary} onPress={backToBoard}>
            <Text style={styles.btnSecondaryText}>Back to Board</Text>
          </Pressable>
          <Pressable style={[styles.btnPrimary, { backgroundColor: v.accent }]} onPress={scanAgain}>
            <Text style={styles.btnPrimaryText}>Try again</Text>
          </Pressable>
        </View>
      </View>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 12,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  footer: {
    position: 'absolute',
    left: -16,
    right: -16,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default BoardScanResultScreen;

