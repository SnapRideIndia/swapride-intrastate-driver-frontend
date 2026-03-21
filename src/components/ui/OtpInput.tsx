import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

const OtpInput = ({ length = 6, value, onChange, autoFocus = false }: Props) => {
  const refs = useRef<(TextInput | null)[]>([]);

  // Focus first box after navigation transition completes
  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => refs.current[0]?.focus(), 200);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusAt = (i: number) => refs.current[i]?.focus();

  const handleChange = useCallback(
    (text: string, i: number) => {
      const digit = text.replace(/\D/g, '').slice(-1);
      const arr = digits.map((d, idx) => (idx === i ? digit : d));
      onChange(arr.join(''));
      if (digit && i < length - 1) {
        focusAt(i + 1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [digits, length, onChange],
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, i: number) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
        focusAt(i - 1);
      }
    },
    [digits],
  );

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TextInput
          key={i}
          ref={el => {
            refs.current[i] = el;
          }}
          style={[styles.box, !!digit && styles.boxFilled]}
          value={digit}
          onChangeText={text => handleChange(text, i)}
          onKeyPress={e => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          cursorColor={colors.primary}
          textAlign="center"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    flex: 1,
    height: 58,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
});

export default OtpInput;
