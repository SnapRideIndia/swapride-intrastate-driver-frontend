import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Loader from '../components/ui/Loader';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Bus,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import BaseLayout from '../layouts/BaseLayout';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useTripDetail } from '../features/trips/hooks/useTripDetail';
import { useUpdateTripStatus } from '../features/trips/hooks/useUpdateTripStatus';
import { useLocationPermission } from '../features/driverLocation/hooks/useLocationPermission';
import { useBatteryOptimization } from '../features/driverLocation/hooks/useBatteryOptimization';
import BatteryOptimizationModal from '../components/ui/BatteryOptimizationModal';
import { modal } from '../lib/modal';
import type { BackendTripStatus } from '../features/trips/types';
import {
  detailTripAllowsBoarding,
  detailTripAllowsManifest,
} from '../features/trips/tripStatusUtils';
import { formatTime, formatIndianDate } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.TRIP_DETAIL>;

const STATUS_CONFIG: Record<
  BackendTripStatus,
  { label: string; color: string; bg: string }
> = {
  SCHEDULED:   { label: 'Scheduled',   color: colors.warning, bg: colors.warningTint },
  IN_PROGRESS: { label: 'In Progress', color: colors.success, bg: colors.successTint },
  COMPLETED:   { label: 'Completed',   color: colors.slate,   bg: colors.slateTint   },
  DELAYED:     { label: 'Delayed',     color: colors.orange,  bg: colors.orangeTint  },
  CANCELLED:   { label: 'Cancelled',   color: colors.error,   bg: colors.errorTint   },
};


const TripDetailScreen = ({ navigation, route }: Props) => {
  const { tripId } = route.params;
  const { data: trip, isLoading, isError } = useTripDetail(tripId);
  const { mutate: updateStatus, isPending } = useUpdateTripStatus(tripId);
  const { requestBackground } = useLocationPermission();
  const { isIgnoring, requestExemption, openSettings } = useBatteryOptimization();
  const [showBatteryModal, setShowBatteryModal] = useState(false);

  if (isLoading) {
    return (
      <BaseLayout>
        <Loader message="Loading trip…" />
      </BaseLayout>
    );
  }

  if (isError || !trip) {
    return (
      <BaseLayout>
        <View style={styles.center}>
          <AlertCircle size={36} color={colors.error} strokeWidth={1.5} />
          <Text style={styles.errorText}>Failed to load trip details</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </BaseLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[trip.status] ?? STATUS_CONFIG.SCHEDULED;
  const stops = Array.isArray(trip.stops) ? trip.stops : [];
  const from = stops[0]?.name ?? '—';
  const to = stops[stops.length - 1]?.name ?? '—';
  const totalPassengers = trip.totalPassengers ?? 0;
  const boardedCount    = trip.boardedCount ?? 0;
  const notBoardedCount = trip.notBoardedCount ?? 0;
  const noShowCount     = trip.noShowCount ?? 0;
  const boardingPct = totalPassengers > 0
    ? Math.round((boardedCount / totalPassengers) * 100)
    : 0;

  const handleStart = () => {
    modal.confirm(
      'Start Trip',
      'Confirm starting this trip? Make sure passengers are boarding.',
      async () => {
        // Request battery exemption — critical for Xiaomi/MIUI and other aggressive OEMs.
        if (isIgnoring === false) {
          await requestExemption();
          // Re-check after dialog closes; show fallback modal if still not granted.
          const { NativeModules, Platform } = require('react-native');
          if (Platform.OS === 'android') {
            const stillIgnoring = await NativeModules.BatteryOptimization.isIgnoringBatteryOptimizations();
            if (!stillIgnoring) {
              setShowBatteryModal(true);
              return; // Block trip start until exemption is granted.
            }
          }
        }
        await requestBackground();
        updateStatus('IN_PROGRESS');
      },
    );
  };

  const handleEnd = () => {
    modal.confirm(
      'End Trip',
      'Confirm completing this trip? This action cannot be undone.',
      () => updateStatus('COMPLETED'),
    );
  };

  return (
    <BaseLayout>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}>

        <View style={styles.heroCard}>
          <View style={styles.heroBusRow}>
            <View style={styles.busRow}>
              <Bus size={13} color={colors.tabBarInactive} strokeWidth={2} />
              <Text style={styles.busNumber}>{trip.busNumber}</Text>
            </View>
            <Text style={styles.heroDate}>{formatIndianDate(trip.date)}</Text>
          </View>

          <View style={styles.heroRouteRow}>
            <View style={styles.heroStop}>
              <Text style={styles.heroCity} numberOfLines={2}>{from}</Text>
              <Text style={styles.heroTime}>{formatTime(trip.scheduledDepartureAt)}</Text>
              {trip.actualDepartureAt && (
                <Text style={styles.heroActualTime}>
                  Actual: {formatTime(trip.actualDepartureAt!)}
                </Text>
              )}
            </View>
            <View style={styles.heroMiddle}>
              <View style={styles.heroLine} />
              <View style={styles.heroDot} />
              <View style={styles.heroLine} />
            </View>
            <View style={[styles.heroStop, styles.heroStopRight]}>
              <Text style={[styles.heroCity, { textAlign: 'right' }]} numberOfLines={2}>
                {to}
              </Text>
              <Text style={[styles.heroTime, { textAlign: 'right' }]}>
                {formatTime(trip.scheduledArrivalAt)}
              </Text>
              {trip.actualArrivalAt && (
                <Text style={[styles.heroActualTime, { textAlign: 'right' }]}>
                  Actual: {formatTime(trip.actualArrivalAt!)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.heroDivider} />

          <Text style={styles.routeName}>{trip.routeName}</Text>
        </View>

        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryTint }]}>
              <Users size={15} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{totalPassengers}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.successTint }]}>
              <CheckCircle2 size={15} color={colors.success} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{boardedCount}</Text>
            <Text style={styles.statLabel}>Boarded</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningTint }]}>
              <Clock size={15} color={colors.warning} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{notBoardedCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {trip.status !== 'SCHEDULED' && totalPassengers > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Boarding Progress</Text>
              <Text style={styles.progressPct}>{boardingPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${boardingPct}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              {boardedCount} of {totalPassengers} boarded
              {noShowCount > 0 ? ` · ${noShowCount} no-show` : ''}
            </Text>
          </View>
        )}

        {stops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route Stops</Text>
            <View style={styles.stopsCard}>
              {stops.map((stop, i) => (
                <View key={stop.id} style={styles.stopRow}>
                  <View style={styles.stopIndicator}>
                    <View
                      style={[
                        styles.stopDot,
                        i === 0 || i === stops.length - 1
                          ? styles.stopDotEndpoint
                          : styles.stopDotMid,
                      ]}
                    />
                    {i < stops.length - 1 && <View style={styles.stopLine} />}
                  </View>
                  <View style={styles.stopInfo}>
                    <Text
                      style={[
                        styles.stopName,
                        (i === 0 || i === stops.length - 1) &&
                          styles.stopNameEndpoint,
                      ]}>
                      {stop.name}
                    </Text>
                    {stop.durationToNext && i < stops.length - 1 && (
                      <Text style={styles.stopDuration}>{stop.durationToNext} min to next</Text>
                    )}
                  </View>
                  <View style={styles.stopSeqBadge}>
                    <Text style={styles.stopSeqText}>{stop.sequence}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {detailTripAllowsManifest(trip.status, trip.isCancelled) && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.TRIP_PASSENGERS, {
                tripId: trip.id,
                routeName: trip.routeName,
                canBoard: detailTripAllowsBoarding(trip.status),
              })
            }
            style={styles.passengersBtn}
            activeOpacity={0.8}>
            <Users size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.passengersBtnText}>View Passenger Manifest</Text>
            <View style={styles.passengersBtnCount}>
              <Text style={styles.passengersBtnCountText}>{totalPassengers}</Text>
            </View>
          </TouchableOpacity>
        )}

        {trip.isCancelled && trip.cancellationReason && (
          <View style={styles.cancelBanner}>
            <AlertCircle size={15} color={colors.error} strokeWidth={2} />
            <Text style={styles.cancelText}>{trip.cancellationReason}</Text>
          </View>
        )}
      </ScrollView>

      {trip.status === 'SCHEDULED' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={isPending}
            style={[styles.startBtn, isPending && styles.btnDisabled]}
            activeOpacity={0.85}>
            {isPending ? (
              <ActivityIndicator color={colors.surface} size={18} />
            ) : (
              <Text style={styles.startBtnText}>Start Trip</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {trip.status === 'IN_PROGRESS' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.TRIP_PASSENGERS, {
                tripId: trip.id,
                routeName: trip.routeName,
                canBoard: true,
              })
            }
            style={styles.boardBtn}
            activeOpacity={0.85}>
            <Text style={styles.boardBtnText}>Board Passengers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEnd}
            disabled={isPending}
            style={[styles.endBtn, isPending && styles.btnDisabled]}
            activeOpacity={0.85}>
            {isPending ? (
              <ActivityIndicator color={colors.error} size={18} />
            ) : (
              <Text style={styles.endBtnText}>End Trip</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <BatteryOptimizationModal
        visible={showBatteryModal}
        onRetry={async () => {
          await requestExemption();
          setShowBatteryModal(false);
        }}
        onOpenSettings={() => {
          openSettings();
          setShowBatteryModal(false);
        }}
        onClose={() => setShowBatteryModal(false)}
      />
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  backLink: {
    marginTop: 4,
  },
  backLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  scrollView: {
    marginHorizontal: -16,
  },
  scroll: {
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  heroBusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  heroDate: {
    fontSize: 12,
    color: colors.tabBarInactive,
    fontWeight: '500',
  },
  heroRouteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroStop: {
    flex: 2,
    gap: 3,
  },
  heroStopRight: {
    alignItems: 'flex-end',
  },
  heroCity: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  heroTime: {
    fontSize: 13,
    color: colors.tabBarInactive,
    fontWeight: '600',
  },
  heroActualTime: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '500',
  },
  heroMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: 6,
  },
  heroLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primaryMuted,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.primaryMuted,
  },
  routeName: {
    fontSize: 13,
    color: colors.tabBarInactive,
    fontWeight: '500',
  },
  statsStrip: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressPct: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  stopsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  stopIndicator: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  stopDotEndpoint: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primaryTint,
  },
  stopDotMid: {
    backgroundColor: colors.border,
  },
  stopLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 2,
    marginBottom: -2,
    alignSelf: 'center',
    minHeight: 24,
  },
  stopInfo: {
    flex: 1,
    paddingBottom: 16,
    gap: 2,
  },
  stopName: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stopNameEndpoint: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stopDuration: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  stopSeqBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.slateTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stopSeqText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate,
  },
  passengersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryTint,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  passengersBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  passengersBtnCount: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  passengersBtnCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  cancelBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.errorTint,
    borderRadius: 12,
    padding: 12,
  },
  cancelText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  startBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.2,
  },
  boardBtn: {
    flex: 1,
    backgroundColor: colors.primaryTint,
    paddingVertical: 14,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});

export default TripDetailScreen;
