import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import RootNavigator from '../navigation/RootNavigator';
import { navigationTheme, paperTheme } from '../theme';
import { navigationRef } from '../navigation/navigationRef';
import QueryProvider from '../providers/QueryProvider';
import UIProvider from '../providers/UIProvider';
import { DriverProvider } from '../context/DriverContext';
import { initNotifications } from '../utils/notificationUtility';

const AppRoot = () => {
  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    (async () => {
      unsubscribe = await initNotifications();
    })();
    return () => unsubscribe?.();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <DriverProvider>
            <PaperProvider theme={paperTheme}>
              <UIProvider>
                <NavigationContainer ref={navigationRef} theme={navigationTheme}>
                  <StatusBar barStyle="light-content" backgroundColor={paperTheme.colors.primary} />
                  <RootNavigator />
                </NavigationContainer>
              </UIProvider>
            </PaperProvider>
          </DriverProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppRoot;

