import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[FCM] Received background message:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
