import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { ROUTES } from './routes';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const resetToLogin = (): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.LOGIN }],
      }),
    );
  }
};
