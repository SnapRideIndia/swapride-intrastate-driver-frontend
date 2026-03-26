import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, X } from 'lucide-react-native';
import BaseLayout from '../layouts/BaseLayout';
import Loader from '../components/ui/Loader';
import DatePicker, { openAndroidDatePicker } from '../components/ui/DatePicker';
import TripCard from '../features/trips/components/TripCard';
import TripFilterTab from '../features/trips/components/TripFilterTab';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useMyTrips } from '../features/trips/hooks/useMyTrips';
import type { BackendTripStatus } from '../features/trips/types';
import { dateToISO, formatShortDate } from '../utils/dateUtils';
import { sortTripsByScheduledTime } from '../features/trips/tripUtils';

type FilterOption = {
  key: BackendTripStatus;
  label: string;
};

const FILTERS: FilterOption[] = [
  { key: 'IN_PROGRESS', label: 'Ongoing'   },
  { key: 'SCHEDULED',   label: 'Upcoming'  },
  { key: 'COMPLETED',   label: 'Completed' },
];

const TripsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<BackendTripStatus>('IN_PROGRESS');
  const [dateFilter, setDateFilter]     = useState<string | undefined>(undefined);
  const [showPicker, setShowPicker]     = useState(false);

  const { data, isLoading, isRefetching, refetch } = useMyTrips({
    status: activeFilter,
    date: dateFilter,
    limit: 20,
  });

  const trips = sortTripsByScheduledTime(data?.data ?? []);

  const onDateChange = useCallback((date: Date) => {
    setDateFilter(dateToISO(date));
    setShowPicker(false);
  }, []);

  const openDatePicker = useCallback(() => {
    if (Platform.OS === 'android') {
      openAndroidDatePicker({
        value: dateFilter ? new Date(dateFilter) : new Date(),
        onChange: onDateChange,
      });
      return;
    }
    setShowPicker(true);
  }, [dateFilter, onDateChange]);

  const clearDateFilter = () => setDateFilter(undefined);

  const filterOptions = FILTERS.map(f => ({ key: f.key, label: f.label }));

  return (
    <BaseLayout>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Trips</Text>
            <Text style={styles.subtitle}>Manage your route assignments</Text>
          </View>

          <View style={styles.dateBtnRow}>
            {dateFilter ? (
              <>
                <View style={styles.dateBtnActive}>
                  <Calendar size={13} color={colors.surface} strokeWidth={2} />
                  <Text style={styles.dateBtnTextActive}>{formatShortDate(dateFilter)}</Text>
                </View>
                <TouchableOpacity onPress={clearDateFilter} style={styles.clearBtn} activeOpacity={0.7}>
                  <X size={14} color={colors.textSecondary} strokeWidth={2.5} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={openDatePicker}
                style={styles.dateBtn}
                activeOpacity={0.75}>
                <Calendar size={13} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.dateBtnText}>Date</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TripFilterTab
          options={filterOptions}
          active={activeFilter}
          onChange={v => setActiveFilter(v as BackendTripStatus)}
        />
      </View>

      <DatePicker
        show={showPicker}
        value={dateFilter ? new Date(dateFilter) : new Date()}
        onChange={onDateChange}
        onClose={() => setShowPicker(false)}
      />

      {isLoading ? (
        <Loader message="Loading trips…" />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            trips.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => navigation.navigate(ROUTES.TRIP_DETAIL, { tripId: item.id })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No {FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} trips
              </Text>
              <Text style={styles.emptySubtitle}>
                {dateFilter
                  ? `No trips on ${formatShortDate(dateFilter)}`
                  : 'Your trips will appear here'}
              </Text>
            </View>
          }
        />
      )}
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    gap: 16,
    marginBottom: 8,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    marginTop: 2,
  },
  dateBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  dateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  dateBtnTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: 24,
  },
  listEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    paddingVertical: 64,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default TripsScreen;
