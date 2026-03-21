import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Navigation2, Users } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import type { ApiTripSummary } from '../../trips/types';

type Props = {
  trip: ApiTripSummary;
  isTracking: boolean;
  onViewPassengers: () => void;
  onEndTrip: () => void;
};

const ActiveTripCard = ({ trip, isTracking, onViewPassengers, onEndTrip }: Props) => {
  const dotOpacity  = useRef(new Animated.Value(1)).current;
  const badgeScale  = useRef(new Animated.Value(1)).current;
  const pulseAnim   = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isTracking) {
      // Dot blinks: fade out then fade in continuously.
      pulseAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, {
            toValue: 0.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      // Badge gently scales on each blink cycle.
      const scaleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeScale, {
            toValue: 1.06,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(badgeScale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnim.current.start();
      scaleLoop.start();
      return () => {
        pulseAnim.current?.stop();
        scaleLoop.stop();
      };
    } else {
      // Trip exists but GPS not yet acquired — steady static badge.
      dotOpacity.setValue(1);
      badgeScale.setValue(1);
    }
  }, [isTracking]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {isTracking ? (
          <Animated.View
            style={[styles.liveBadge, { transform: [{ scale: badgeScale }] }]}>
            <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
            <Text style={styles.liveText}>LIVE</Text>
            <Text style={styles.trackingLabel}>· Tracking</Text>
          </Animated.View>
        ) : (
          <View style={styles.pausedBadge}>
            <View style={styles.pausedDot} />
            <Text style={styles.pausedText}>SESSION ACTIVE</Text>
          </View>
        )}
        <View style={styles.busRow}>
          <Navigation2 size={12} color={colors.tabBarInactive} strokeWidth={2} />
          <Text style={styles.busNumber}>{trip.busNumber}</Text>
        </View>
      </View>

      <Text style={styles.routeName}>{trip.routeName}</Text>

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

      <View style={styles.passengersRow}>
        <Users size={14} color={colors.tabBarInactive} strokeWidth={2} />
        <Text style={styles.passengersLabel}>Confirmed Passengers</Text>
        <Text style={styles.passengersCount}>{trip.totalPassengers}</Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={onViewPassengers} style={styles.boardBtn} activeOpacity={0.8}>
          <Text style={styles.boardBtnText}>View Passengers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEndTrip} style={styles.endBtn} activeOpacity={0.8}>
          <Text style={styles.endBtnText}>End Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    letterSpacing: 0.6,
  },
  trackingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
    opacity: 0.8,
  },
  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  busNumber: {
    fontSize: 12,
    color: colors.tabBarInactive,
    fontWeight: '500',
  },
  routeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: -0.3,
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 13,
    color: colors.tabBarInactive,
    fontWeight: '600',
    minWidth: 72,
  },
  timeLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primaryMuted,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primaryMuted,
  },
  passengersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passengersLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.tabBarInactive,
    fontWeight: '500',
  },
  passengersCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  boardBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  boardBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  endBtn: {
    flex: 1,
    backgroundColor: colors.errorTint,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  endBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  pausedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  pausedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tabBarInactive,
    opacity: 0.6,
  },
  pausedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tabBarInactive,
    letterSpacing: 0.5,
  },
});

export default ActiveTripCard;
