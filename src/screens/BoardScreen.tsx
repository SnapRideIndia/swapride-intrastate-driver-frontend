import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { Users, ChevronRight, ChevronDown, ChevronUp, ScanLine } from 'lucide-react-native';
import BaseLayout from '../layouts/BaseLayout';
import RecentBoardedBottomSheet from '../features/board/components/RecentBoardedBottomSheet';
import Loader from '../components/ui/Loader';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useMyTrips } from '../features/trips/hooks/useMyTrips';
import { useTripDetail } from '../features/trips/hooks/useTripDetail';
import { useTripPassengers, tripPassengersKey } from '../features/trips/hooks/useTripPassengers';
import { todayISO } from '../utils/dateUtils';

const BoardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const [recentSheetOpen, setRecentSheetOpen] = useState(false);

  const today = todayISO();
  const {
    data: inProgressData,
    isPending: tripsPending,
    isRefetching: tripsRefetching,
    refetch: refetchTrips,
  } = useMyTrips({
    status: 'IN_PROGRESS',
    date: today,
    limit: 1,
  });

  const activeTrip = inProgressData?.data[0] ?? null;
  const tripId = activeTrip?.id ?? '';

  const {
    data: tripDetail,
    isPending: detailPending,
    isRefetching: detailRefetching,
    refetch: refetchDetail,
  } = useTripDetail(tripId);

  const {
    data: passengers,
    isPending: passengersPending,
    isRefetching: passengersRefetching,
    refetch: refetchPassengers,
  } = useTripPassengers(tripId);

  const boardedPassengers = useMemo(
    () => (passengers ?? []).filter(p => p.boardingStatus === 'BOARDED'),
    [passengers],
  );

  useFocusEffect(
    useCallback(() => {
      if (tripId) {
        queryClient.invalidateQueries({ queryKey: tripPassengersKey(tripId) });
      }
      return () => setRecentSheetOpen(false);
    }, [tripId, queryClient]),
  );

  const initialLoading =
    tripsPending || (!!tripId && (detailPending || passengersPending));

  const refreshing = tripsRefetching || detailRefetching || passengersRefetching;

  const onRefresh = () => {
    refetchTrips();
    if (tripId) {
      refetchDetail();
      refetchPassengers();
    }
  };

  const totalPassengers =
    tripDetail?.totalPassengers ?? activeTrip?.totalPassengers ?? 0;
  const boardedCount = tripDetail?.boardedCount ?? boardedPassengers.length;

  const openPassengers = () => {
    if (!activeTrip) return;
    navigation.navigate(ROUTES.TRIP_PASSENGERS, {
      tripId: activeTrip.id,
      routeName: activeTrip.routeName,
      canBoard: true,
    });
  };

  const goHome = () => {
    navigation.navigate(ROUTES.MAIN_TABS, {
      screen: ROUTES.HOME,
    });
  };

  return (
    <BaseLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scroll,
          activeTrip && !initialLoading ? styles.scrollTripContent : null,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing && !initialLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>

        <View style={styles.header}>
          <Text style={styles.title}>Board Passengers</Text>
          <Text style={styles.subtitle}>
            Scan passenger tickets or open the manifest to mark passengers as boarded.
          </Text>
        </View>

        {initialLoading ? (
          <Loader message="Loading active trip…" fill={false} style={styles.loader} />
        ) : !activeTrip ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No trip in progress</Text>
            <Text style={styles.emptySub}>
              Start a trip from Home, then you can board passengers from the manifest.
            </Text>
            <TouchableOpacity onPress={goHome} style={styles.emptyBtn} activeOpacity={0.85}>
              <Text style={styles.emptyBtnText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.tripStatusBar}>
              <View style={styles.tripStatusLeft}>
                <View style={styles.liveIndicator} />
                <Text style={styles.tripRoute} numberOfLines={2}>
                  {activeTrip.routeName}
                </Text>
              </View>
              <View style={styles.tripStatusRight}>
                <Users size={13} color={colors.primary} strokeWidth={2} />
                <Text style={styles.tripCount}>
                  {boardedCount}/{totalPassengers || '—'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.manageRow}
              onPress={openPassengers}
              activeOpacity={0.75}>
              <View style={styles.manageTextCol}>
                <Text style={styles.manageTitle}>Passenger manifest</Text>
                <Text style={styles.manageSub}>Board, call, or review seats</Text>
              </View>
              <ChevronRight size={20} color={colors.primary} strokeWidth={2.2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate(ROUTES.SCAN_TICKET, {
                  tripId: activeTrip.id,
                  routeName: activeTrip.routeName,
                })
              }>
              <View style={styles.scanIconWrap}>
                <ScanLine size={26} color={colors.primary} strokeWidth={2.2} />
              </View>
              <View style={styles.scanTextCol}>
                <Text style={styles.scanCardTitle}>Scan passenger QR</Text>
                <Text style={styles.scanCardSub}>
                  Verify ticket & board in one step
                </Text>
              </View>
              <ChevronRight size={22} color={colors.primary} strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.linkFooter}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => setRecentSheetOpen(!recentSheetOpen)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
                <Text style={styles.linkText}>
                  {recentSheetOpen ? 'Hide Recently Boarded' : 'View Recent Boarded'}
                </Text>
                {recentSheetOpen ? (
                  <ChevronUp size={18} color={colors.primary} strokeWidth={2.4} />
                ) : (
                  <ChevronDown size={18} color={colors.primary} strokeWidth={2.4} />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <RecentBoardedBottomSheet
        visible={recentSheetOpen}
        onClose={() => setRecentSheetOpen(false)}
        boarded={boardedPassengers}
      />
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginHorizontal: -16,
  },
  scroll: {
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  scrollTripContent: {
    flexGrow: 1,
  },
  loader: {
    minHeight: 160,
    paddingVertical: 32,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
  },
  tripStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 10,
  },
  tripStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  liveIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  tripRoute: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  tripStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  tripCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  manageTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  manageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  manageSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  scanCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  scanCardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  linkFooter: {
    marginTop: 'auto',
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default BoardScreen;
