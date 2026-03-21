import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Bus, Users, Clock } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { formatIndianDate } from '../../../utils/dateUtils';
import type { ApiTripSummary } from '../types';

type Props = {
  trip: ApiTripSummary;
  onPress?: () => void;
};

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  'Scheduled':   { color: colors.warning, bg: colors.warningTint },
  'In Progress': { color: colors.success, bg: colors.successTint },
  'Completed':   { color: colors.slate,   bg: colors.slateTint   },
  'Delayed':     { color: colors.orange,  bg: colors.orangeTint  },
  'Cancelled':   { color: colors.error,   bg: colors.errorTint   },
};

const getStatusStyle = (status: string) =>
  STATUS_COLOR[status] ?? { color: colors.slate, bg: colors.slateTint };

const TripCard = ({ trip, onPress }: Props) => {
  const s = getStatusStyle(trip.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.statusText, { color: s.color }]}>{trip.status}</Text>
        </View>
        <View style={styles.topRight}>
          <Text style={styles.date}>{formatIndianDate(trip.date)}</Text>
          <ChevronRight size={16} color={colors.textSecondary} strokeWidth={2} />
        </View>
      </View>

      <Text style={styles.routeName} numberOfLines={1}>{trip.routeName}</Text>

      <View style={styles.timesRow}>
        <Text style={styles.time}>{trip.scheduledStartTime}</Text>
        <View style={styles.timeLine}>
          <View style={styles.line} />
          <View style={styles.dot} />
          <View style={styles.line} />
        </View>
        <Text style={styles.time}>{trip.scheduledEndTime}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Bus size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>{trip.busNumber}</Text>
        </View>
        <View style={styles.metaItem}>
          <Users size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>{trip.totalPassengers} passengers</Text>
        </View>
        {trip.delayMinutes > 0 && (
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.orange} strokeWidth={2} />
            <Text style={[styles.metaText, { color: colors.orange }]}>
              +{trip.delayMinutes}m
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 72,
  },
  timeLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default TripCard;
