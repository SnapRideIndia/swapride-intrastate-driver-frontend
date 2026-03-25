import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/SplashScreen';
import { LoginScreen, OtpScreen } from '../screens';
import TripDetailScreen from '../screens/TripDetailScreen';
import PassengersScreen from '../screens/PassengersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {
  ScanTicketScreen,
  BoardScanSuccessScreen,
  BoardScanResultScreen,
  PermissionsScreen,
  NotificationsScreen,
  ProfileDetailScreen,
  RouteManifestScreen,
} from '../screens';
import { ROUTES } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.SPLASH}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.OTP} component={OtpScreen} />
      <Stack.Screen
        name={ROUTES.MAIN_TABS}
        component={TabNavigator}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name={ROUTES.TRIP_DETAIL} component={TripDetailScreen} />
      <Stack.Screen name={ROUTES.TRIP_PASSENGERS} component={PassengersScreen} />
      <Stack.Screen
        name={ROUTES.SCAN_TICKET}
        component={ScanTicketScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name={ROUTES.BOARD_SCAN_SUCCESS}
        component={BoardScanSuccessScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name={ROUTES.BOARD_SCAN_RESULT}
        component={BoardScanResultScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen name={ROUTES.PROFILE_DETAIL} component={ProfileDetailScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.PERMISSIONS} component={PermissionsScreen} />
      <Stack.Screen name={ROUTES.ROUTE_MANIFEST} component={RouteManifestScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
