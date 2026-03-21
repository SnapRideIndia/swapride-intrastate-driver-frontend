import type { NavigatorScreenParams } from '@react-navigation/native';
import { ROUTES } from './routes';
import type { ScanTicketSuccessResponse } from '../features/trips/types';

export type RootTabParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.TRIPS]: undefined;
  [ROUTES.SCAN]: undefined;
};

export type RootStackParamList = {
  [ROUTES.SPLASH]: undefined;
  [ROUTES.LOGIN]: undefined;
  [ROUTES.OTP]: { phone: string };
  [ROUTES.MAIN_TABS]: NavigatorScreenParams<RootTabParamList>;
  [ROUTES.TRIP_DETAIL]: { tripId: string };
  [ROUTES.TRIP_PASSENGERS]: { tripId: string; routeName: string; canBoard: boolean };
  [ROUTES.SCAN_TICKET]: { tripId: string; routeName?: string };
  [ROUTES.BOARD_SCAN_SUCCESS]: { result: ScanTicketSuccessResponse };
  [ROUTES.BOARD_SCAN_RESULT]: {
    tripId: string;
    routeName?: string;
    variant: 'error' | 'warning' | 'info';
    title: string;
    message: string;
  };
  [ROUTES.NOTIFICATIONS]: undefined;
  [ROUTES.PROFILE_DETAIL]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.PERMISSIONS]: undefined;
};
