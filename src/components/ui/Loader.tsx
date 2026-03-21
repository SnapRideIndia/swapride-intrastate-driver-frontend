import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

export type LoaderProps = {
  /** Optional caption under the spinner */
  message?: string;
  /**
   * When true (default), the wrapper uses flex:1 so it centers within the
   * remaining screen / parent area.
   */
  fill?: boolean;
  /** Native spinner size — `large` is the standard ring/circle on both platforms */
  indicatorSize?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Centered native {@link ActivityIndicator} (platform ring / circle) with optional message.
 */
const Loader = ({
  message,
  fill = true,
  indicatorSize = 'large',
  color = colors.primary,
  style,
  testID,
}: LoaderProps) => {
  return (
    <View
      style={[fill && styles.fill, styles.center, style]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}>
      <ActivityIndicator size={indicatorSize} color={color} />
      {message ? (
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 120,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default Loader;
