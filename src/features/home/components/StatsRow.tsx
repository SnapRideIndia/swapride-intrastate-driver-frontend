import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Navigation2, Users } from 'lucide-react-native';
import { colors } from '../../../theme/colors';

type Props = {
  trips: number;
  passengers: number;
};

const StatsRow = ({ trips, passengers }: Props) => {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primaryTint }]}>
          <Navigation2 size={16} color={colors.primary} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.value}>{trips}</Text>
          <Text style={styles.label}>Trips Today</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconBadge, { backgroundColor: colors.tealTint }]}>
          <Users size={16} color={colors.teal} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.value}>{passengers}</Text>
          <Text style={styles.label}>Passengers</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
});

export default StatsRow;
