import Geolocation from 'react-native-geolocation-service';
import { postLocationUpdate } from './locationService';
import { tripStorage } from '../trips/tripStorage';

/**
 * Headless JS Task for location tracking.
 * This runs in a separate background thread even when the app is minimized.
 */
export default async () => {
  const tripId = tripStorage.getActiveTripId();
  
  if (!tripId) {
    if (__DEV__) console.log('[Background Location] No active tripId found in storage, skipping.');
    return;
  }

  if (__DEV__) console.log(`[Background Location] Task started at ${new Date().toLocaleTimeString()} for trip ${tripId}`);

  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          if (__DEV__) console.log(`[Background Location] Sending update: lat=${latitude.toFixed(6)}, lng=${longitude.toFixed(6)}`);
          await postLocationUpdate(tripId, { latitude, longitude });
          if (__DEV__) {
            console.log(`[Background Location] Success: ${new Date().toLocaleTimeString()}`);
          }
        } catch (error) {
          if (__DEV__) {
            console.warn('[Background Location] Update failed:', error);
          }
        }
        resolve(null);
      },
      (error) => {
        if (__DEV__) {
          console.warn('[Background Location] Error:', error);
        }
        resolve(null);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000,
        distanceFilter: 0, 
        forceRequestLocation: true 
      }
    );
  });
};
