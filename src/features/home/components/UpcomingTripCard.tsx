import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bus, Users, Clock } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { formatIndianDate } from '../../../utils/dateUtils';
import type { ApiTripSummary } from '../../trips/types';

type Props = {
  trip: ApiTripSummary;
  onStartTrip: () => void;
  /** Opens passenger manifest (boarding allowed only after trip is in progress). */
  onViewPassengers?: () => void;
};

const UpcomingTripCard = ({ trip, onStartTrip, onViewPassengers }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Next Trip</Text>
        </View>
        <View style={styles.timeRow}>
          <Clock size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.dateTime}>
            {formatIndianDate(trip.date)} · {trip.scheduledStartTime}
          </Text>
        </View>
      </View>

      <Text style={styles.routeName}>{trip.routeName}</Text>

      <View style={styles.timesRow}>
        <Text style={styles.time}>{trip.scheduledStartTime}</Text>
        <View style={styles.arrowContainer}>
          <View style={styles.arrowLine} />
          <View style={styles.arrowDot} />
        </View>
        <Text style={styles.time}>{trip.scheduledEndTime}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Bus size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>{trip.busNumber}</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <Users size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>{trip.totalPassengers} confirmed</Text>
        </View>
      </View>

      <View style={styles.actionsCol}>
        {onViewPassengers ? (
          <TouchableOpacity
            onPress={onViewPassengers}
            style={styles.manifestBtn}
            activeOpacity={0.85}>
            <Users size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.manifestBtnText}>View passengers</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={onStartTrip} style={styles.startBtn} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Start Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: colors.warningTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  routeName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
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
  arrowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  arrowLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.border,
  },
  arrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  actionsCol: {
    gap: 10,
  },
  manifestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  manifestBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.1,
  },
  startBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.2,
  },
});

export default UpcomingTripCard;
