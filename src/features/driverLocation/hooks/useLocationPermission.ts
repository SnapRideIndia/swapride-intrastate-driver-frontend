import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid, Linking, AppState, type AppStateStatus } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { toast } from '../../../lib/toast';

/** Small delay so Android Activity is fully attached before requesting permissions. */
const ACTIVITY_READY_DELAY_MS = 600;

export type LocationPermissionStatus =
  | 'granted'      // foreground granted
  | 'background'   // always / background granted (Android 10+ "all the time")
  | 'denied'       // denied but can ask again
  | 'blocked'      // permanently denied — must go to Settings
  | 'unavailable'  // hardware/OS doesn't support it
  | 'checking';    // initial state

export const useLocationPermission = () => {
  const [status, setStatus] = useState<LocationPermissionStatus>('checking');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const safeSetStatus = useCallback((s: LocationPermissionStatus) => {
    if (mountedRef.current) setStatus(s);
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const fine = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (!fine) { safeSetStatus('denied'); return; }

        // Check notification permission for Android 13+
        if (Platform.Version >= 33) {
          const notify = await PermissionsAndroid.check(
            'android.permission.POST_NOTIFICATIONS' as any,
          );
          if (!notify) { safeSetStatus('denied'); return; }
        }

        if (Platform.Version >= 29) {
          const bg = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          );
          safeSetStatus(bg ? 'background' : 'granted');
        } else {
          safeSetStatus('granted');
        }
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') safeSetStatus('granted');
        else if (auth === 'restricted') safeSetStatus('unavailable');
        else safeSetStatus('denied');
      }
    } catch (e) {
      if (__DEV__) console.warn('[Location] checkPermission error:', e);
      // Retry once after a longer delay if Activity wasn't ready yet.
      setTimeout(checkPermission, 1000);
    }
  }, [safeSetStatus]);

  /** Request foreground ("when in use") location. Returns final status. */
  const requestForeground = useCallback(async (): Promise<LocationPermissionStatus> => {
    try {
      if (Platform.OS === 'android') {
        // Request notification permission if Android 13+ (Required for Foreground Service)
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const notify = await PermissionsAndroid.request(
            'android.permission.POST_NOTIFICATIONS' as any,
          );
          if (notify !== PermissionsAndroid.RESULTS.GRANTED) {
            toast.warning('Notifications are required to keep tracking active in the background.');
          }
        }

        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Precise Location Required',
            message:
              'SwapRide needs "Precise" location access to accurately track your bus position for passengers.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          // Double check if it's actually FINE location (Android 12+ check)
          const isFine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          if (!isFine) {
            toast.warning('Please enable "Precise" location for accurate tracking.');
          }
          safeSetStatus('granted');
          return 'granted';
        }
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          toast.error('Permissions permanently denied. Enable them in App Settings to continue.');
          safeSetStatus('blocked');
          return 'blocked';
        }
        safeSetStatus('denied');
        return 'denied';
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') { safeSetStatus('granted'); return 'granted'; }
        if (auth === 'restricted') { safeSetStatus('unavailable'); return 'unavailable'; }
        toast.error('Location denied. Enable it in Settings to track your trips.');
        safeSetStatus('blocked');
        return 'blocked';
      }
    } catch (e) {
      if (__DEV__) console.warn('[Location] requestForeground error:', e);
      return 'denied';
    }
  }, [safeSetStatus]);

  /**
   * Request background ("always") location.
   * Android 10+: system requires user to pick "Allow all the time" manually.
   */
  const requestBackground = useCallback(async (): Promise<LocationPermissionStatus> => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 29) {
        toast.info('For uninterrupted tracking, select "Allow all the time" for location in the next screen.');
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          safeSetStatus('background');
          return 'background';
        }
      } else if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('always');
        if (auth === 'granted') { safeSetStatus('background'); return 'background'; }
      }
    } catch (e) {
      if (__DEV__) console.warn('[Location] requestBackground error:', e);
    }
    return status;
  }, [safeSetStatus, status]);

  /** Opens system app settings so the user can enable location manually. */
  const goToSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  // Delay the initial check so Android Activity is fully attached before
  // making any permissions API calls.
  useEffect(() => {
    const timer = setTimeout(checkPermission, ACTIVITY_READY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [checkPermission]);

  // Re-verify permissions whenever the app returns from background / settings.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkPermission();
      }
    });
    return () => subscription.remove();
  }, [checkPermission]);

  return {
    status,
    isChecking: status === 'checking',
    isGranted: status === 'granted' || status === 'background',
    isBackground: status === 'background',
    checkPermission,
    requestForeground,
    requestBackground,
    goToSettings,
  };
};
