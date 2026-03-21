import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  MapPin,
  Camera,
  Bell,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { colors } from '../theme/colors';
import BaseLayout from '../layouts/BaseLayout';
import { useLocationPermission } from '../features/driverLocation/hooks/useLocationPermission';
import { useBatteryOptimization } from '../features/driverLocation/hooks/useBatteryOptimization';

const PermissionRow = ({
  icon: Icon,
  label,
  description,
  status,
  onAction,
}: {
  icon: any;
  label: string;
  description: string;
  status: 'granted' | 'denied' | 'blocked' | 'warning';
  onAction: () => void;
}) => {
  const isGranted = status === 'granted';
  
  return (
    <View style={styles.row}>
      <View style={[styles.iconBg, isGranted ? styles.iconBgGranted : styles.iconBgOther]}>
        <Icon size={20} color={isGranted ? colors.success : colors.primary} strokeWidth={2} />
      </View>
      
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <TouchableOpacity
        onPress={onAction}
        style={[
          styles.actionBtn,
          isGranted ? styles.actionBtnGranted : styles.actionBtnRequired
        ]}
        activeOpacity={0.7}
      >
        {isGranted ? (
          <CheckCircle2 size={16} color={colors.success} strokeWidth={2.5} />
        ) : (
          <Text style={styles.actionBtnText}>
            {status === 'blocked' ? 'Open Settings' : 'Allow'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const PermissionsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const {
    status: locStatus,
    isBackground,
    requestForeground,
    requestBackground,
    checkPermission: checkLocation,
    goToSettings: openLocationSettings,
  } = useLocationPermission();

  const {
    hasPermission: hasCamera,
    requestPermission: requestCamera,
  } = useCameraPermission();

  const {
    isIgnoring: isBatteryExempt,
    checkStatus: checkBattery,
    requestExemption: requestBattery,
    openSettings: openBatterySettings,
  } = useBatteryOptimization();

  // Re-check all permissions when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        checkLocation();
        checkBattery();
        // Camera doesn't need explicit check here as it updates via hook
      }
    });
    return () => sub.remove();
  }, [checkLocation, checkBattery]);

  const openSystemSettings = () => Linking.openSettings();

  const getLocStatus = (): 'granted' | 'denied' | 'blocked' | 'warning' => {
    if (isBackground) return 'granted';
    if (locStatus === 'granted') return 'warning'; // Needs background
    if (locStatus === 'blocked') return 'blocked';
    return 'denied';
  };

  const getCameraStatus = (): 'granted' | 'denied' | 'blocked' => {
    return hasCamera ? 'granted' : 'denied';
  };

  const getBatteryStatus = (): 'granted' | 'denied' => {
    return isBatteryExempt ? 'granted' : 'denied';
  };

  return (
    <BaseLayout>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Permissions</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <AlertTriangle size={20} color={colors.warning} strokeWidth={2} />
          <Text style={styles.infoText}>
            For accurate trip tracking and seamless boarding, SwapRide requires these permissions to be active.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCATION & TRACKING</Text>
          
          <PermissionRow
            icon={MapPin}
            label="Location Access"
            description="Required to share your live bus position with passengers during trips."
            status={getLocStatus()}
            onAction={
              getLocStatus() === 'warning'
                ? requestBackground
                : locStatus === 'blocked'
                ? openLocationSettings
                : requestForeground
            }
          />

          <View style={styles.divider} />

          <PermissionRow
            icon={Zap}
            label="Battery Optimization"
            description="Allows the app to run reliably in the background without being killed by the OS."
            status={getBatteryStatus()}
            onAction={requestBattery}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CAMERA & TOOLS</Text>
          
          <PermissionRow
            icon={Camera}
            label="Camera"
            description="Needed to scan passenger tickets and QR codes for quick boarding."
            status={getCameraStatus()}
            onAction={requestCamera}
          />
          
          <View style={styles.divider} />

          <PermissionRow
            icon={Bell}
            label="Notifications"
            description="Receive alerts for new trip assignments, delays, and critical updates."
            status="granted" // Mostly handled with location on Android 13+ in our hook
            onAction={() => {}}
          />
        </View>

        <TouchableOpacity 
          style={styles.settingsFooter} 
          onPress={openSystemSettings}
          activeOpacity={0.7}
        >
          <Settings size={18} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.settingsFooterText}>Open System App Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  scroll: {
    marginHorizontal: -16,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.warningTint,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.1)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
    lineHeight: 18,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconBgGranted: {
    backgroundColor: colors.successTint,
    borderColor: 'rgba(22,163,74,0.1)',
  },
  iconBgOther: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryMuted,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rowDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnRequired: {
    backgroundColor: colors.primary,
  },
  actionBtnGranted: {
    backgroundColor: colors.successTint,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  settingsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  settingsFooterText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PermissionsScreen;
