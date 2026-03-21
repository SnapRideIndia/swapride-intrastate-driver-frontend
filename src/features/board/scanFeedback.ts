import { Vibration, Platform } from 'react-native';

/** Short pulse when a QR code is first detected */
export function feedbackScanDetected(): void {
  if (Platform.OS === 'android') {
    Vibration.vibrate(30);
  } else {
    Vibration.vibrate(35);
  }
}

/** Success: double pulse */
export function feedbackScanSuccess(): void {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 45, 70, 45]);
  } else {
    Vibration.vibrate([0, 40, 55, 40], false);
  }
}

/** Error: longer buzz */
export function feedbackScanError(): void {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 55, 90, 55]);
  } else {
    Vibration.vibrate(90);
  }
}
