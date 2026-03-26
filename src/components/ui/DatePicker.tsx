import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  show: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

/**
 * Reusable DatePicker component.
 * 
 * Usage for Android:
 * ```tsx
 * import { openAndroidDatePicker } from './DatePicker';
 * ...
 * openAndroidDatePicker({ 
 *   value: new Date(), 
 *   onChange: (d) => setDate(d) 
 * });
 * ```
 * 
 * Usage for iOS (Declarative):
 * ```tsx
 * <DatePicker 
 *   show={show} 
 *   value={date} 
 *   onChange={(d) => { setDate(d); setShow(false); }} 
 *   onClose={() => setShow(false)} 
 * />
 * ```
 */
const DatePicker = ({
  value,
  onChange,
  onClose,
  show,
  minimumDate,
  maximumDate,
  mode = 'date',
}: DatePickerProps) => {
  if (Platform.OS !== 'ios' || !show) {
    return null;
  }

  return (
    <DateTimePicker
      mode={mode}
      display="inline"
      value={value}
      onChange={(_event: DateTimePickerChangeEvent, date?: Date) => {
        if (date) {
          onChange(date);
        } else {
          onClose();
        }
      }}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      accentColor={colors.primary}
      themeVariant="light"
    />
  );
};

export const openAndroidDatePicker = (params: {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}) => {
  if (Platform.OS !== 'android') return;

  DateTimePickerAndroid.open({
    value: params.value,
    onChange: (_event: any, date?: Date) => {
      if (date) {
        params.onChange(date);
      }
    },
    mode: (params.mode === 'datetime' ? 'date' : params.mode) || 'date',
    display: 'default',
    positiveButton: { label: 'OK', textColor: colors.primary },
    negativeButton: { label: 'Cancel', textColor: colors.textSecondary },
  });
};

export default DatePicker;
