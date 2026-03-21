import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

type Props = {
  children: React.ReactNode;
  /** Optional style override for the outer container (e.g. backgroundColor). */
  style?: StyleProp<ViewStyle>;
};

const BaseLayout = ({ children, style }: Props) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 12,
          backgroundColor: theme.colors.background,
        },
        // Allow callers to override default background/colors.
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default BaseLayout;
