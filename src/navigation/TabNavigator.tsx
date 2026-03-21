import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import ScanScreen from '../screens/BoardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { ROUTES } from './routes';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, MapPin, ScanLine, Settings } from 'lucide-react-native';
import { colors } from '../theme/colors';

const Tab = createMaterialTopTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: theme.colors.primary,
        },
      ]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? colors.surface : colors.tabBarInactive;

        let label = '';
        let IconComponent: React.ComponentType<any> | null = null;
        const size = 22;

        switch (route.name) {
          case ROUTES.HOME:
            label = 'Home';
            IconComponent = Home;
            break;
          case ROUTES.TRIPS:
            label = 'Trips';
            IconComponent = MapPin;
            break;
          case ROUTES.SCAN:
            label = 'Board';
            IconComponent = ScanLine;
            break;
        }

        if (!IconComponent) return null;

        const isScan = route.name === ROUTES.SCAN;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tabItem, isScan && styles.floatingTabItem]}
            activeOpacity={0.85}>
            <View style={[
              styles.iconContainer,
              isScan && styles.floatingButton,
            ]}>
              <IconComponent
                color={color}
                size={isScan ? 28 : size}
                strokeWidth={isScan ? 2.5 : 2}
              />
            </View>
            <Text style={[styles.label, { color }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={props => <CustomTabBar {...props} />}
      backBehavior="history"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
      }}>
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen name={ROUTES.SCAN} component={ScanScreen} />
      <Tab.Screen name={ROUTES.TRIPS} component={TripsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTabItem: {
    justifyContent: 'flex-start',
    marginTop: -30,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 4,
    borderColor: colors.background,
  },
});

export default TabNavigator;

