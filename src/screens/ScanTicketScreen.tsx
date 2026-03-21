import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  AppState,
  type AppStateStatus,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { isAxiosError } from 'axios';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { ChevronLeft, ScanLine } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useScanTicket } from '../features/trips/hooks/useScanTicket';
import { getScanErrorMessage } from '../features/board/scanErrorUtils';
import {
  feedbackScanDetected,
  feedbackScanError,
  feedbackScanSuccess,
} from '../features/board/scanFeedback';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.SCAN_TICKET>;

function devScanLog(message: string, extra?: unknown) {
  if (__DEV__) {
    console.log(`[SwapRide Scan] ${message}`, extra ?? '');
  }
}

function devScanError(message: string, extra?: unknown) {
  if (__DEV__) {
    console.error(`[SwapRide Scan] ${message}`, extra ?? '');
  }
}

/** Avoid logging full QR payloads in Metro; enough to verify format. */
function ticketTokenPreview(token: string) {
  const len = token.length;
  if (len <= 32) return { length: len, preview: token };
  return { length: len, preview: `${token.slice(0, 28)}…` };
}

const CORNER_LEN = 32;
const CORNER_THICK = 3;

const ScanTicketScreen = ({ navigation, route }: Props) => {
  const { tripId, routeName } = route.params;
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const scanMutation = useScanTicket(tripId);

  const busyRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', setAppState);
    return () => sub.remove();
  }, []);

  const cameraActive =
    isFocused && appState === 'active' && hasPermission && !!device;

  const frameSize = useMemo(() => Math.round(Math.min(W, H) * 0.68), [W, H]);
  const frameLeft = (W - frameSize) / 2;
  const frameTop = (H - frameSize) / 2 - Math.min(insets.top, 8);

  const dimStyles = useMemo(
    () => ({
      top: { width: '100%' as const, height: Math.max(0, frameTop), backgroundColor: 'rgba(0,0,0,0.55)' },
      left: {
        position: 'absolute' as const,
        top: frameTop,
        left: 0,
        width: frameLeft,
        height: frameSize,
        backgroundColor: 'rgba(0,0,0,0.55)',
      },
      right: {
        position: 'absolute' as const,
        top: frameTop,
        left: frameLeft + frameSize,
        right: 0,
        height: frameSize,
        backgroundColor: 'rgba(0,0,0,0.55)',
      },
      bottom: {
        position: 'absolute' as const,
        top: frameTop + frameSize,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
      },
    }),
    [frameTop, frameLeft, frameSize],
  );

  const frameSizeSV = useSharedValue(frameSize);
  useEffect(() => {
    frameSizeSV.value = frameSize;
  }, [frameSize, frameSizeSV]);

  const laserProgress = useSharedValue(0);
  useEffect(() => {
    laserProgress.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [laserProgress]);

  const laserStyle = useAnimatedStyle(() => {
    const fh = frameSizeSV.value;
    const y = interpolate(laserProgress.value, [0, 1], [8, Math.max(24, fh - 16)]);
    return {
      transform: [{ translateY: y }],
      opacity: interpolate(laserProgress.value, [0, 0.15, 0.85, 1], [0.5, 1, 1, 0.5]),
    };
  });

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  const handleScanError = useCallback(
    (err: unknown) => {
    if (isAxiosError(err)) {
      devScanError('Boarding API failed', {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        code: err.code,
      });
    } else {
      devScanError('Boarding failed (non-axios)', err);
    }
    feedbackScanError();
    const message = getScanErrorMessage(err);
    let variant: 'error' | 'warning' | 'info' = 'error';
    let title = 'Boarding failed';

    // Conflict means the passenger can’t be boarded (e.g. already boarded or wrong trip).
    if (isAxiosError(err) && err.response?.status === 409) {
      variant = 'warning';
      title = 'Cannot board';
    }
    navigation.replace(ROUTES.BOARD_SCAN_RESULT, {
      tripId,
      routeName,
      variant,
      title,
      message,
    });
  },
    [navigation, tripId, routeName],
  );

  const onCodeScanned = useCallback(
    (codes: { value?: string }[]) => {
      if (!cameraActive || busyRef.current || scanMutation.isPending) return;
      const raw = codes[0]?.value;
      if (!raw || typeof raw !== 'string') return;
      const token = raw.trim();
      if (!token) return;

      if (lastTokenRef.current === token) return;
      lastTokenRef.current = token;

      busyRef.current = true;
      feedbackScanDetected();
      devScanLog('QR decoded → POST /drivers/scan-ticket', {
        tripId,
        token: ticketTokenPreview(token),
      });

      scanMutation.mutate(token, {
        onSuccess: data => {
          devScanLog('Scan success', {
            bookingId: data.bookingId,
            passenger: data.passenger?.name,
          });
          feedbackScanSuccess();
          lastTokenRef.current = null;
          navigation.replace(ROUTES.BOARD_SCAN_SUCCESS, { result: data });
        },
        onError: err => {
          handleScanError(err);
        },
        onSettled: () => {
          busyRef.current = false;
        },
      });
    },
    [cameraActive, handleScanError, navigation, scanMutation],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned,
  });

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!device) {
    return (
      <View style={[styles.fallbackRoot, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <Pressable onPress={onBack} style={[styles.backBtn, { top: insets.top + 8 }]}>
          <ChevronLeft size={26} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.fallbackTitle}>No camera available</Text>
        <Text style={styles.fallbackSub}>
          This device does not expose a back camera, or the camera is unavailable.
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.permissionRoot, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <Pressable onPress={onBack} style={[styles.backBtnLight, { top: insets.top + 8 }]}>
          <ChevronLeft size={26} color={colors.surface} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <ScanLine size={40} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.permissionTitle}>Camera access</Text>
          <Text style={styles.permissionSub}>
            To scan passenger tickets, allow SwapRide to use your camera. You can change this
            anytime in system settings.
          </Text>
          <Pressable style={styles.permissionPrimary} onPress={() => requestPermission()}>
            <Text style={styles.permissionPrimaryText}>Continue</Text>
          </Pressable>
          <Pressable style={styles.permissionSecondary} onPress={openSettings}>
            <Text style={styles.permissionSecondaryText}>Open settings</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={cameraActive}
        codeScanner={codeScanner}
        enableZoomGesture
      />

      {/* Dim mask + cutout */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={dimStyles.top} />
        <View style={dimStyles.left} />
        <View style={dimStyles.right} />
        <View style={dimStyles.bottom} />
      </View>

      {/* Frame corners + laser (inside cutout) */}
      <View
        style={[
          styles.frameOutline,
          {
            left: frameLeft,
            top: frameTop,
            width: frameSize,
            height: frameSize,
          },
        ]}
        pointerEvents="none">
        <View style={[styles.corner, styles.cTL]} />
        <View style={[styles.corner, styles.cTR]} />
        <View style={[styles.corner, styles.cBL]} />
        <View style={[styles.corner, styles.cBR]} />
        <Animated.View style={[styles.laserLine, laserStyle]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={onBack} style={styles.headerBack} hitSlop={12}>
          <ChevronLeft size={26} color={colors.surface} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Scan ticket</Text>
          {routeName ? (
            <Text style={styles.headerSub} numberOfLines={1}>
              {routeName}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.hintPill, { bottom: insets.bottom + 24 }]} pointerEvents="none">
        <ScanLine size={16} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.hintText}>Align the QR code within the frame</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  frameOutline: {
    position: 'absolute',
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderColor: colors.surface,
  },
  cTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderTopLeftRadius: 14,
  },
  cTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderTopRightRadius: 14,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderBottomLeftRadius: 14,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderBottomRightRadius: 14,
  },
  laserLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#5EEAD4',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    ...Platform.select({ android: { elevation: 6 } }),
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  headerBack: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.surface,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  hintPill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.94)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: 260,
  },
  fallbackRoot: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  fallbackSub: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  permissionRoot: {
    flex: 1,
    backgroundColor: '#0B1224',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  backBtnLight: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
  },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  permissionSub: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
  },
  permissionPrimary: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  permissionPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  permissionSecondary: {
    marginTop: 14,
    paddingVertical: 10,
  },
  permissionSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ScanTicketScreen;
