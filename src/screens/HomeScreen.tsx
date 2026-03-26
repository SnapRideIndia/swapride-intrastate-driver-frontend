import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, MapPin, User } from 'lucide-react-native';
import BaseLayout from '../layouts/BaseLayout';
import Loader from '../components/ui/Loader';
import ActiveTripCard from '../features/home/components/ActiveTripCard';
import UpcomingTripCard from '../features/home/components/UpcomingTripCard';
import StatsRow from '../features/home/components/StatsRow';
import { colors } from '../theme/colors';
import useDriverLocation from '../features/driverLocation/hooks/useDriverLocation';
import { useLocationPermission } from '../features/driverLocation/hooks/useLocationPermission';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useDriver } from '../context/DriverContext';
import { useMyTrips } from '../features/trips/hooks/useMyTrips';
import { useUpdateTripStatus } from '../features/trips/hooks/useUpdateTripStatus';
import { modal } from '../lib/modal';
import type { ApiTripSummary } from '../features/trips/types';
import { getGreeting, formatFullDate } from '../utils/dateUtils';
import { getDriverDisplayName } from '../features/driver/profileUtils';
import { listTripStatusAllowsBoarding } from '../features/trips/tripStatusUtils';
import { sortTripsByScheduledTime } from '../features/trips/tripUtils';
import { useNotificationStats } from '../features/notifications/hooks/useNotifications';

type ActiveTripActionsProps = {
  trip: ApiTripSummary;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  isTracking: boolean;
};

const ActiveTripActions = ({ trip, navigation, isTracking }: ActiveTripActionsProps) => {
  const { mutate: updateStatus } = useUpdateTripStatus(trip.id);

  const handleEndTrip = () => {
    modal.confirm('End Trip', 'Confirm completing this trip?', () => updateStatus('COMPLETED'));
  };

  return (
    <ActiveTripCard
      trip={trip}
      isTracking={isTracking}
      onViewPassengers={() =>
        navigation.navigate(ROUTES.TRIP_PASSENGERS, {
          tripId: trip.id,
          routeName: trip.routeName,
          canBoard: true,
        })
      }
      onViewManifest={() =>
        navigation.navigate(ROUTES.ROUTE_MANIFEST, {
          tripId: trip.id,
          routeName: trip.routeName,
        })
      }
      onEndTrip={handleEndTrip}
    />
  );
};

type UpcomingTripActionsProps = {
  trip: ApiTripSummary;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  requestBackground: () => Promise<string>;
};

const UpcomingTripActions = ({ trip, navigation, requestBackground }: UpcomingTripActionsProps) => {
  const { mutate: updateStatus } = useUpdateTripStatus(trip.id);

  const handleStartTrip = () => {
    modal.confirm('Start Trip', 'Confirm starting this trip?', async () => {
      await requestBackground();
      updateStatus('IN_PROGRESS');
    });
  };

  const openManifest = () =>
    navigation.navigate(ROUTES.TRIP_PASSENGERS, {
      tripId: trip.id,
      routeName: trip.routeName,
      canBoard: listTripStatusAllowsBoarding(trip.status),
    });

  return (
    <UpcomingTripCard
      trip={trip}
      onStartTrip={handleStartTrip}
      onViewPassengers={openManifest}
      onViewManifest={() =>
        navigation.navigate(ROUTES.ROUTE_MANIFEST, {
          tripId: trip.id,
          routeName: trip.routeName,
        })
      }
    />
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { driver } = useDriver();
  const { data: stats } = useNotificationStats();

  const unreadCount = stats?.unreadCount ?? 0;

  const {
    isGranted,
    isChecking: permissionIsChecking,
    status: permissionStatus,
    requestForeground,
    requestBackground,
    goToSettings,
  } = useLocationPermission();

  useEffect(() => {
    if (permissionStatus === 'denied') {
      const t = setTimeout(requestForeground, 800);
      return () => clearTimeout(t);
    }
  }, [permissionStatus]);

  const {
    data: inProgressData,
    isPending: inProgressPending,
    isRefetching: rIP,
    refetch: refetchIP,
  } = useMyTrips({
    status: 'IN_PROGRESS',
    limit: 1,
  });
  const {
    data: scheduledData,
    isPending: scheduledPending,
    isRefetching: rSC,
    refetch: refetchSC,
  } = useMyTrips({
    status: 'SCHEDULED',
    limit: 5,
  });

  const tripsInitialLoading = inProgressPending || scheduledPending;

  const inProgressTrips = sortTripsByScheduledTime(inProgressData?.data ?? []);
  const scheduledTrips = sortTripsByScheduledTime(scheduledData?.data ?? []);

  const activeTrip = inProgressTrips[0] ?? null;
  const upcomingTrips = scheduledTrips;
  const nextTrip = upcomingTrips[0] ?? null;

  const totalPassengers = inProgressTrips.reduce((acc, t) => acc + t.totalPassengers, 0);
  const totalTrips = (inProgressData?.pagination.total ?? 0) + (scheduledData?.pagination.total ?? 0);

  const { isTracking, error: locationError } = useDriverLocation(
    activeTrip?.id ?? null,
    isGranted,
    permissionIsChecking,
  );

  const isGpsDisabled = locationError?.code === 2;
  const showBanner = !permissionIsChecking && (!isGranted || isGpsDisabled);

  const isRefreshing = rIP || rSC;
  const handleRefresh = () => {
    refetchIP();
    refetchSC();
  };

  return (
    <BaseLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.driverName}>{driver ? getDriverDisplayName(driver) : 'Partner'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.dateText}>{formatFullDate()}</Text>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              activeOpacity={0.7}
            >
              <Bell size={20} color={colors.textPrimary} strokeWidth={2} />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation.navigate(ROUTES.SETTINGS)}
              activeOpacity={0.7}
            >
              {driver?.profileUrl ? (
                <Image source={{ uri: driver.profileUrl }} style={styles.profileImg} />
              ) : (
                <User size={20} color={colors.textPrimary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {showBanner && (
          <View style={[styles.permissionCard, isGpsDisabled && styles.permissionCardWarning]}>
            <View style={styles.permissionInfo}>
              <View style={[styles.permissionIconBg, isGpsDisabled && styles.permissionIconBgWarning]}>
                <MapPin size={20} color={isGpsDisabled ? colors.error : colors.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={styles.permissionTitle}>{isGpsDisabled ? 'GPS is Disabled' : 'Permissions Required'}</Text>
                <Text style={styles.permissionSubtitle}>
                  {isGpsDisabled
                    ? 'Turn on GPS to share your live bus position.'
                    : 'Location and Notification permissions are needed to track your trip.'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.permissionBtn, isGpsDisabled && styles.permissionBtnWarning]}
              onPress={
                isGpsDisabled
                  ? () => requestForeground()
                  : permissionStatus === 'blocked'
                  ? goToSettings
                  : requestForeground
              }
              activeOpacity={0.8}
            >
              <Text style={styles.permissionBtnText}>
                {isGpsDisabled ? 'Enable' : permissionStatus === 'blocked' ? 'Settings' : 'Enable'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {tripsInitialLoading ? (
          <Loader message="Loading trips…" fill={false} style={styles.tripsLoader} />
        ) : (
          <>
            {activeTrip ? (
              <ActiveTripActions trip={activeTrip} navigation={navigation} isTracking={isTracking} />
            ) : nextTrip ? (
              <UpcomingTripActions trip={nextTrip} navigation={navigation} requestBackground={requestBackground} />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No active trips</Text>
                <Text style={styles.emptySubtitle}>Your next assignment will appear here</Text>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trips Summary</Text>
            </View>
            <StatsRow trips={totalTrips} passengers={totalPassengers} />

            {upcomingTrips.length > (activeTrip ? 0 : 1) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Trips</Text>
                <View style={styles.laterList}>
                  {(activeTrip ? upcomingTrips : upcomingTrips.slice(1)).map(trip => (
                    <UpcomingTripActions
                      key={trip.id}
                      trip={trip}
                      navigation={navigation}
                      requestBackground={requestBackground}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: { marginHorizontal: -16 },
  scroll: { gap: 20, paddingHorizontal: 16, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  bellBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.surface,
    lineHeight: 11,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  driverName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tripsLoader: {
    minHeight: 200,
    paddingVertical: 32,
  },
  sectionHeader: { marginBottom: -10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  section: { gap: 12 },
  laterList: { gap: 12 },
  permissionCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  permissionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTextWrapper: {
    flex: 1,
    gap: 2,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permissionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surface,
  },
  permissionCardWarning: {
    borderColor: colors.errorTint,
    backgroundColor: colors.surface,
  },
  permissionIconBgWarning: {
    backgroundColor: colors.errorTint,
  },
  permissionBtnWarning: {
    backgroundColor: colors.error,
  },
});

export default HomeScreen;
