import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

const Input = forwardRef<TextInput, Props>(
  ({ label, error, prefix, suffix, containerStyle, style, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? colors.error
      : focused
      ? colors.primary
      : colors.border;

    const borderWidth = focused || !!error ? 1.5 : 1;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.inputRow, { borderColor, borderWidth }]}>
          {prefix}
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...rest}
          />
          {suffix}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
});

export default Input;
