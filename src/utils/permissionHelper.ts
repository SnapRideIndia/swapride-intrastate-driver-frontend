import { Platform, Alert } from 'react-native';
import {
  check,
  request,
  RESULTS,
  openSettings,
  Permission,
  PERMISSIONS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

export enum PermissionType {
  LOCATION = 'location',
  NOTIFICATIONS = 'notifications',
  CAMERA = 'camera',
}

const PermissionMap: Record<string, Permission[]> = {
  [PermissionType.LOCATION]: Platform.select({
    ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
    android: [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
  })!,
  [PermissionType.CAMERA]: Platform.select({
    ios: [PERMISSIONS.IOS.CAMERA],
    android: [PERMISSIONS.ANDROID.CAMERA],
  })!,
};

const handleBlocked = (type: string) => {
  Alert.alert(
    'Permission Required',
    `Please enable ${type} permission from settings to continue.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => openSettings() },
    ],
  );
};

export const requestNotificationPermission = async (): Promise<'granted' | 'denied' | 'blocked'> => {
  const { status } = await checkNotifications();
  if (status === RESULTS.GRANTED) return 'granted';
  if (status === RESULTS.BLOCKED) return 'blocked';
  
  const { status: requestStatus } = await requestNotifications(['alert', 'sound', 'badge']);
  if (requestStatus === RESULTS.GRANTED) return 'granted';
  if (requestStatus === RESULTS.BLOCKED) {
    handleBlocked('Notification');
    return 'blocked';
  }
  return 'denied';
};

export const requestSinglePermission = async (type: PermissionType): Promise<'granted' | 'denied' | 'blocked'> => {
  if (type === PermissionType.NOTIFICATIONS) {
    return requestNotificationPermission();
  }
  
  const perms = PermissionMap[type];
  if (!perms) return 'denied';

  for (const perm of perms) {
    const status = await check(perm);
    if (status === RESULTS.GRANTED) continue;
    if (status === RESULTS.BLOCKED) {
      handleBlocked(type);
      return 'blocked';
    }

    const result = await request(perm);
    if (result === RESULTS.BLOCKED) {
      handleBlocked(type);
      return 'blocked';
    }
    if (result !== RESULTS.GRANTED) return 'denied';
  }

  return 'granted';
};
