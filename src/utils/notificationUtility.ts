import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { requestNotificationPermission } from './permissionHelper';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { tokenStorage } from '../api/tokenStorage';

export const DEFAULT_CHANNEL_ID = 'trip_updates';

/**
 * Ensures the FCM token is synchronized with the backend.
 * Checks local storage for the current token and fetches a new one if missing.
 */
export const syncFcmToken = async (forceRegister = false) => {
  if (!tokenStorage.hasToken()) {
    console.log('[FCM] Skipping backend sync: No authenticated session');
    return null;
  }

  const existingToken = storage.getString(STORAGE_KEYS.FCM_TOKEN);

  try {
    const token = await messaging().getToken();
    
    if (token && (token !== existingToken || forceRegister)) {
      await apiClient.post(ENDPOINTS.NOTIFICATIONS.REGISTER, {
        fcmToken: token,
        deviceType: 'ANDROID',
      });
      storage.set(STORAGE_KEYS.FCM_TOKEN, token);
      console.log('[FCM] Token synchronized with backend');
    }
    return token;
  } catch (error) {
    console.error('[FCM] Error synchronizing token:', error);
    return existingToken || '';
  }
};

export const setupNotificationChannels = async () => {
  await notifee.createChannel({
    id: DEFAULT_CHANNEL_ID,
    name: 'Trip Updates',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
};

export const displayRemoteMessage = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
  const title = remoteMessage.notification?.title || String(remoteMessage.data?.title || 'SwapRide Update');
  const body = remoteMessage.notification?.body || String(remoteMessage.data?.body || 'New update for your trip.');

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data as any,
    android: {
      channelId: DEFAULT_CHANNEL_ID,
      pressAction: { id: 'default' },
      // Optional: Set a specific icon if available
      // smallIcon: 'notification_icon', 
    },
  });
};

export const initNotifications = async () => {
  const status = await requestNotificationPermission();
  
  if (status !== 'granted') {
    console.warn('[FCM] Notification permission not granted');
    return () => {};
  }

  try {
    // Setup channels first (for Android)
    await setupNotificationChannels();
    
    // Attempt to register device with Firebase if needed
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    
    // Initial sync
    await syncFcmToken();
  } catch (error) {
    console.error('[FCM] Bootstrap error:', error);
  }

  // Foreground handler
  const unsubscribeMessaging = messaging().onMessage(async (remoteMessage) => {
    console.log('[FCM] Received foreground message:', remoteMessage);
    await displayRemoteMessage(remoteMessage);
  });

  // Intercepting taps in foreground
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('[FCM] Notification pressed:', detail.notification?.id);
    }
  });

  return () => {
    unsubscribeMessaging();
    unsubscribeNotifee();
  };
};
