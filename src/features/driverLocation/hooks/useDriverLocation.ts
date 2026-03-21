import { useEffect, useRef, useCallback, useState } from 'react';
import { DeviceEventEmitter, NativeModules, Platform, AppState, type AppStateStatus } from 'react-native';
import { tokenStorage } from '../../../api/tokenStorage';
import { tripStorage } from '../../trips/tripStorage';
import { toast } from '../../../lib/toast';

export type DriverLocationResult = {
  isTracking: boolean;
  lastLocation: any | null;
  error: any | null;
};

/**
 * Custom hook to manage driver location tracking via Native Android Foreground Service.
 * 
 * Technical Implementation:
 * - Uses a FusedLocationProvider (Native) for high-accuracy tracking.
 * - Native service persists during background/kill states and device reboots.
 * - Throttling (15s) and Idle Detection (5m) are handled natively to optimize battery.
 * - This hook acts as a bridge to sync native updates to the React Native UI.
 * 
 * @param activeTripId - ID of the current trip to track
 * @param permissionGranted - Whether location permissions are active
 * @param permissionChecking - Loading state for permission check
 */
const useDriverLocation = (
  activeTripId: string | null,
  permissionGranted: boolean,
  permissionChecking: boolean,
): DriverLocationResult => {
  // UI States for tracking status and markers
  const [isTracking, setIsTracking]     = useState(false);
  const [lastLocation, setLastLocation] = useState<any>(null);
  const [error, setError]               = useState<any>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const stopService = useCallback(() => {
    if (Platform.OS === 'android') {
      NativeModules.LocationModule.stopLocationService();
    }
    setIsTracking(false);
  }, []);

  const startService = useCallback(async (tripId: string) => {
    if (Platform.OS !== 'android') return;

    try {
      const token = tokenStorage.getToken();
      if (!token) {
        if (__DEV__) console.warn('[Location] Cannot start service: No auth token found in storage.');
        return;
      }

      NativeModules.LocationModule.startLocationService(tripId, token);
      setIsTracking(true);
      if (__DEV__) console.log('[Location] Native Foreground service started.');
    } catch (e) {
      if (__DEV__) console.warn('[Location] Native service start error:', e);
    }
  }, []);

  // Sync the active trip ID to persistent storage for background service access.
  useEffect(() => {
    tripStorage.setActiveTripId(activeTripId);
  }, [activeTripId]);

  // Listen for native location updates and auth errors
  useEffect(() => {
    const locationSubscription = DeviceEventEmitter.addListener('onLocationUpdate', (location) => {
      setLastLocation({
        coords: {
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          accuracy: location.accuracy,
          altitude: location.altitude,
        },
        timestamp: location.timestamp,
      });
      setIsTracking(true);
    });

    const authErrorSubscription = DeviceEventEmitter.addListener('onAuthError', () => {
      if (__DEV__) console.warn('[Location] Auth error received from native. Token may be expired.');
      toast.error('Session expired. Live tracking may be interrupted.');
      stopService();
    });

    return () => {
      locationSubscription.remove();
      authErrorSubscription.remove();
    };
  }, [stopService]);

  // Lifecycle control: Start/stop service based on active trip & permissions
  useEffect(() => {
    if (permissionChecking) return;

    if (activeTripId && permissionGranted) {
      startService(activeTripId);
    } else {
      stopService();
    }
  }, [activeTripId, permissionGranted, permissionChecking, startService, stopService]);

  // Re-start service on app foreground if it was lost (safety guard)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        if (activeTripId && permissionGranted) {
          if (__DEV__) console.log('[Location] App foregrounded, ensuring service is active.');
          startService(activeTripId);
        }
      }
    });

    return () => subscription.remove();
  }, [activeTripId, permissionGranted, startService]);

  return { isTracking, lastLocation, error };
};

export default useDriverLocation;
