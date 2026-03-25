import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Phone,
} from 'lucide-react-native';
import BaseLayout from '../layouts/BaseLayout';
import Loader from '../components/ui/Loader';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useTripDetail } from '../features/trips/hooks/useTripDetail';
import { useTripPassengers } from '../features/trips/hooks/useTripPassengers';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.ROUTE_MANIFEST>;

/** Normalize for tel: - keep leading +, strip spaces/dashes */
const toTelHref = (raw: string) => {
  const trimmed = raw?.trim();
  if (!trimmed) return '';
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
};

const openPassengerDialer = async (phone: string, _name: string) => {
  const num = toTelHref(phone);
  if (!num) {
    Alert.alert('No number', 'This passenger has no phone number on file.');
    return;
  }
  
  try {
    await Linking.openURL(`tel:${num}`);
  } catch {
    Alert.alert('Error', 'Unable to open the dialer.');
  }
};

const BOARDING_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  BOARDED: { label: 'Boarded', color: colors.success, bg: colors.successTint },
  NOT_BOARDED: { label: 'Pending', color: colors.warning, bg: colors.warningTint },
  NO_SHOW: { label: 'No Show', color: colors.error, bg: colors.errorTint },
};

const RouteManifestScreen = ({ navigation, route }: Props) => {
  const { tripId, routeName } = route.params;
  
  const { 
    data: trip, 
    isLoading: tripLoading, 
    isError: tripError 
  } = useTripDetail(tripId);
  
  const { 
    data: passengers = [], 
    isLoading: passengersLoading,
    isRefetching: passengersRefetching 
  } = useTripPassengers(tripId);

  const [expandedStops, setExpandedStops] = useState<Record<number, boolean>>({});

  const toggleStop = (index: number) => {
    setExpandedStops(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const isLoading = tripLoading || passengersLoading;

  if (isLoading && !passengersRefetching) {
    return (
      <BaseLayout>
        <Loader message="Planning travel roadmap…" />
      </BaseLayout>
    );
  }

  if (tripError || !trip) {
    return (
      <BaseLayout>
        <View style={styles.center}>
          <AlertCircle size={36} color={colors.error} strokeWidth={1.5} />
          <Text style={styles.errorText}>Failed to load route roadmap</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </BaseLayout>
    );
  }

  const stops = Array.isArray(trip.stops) ? trip.stops : [];

  return (
    <BaseLayout>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitle}>Route Roadmap</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{routeName}</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}>
        
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Boarding</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <Text style={styles.legendText}>Dropping</Text>
          </View>
        </View>

        {stops.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color={colors.border} strokeWidth={1} />
            <Text style={styles.emptyText}>No stops defined</Text>
          </View>
        ) : (
          <View style={styles.roadmap}>
            {stops.map((stop, index) => {
              const bPassengers = passengers.filter(p => p.pickupStop === stop.name);
              const dPassengers = passengers.filter(p => p.dropStop === stop.name);
              const isExpanded = !!expandedStops[index];
              const isLast = index === stops.length - 1;

              return (
                <View key={stop.id} style={styles.stopContainer}>
                  {/* Timeline Indicator */}
                  <View style={styles.indicatorContainer}>
                    <View style={[
                      styles.node,
                      index === 0 ? styles.originNode : isLast ? styles.destNode : styles.midNode,
                      isExpanded && styles.activeNode
                    ]} />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  <View style={styles.content}>
                    <TouchableOpacity 
                      style={styles.stopHeader}
                      onPress={() => toggleStop(index)}
                      activeOpacity={0.6}>
                      <View style={styles.stopInfo}>
                        <View style={styles.nameRow}>
                          <Text style={[
                            styles.stopName,
                            (index === 0 || isLast) && styles.stopNameBold
                          ]} numberOfLines={1}>
                            {stop.name}
                          </Text>
                          {index === 0 && <Text style={styles.typeTag}>START</Text>}
                          {isLast && <Text style={[styles.typeTag, styles.destTag]}>END</Text>}
                        </View>
                        
                        <View style={styles.activityRow}>
                          {bPassengers.length > 0 && (
                            <View style={styles.activityBadge}>
                              <Text style={styles.activityIn}>+{bPassengers.length}</Text>
                            </View>
                          )}
                          {dPassengers.length > 0 && (
                            <View style={[styles.activityBadge, styles.activityBadgeOut]}>
                              <Text style={styles.activityOut}>-{dPassengers.length}</Text>
                            </View>
                          )}
                          {bPassengers.length === 0 && dPassengers.length === 0 && (
                             <Text style={styles.quietText}>No activity</Text>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.chevron}>
                        {isExpanded ? (
                          <ChevronUp size={16} color={colors.textSecondary} />
                        ) : (
                          <ChevronDown size={16} color={colors.textSecondary} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.passengerList}>
                        {bPassengers.length > 0 && (
                          <View style={styles.group}>
                            <Text style={styles.groupHeader}>BOARDING PASSENGERS</Text>
                            {bPassengers.map((p, i) => {
                              const st = BOARDING_CONFIG[p.boardingStatus] ?? BOARDING_CONFIG.NOT_BOARDED;
                              return (
                                <View key={p.bookingId + i} style={[styles.pItem, i === bPassengers.length - 1 && styles.pItemLast]}>
                                  <View style={styles.pDetails}>
                                    <Text style={styles.pName}>{p.passengerName}</Text>
                                    <Text style={styles.pSeat}>Seat: {p.seats.join(', ')}</Text>
                                  </View>
                                  <View style={styles.pControlsRow}>
                                    <View style={[styles.pStatusBadge, { backgroundColor: st.bg }]}>
                                      <Text style={[styles.pStatusText, { color: st.color }]}>{st.label}</Text>
                                    </View>
                                    <TouchableOpacity 
                                      onPress={() => openPassengerDialer(p.passengerPhone, p.passengerName)}
                                      style={styles.callControl}
                                      activeOpacity={0.7}>
                                      <Phone size={14} color={colors.primary} strokeWidth={2.5} />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}

                        {dPassengers.length > 0 && (
                          <View style={styles.group}>
                            <Text style={[styles.groupHeader, { color: colors.error }]}>DROPPING PASSENGERS</Text>
                            {dPassengers.map((p, i) => {
                              const st = BOARDING_CONFIG[p.boardingStatus] ?? BOARDING_CONFIG.NOT_BOARDED;
                              return (
                                <View key={p.bookingId + i} style={[styles.pItem, i === dPassengers.length - 1 && styles.pItemLast]}>
                                  <View style={styles.pDetails}>
                                    <Text style={styles.pName}>{p.passengerName}</Text>
                                    <Text style={styles.pSeat}>Seat: {p.seats.join(', ')}</Text>
                                  </View>
                                  <View style={styles.pControlsRow}>
                                    <View style={[styles.pStatusBadge, { backgroundColor: st.bg }]}>
                                      <Text style={[styles.pStatusText, { color: st.color }]}>{st.label}</Text>
                                    </View>
                                    <TouchableOpacity 
                                      onPress={() => openPassengerDialer(p.passengerPhone, p.passengerName)}
                                      style={styles.callControl}
                                      activeOpacity={0.7}>
                                      <Phone size={14} color={colors.primary} strokeWidth={2.5} />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
                        {bPassengers.length === 0 && dPassengers.length === 0 && (
                          <View style={styles.emptyStopGroup}>
                            <Text style={styles.noPassengersText}>No passenger activity at this stop</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrapper: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: -2,
  },
  scrollView: { marginHorizontal: -16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  backLink: { marginTop: 4 },
  backLinkText: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  
  roadmap: { paddingLeft: 4 },
  stopContainer: { flexDirection: 'row' },
  indicatorContainer: { width: 30, alignItems: 'center' },
  node: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginTop: 8,
    zIndex: 2,
    borderWidth: 2,
    borderColor: colors.background,
  },
  originNode: {
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },
  destNode: {
    backgroundColor: colors.slate,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },
  midNode: { backgroundColor: colors.border, borderWidth: 1.5, borderColor: colors.primary },
  timelineLine: {
    position: 'absolute',
    top: 20,
    bottom: -10,
    left: 14,
    width: 1.5,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 28,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stopInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stopName: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  stopNameBold: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  typeTag: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.primary,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  destTag: { color: colors.slate, backgroundColor: colors.slateTint },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activityBadge: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activityBadgeOut: { backgroundColor: colors.errorTint },
  activityIn: { fontSize: 11, fontWeight: '800', color: colors.success },
  activityOut: { fontSize: 11, fontWeight: '800', color: colors.error },
  quietText: { fontSize: 10, color: colors.textSecondary, fontStyle: 'italic', opacity: 0.6 },
  chevron: { padding: 4 },

  passengerList: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  group: { paddingBottom: 4 },
  groupHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  pItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    justifyContent: 'space-between',
  },
  pItemLast: { borderBottomWidth: 0 },
  pDetails: { flex: 1, gap: 1 },
  pControlsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  pStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  pStatusText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pSeat: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  callControl: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStopGroup: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPassengersText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  activeNode: {
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: colors.surface,
    transform: [{ scale: 1.3 }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default RouteManifestScreen;
