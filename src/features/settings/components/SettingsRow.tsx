import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../../theme/colors';

type Props = {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
  /** When true, row is visible but not tappable (e.g. feature not built yet). */
  disabled?: boolean;
};

const SettingsRow = ({
  icon,
  iconBg = colors.slateTint,
  label,
  value,
  onPress,
  destructive = false,
  showChevron = true,
  isLast = false,
  disabled = false,
}: Props) => {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={disabled ? 0.5 : 0.6}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[styles.row, !isLast && styles.rowBorder, disabled && styles.rowDisabled]}>
      <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
        {icon}
      </View>

      <Text
        style={[styles.label, destructive && styles.labelDestructive]}
        numberOfLines={1}>
        {label}
      </Text>

      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {showChevron && !destructive && !disabled && (
          <ChevronRight size={16} color={colors.textSecondary} strokeWidth={2} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  labelDestructive: {
    color: colors.error,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default SettingsRow;
