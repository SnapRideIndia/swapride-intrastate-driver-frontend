import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  MapPin,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import Loader from '../components/ui/Loader';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useTripPassengers } from '../features/trips/hooks/useTripPassengers';
import { useBoardPassenger } from '../features/trips/hooks/useBoardPassenger';
import type { TripPassenger, BoardingStatus } from '../features/trips/types';
import { formatBoardedDateTime } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.TRIP_PASSENGERS>;

type FilterKey = 'ALL' | BoardingStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NOT_BOARDED', label: 'Not Boarded' },
  { key: 'BOARDED', label: 'Boarded' },
  { key: 'NO_SHOW', label: 'No Show' },
];

const BOARDING_CONFIG: Record<BoardingStatus, { shortLabel: string; color: string; bg: string }> = {
  BOARDED: { shortLabel: 'Boarded', color: colors.success, bg: colors.successTint },
  NOT_BOARDED: { shortLabel: 'Pending', color: colors.warning, bg: colors.warningTint },
  NO_SHOW: { shortLabel: 'No show', color: colors.error, bg: colors.errorTint },
};

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

/** Normalize for tel: — keep leading +, strip spaces/dashes */
const toTelHref = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
};

const openPassengerDialer = async (phone: string) => {
  const num = toTelHref(phone);
  if (!num) {
    Alert.alert('No number', 'This passenger has no phone number on file.');
    return;
  }
  /** Use raw `tel:` — do not use `canOpenURL`: on iOS it returns false unless `tel` is in LSApplicationQueriesSchemes, which blocked the dialer. */
  const url = `tel:${num}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Cannot call', 'Something went wrong opening the dialer.');
  }
};

const PassengerRow = ({
  passenger,
  onBoard,
  isBoarding,
  canBoard,
}: {
  passenger: TripPassenger;
  onBoard: () => void;
  isBoarding: boolean;
  canBoard: boolean;
}) => {
  const cfg = BOARDING_CONFIG[passenger.boardingStatus];
  const hasPhone = Boolean(passenger.passengerPhone?.trim());
  const onCallPress = useCallback(() => {
    const raw = passenger.passengerPhone?.trim();
    if (!raw) {
      Alert.alert('No number', 'This passenger has no phone number on file.');
      return;
    }
    openPassengerDialer(raw);
  }, [passenger.passengerPhone]);

  const seatNumbers =
    passenger.seats.length === 0
      ? null
      : passenger.seats.length === 1
        ? passenger.seats[0]
        : passenger.seats.join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.rowMain}>
        <View style={styles.colAvatar}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(passenger.passengerName)}</Text>
          </View>
        </View>

        <View style={styles.colInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {passenger.passengerName}
          </Text>
          <View style={styles.statusSeatRow}>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              {passenger.boardingStatus === 'BOARDED' ? (
                <CheckCircle2 size={12} color={colors.success} strokeWidth={2} />
              ) : passenger.boardingStatus === 'NOT_BOARDED' ? (
                <Clock size={12} color={colors.warning} strokeWidth={2} />
              ) : (
                <XCircle size={12} color={colors.error} strokeWidth={2} />
              )}
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.shortLabel}</Text>
            </View>
            {seatNumbers ? (
              <Text style={styles.seatLine} numberOfLines={1} ellipsizeMode="tail">
                <Text style={styles.seatLabel}>Seat No: </Text>
                <Text style={styles.seatValue}>{seatNumbers}</Text>
              </Text>
            ) : (
              <Text style={styles.seatLineMuted} numberOfLines={1}>
                Seat No: —
              </Text>
            )}
          </View>
          {passenger.boardingStatus === 'BOARDED' &&
          passenger.boardedAt != null &&
          passenger.boardedAt !== '' ? (
            <View style={styles.boardedAtRow}>
              <Clock size={12} color={colors.textSecondary} strokeWidth={2} />
              <Text style={styles.boardedAtText} numberOfLines={2}>
                {formatBoardedDateTime(passenger.boardedAt)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.colActions}>
          {passenger.boardingStatus === 'NOT_BOARDED' && canBoard ? (
            <TouchableOpacity
              onPress={onBoard}
              disabled={isBoarding}
              style={styles.boardBtn}
              activeOpacity={0.85}
              accessibilityLabel="Mark as boarded">
              {isBoarding ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={styles.boardBtnText}>Board</Text>
              )}
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={onCallPress}
            disabled={!hasPhone}
            style={[styles.callIconBtn, !hasPhone && styles.callIconBtnDisabled]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.7}
            accessibilityLabel={hasPhone ? `Call ${passenger.passengerName}` : 'No phone number'}
            accessibilityRole="button">
            <Phone size={17} color={hasPhone ? colors.primary : colors.border} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.routeLine} numberOfLines={1} ellipsizeMode="tail">
        {passenger.pickupStop} → {passenger.dropStop}
      </Text>
    </View>
  );
};

const PassengersScreen = ({ navigation, route }: Props) => {
  const { tripId, routeName, canBoard } = route.params;
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');
  const [boardingId, setBoardingId] = useState<string | null>(null);

  const { data: passengers, isLoading, refetch, isRefetching } = useTripPassengers(tripId);
  const { mutate: board } = useBoardPassenger(tripId);

  const filtered = useMemo(() => {
    if (!passengers) return [];
    if (activeFilter === 'ALL') return passengers;
    return passengers.filter(p => p.boardingStatus === activeFilter);
  }, [passengers, activeFilter]);

  const counts = useMemo(() => {
    if (!passengers) return { ALL: 0, BOARDED: 0, NOT_BOARDED: 0, NO_SHOW: 0 };
    return {
      ALL: passengers.length,
      BOARDED: passengers.filter(p => p.boardingStatus === 'BOARDED').length,
      NOT_BOARDED: passengers.filter(p => p.boardingStatus === 'NOT_BOARDED').length,
      NO_SHOW: passengers.filter(p => p.boardingStatus === 'NO_SHOW').length,
    };
  }, [passengers]);

  const handleBoard = (bookingId: string) => {
    setBoardingId(bookingId);
    board(bookingId, { onSettled: () => setBoardingId(null) });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}>
          <ChevronLeft size={22} color={colors.surface} strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Passengers</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{routeName}</Text>
        </View>
        <View style={styles.countPill}>
          <Users size={13} color={colors.primary} strokeWidth={2} />
          <Text style={styles.countPillText}>{counts.ALL}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const active = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[styles.filterTab, active && styles.filterTabActive]}
              activeOpacity={0.75}>
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                {f.label}
              </Text>
              <View style={[styles.filterCount, active && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
                  {counts[f.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTES.ROUTE_MANIFEST, { tripId, routeName })}
        style={styles.roadmapBtn}
        activeOpacity={0.7}>
        <MapPin size={14} color={colors.primary} strokeWidth={2.5} />
        <Text style={styles.roadmapBtnText}>View Detailed Route Roadmap</Text>
      </TouchableOpacity>

      {isLoading ? (
        <Loader message="Loading passengers…" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.bookingId}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            !canBoard ? (
              <View style={styles.readOnlyBanner}>
                <Clock size={18} color={colors.warning} strokeWidth={2} />
                <View style={styles.readOnlyBannerText}>
                  <Text style={styles.readOnlyBannerTitle}>Trip not started</Text>
                  <Text style={styles.readOnlyBannerSub}>
                    You can view the manifest now. Start the trip to board passengers.
                  </Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <PassengerRow
              passenger={item}
              onBoard={() => handleBoard(item.bookingId)}
              isBoarding={boardingId === item.bookingId}
              canBoard={canBoard}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Users size={40} color={colors.border} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No passengers</Text>
              <Text style={styles.emptySub}>
                {activeFilter === 'ALL'
                  ? 'No confirmed bookings for this trip'
                  : `No ${activeFilter.toLowerCase().replace('_', ' ')} passengers`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 12,
    color: colors.tabBarInactive,
    fontWeight: '500',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  filterTabActive: {
    backgroundColor: colors.primaryTint,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.primary,
  },
  filterCount: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: colors.primary,
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterCountTextActive: {
    color: colors.surface,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.warningTint,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  readOnlyBannerText: {
    flex: 1,
    gap: 4,
  },
  readOnlyBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  readOnlyBannerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardGap: {
    height: 8,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  colAvatar: {
    flexShrink: 0,
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  colInfo: {
    flex: 1,
    minWidth: 0,
    gap: 5,
    justifyContent: 'center',
  },
  statusSeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  colActions: {
    flexShrink: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  callIconBtnDisabled: {
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  seatLine: {
    fontSize: 13,
    flexShrink: 1,
    minWidth: 0,
  },
  seatLabel: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  seatValue: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seatLineMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    flexShrink: 1,
    minWidth: 0,
  },
  boardedAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    minWidth: 0,
  },
  boardedAtText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    minWidth: 0,
  },
  routeLine: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  boardBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.primary,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface,
  },
  empty: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  roadmapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roadmapBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default PassengersScreen;
