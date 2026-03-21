import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';
import {
  CheckCircle2,
  Bus,
  MapPin,
  User,
  Hash,
  Smartphone,
} from 'lucide-react-native';
import BaseLayout from '../layouts/BaseLayout';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.BOARD_SCAN_SUCCESS
>;

const Row = ({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delay: number;
}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    style={styles.row}
  >
    <View style={styles.rowIcon}>
      <Icon size={18} color={colors.primary} strokeWidth={2.2} />
    </View>
    <View style={styles.rowBody}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </Animated.View>
);

const BoardScanSuccessScreen = ({ navigation, route }: Props) => {
  const { result } = route.params;

  const seats =
    result.booking?.seats?.length > 0 ? result.booking.seats.join(', ') : '—';
  const name = result.passenger?.name?.trim() || 'Passenger';
  const phone = result.passenger?.mobileNumber?.trim() || '—';
  const routeLabel = result.trip?.route?.trim() || '—';
  const bus = result.trip?.busNumber?.trim() || '—';
  const pickup = result.booking?.pickup?.trim();
  const dropoff = result.booking?.dropoff?.trim();

  const scanAnother = () => {
    navigation.replace(ROUTES.SCAN_TICKET, {
      tripId: result.trip.id,
      routeName: result.trip?.route,
    });
  };

  const done = () => {
    navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.SCAN });
  };

  return (
    <BaseLayout style={{ backgroundColor: colors.surface }}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 24 + 88 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={ZoomIn.springify().damping(14)}
            style={styles.heroIcon}
          >
            <CheckCircle2 size={56} color={colors.success} strokeWidth={2.2} />
          </Animated.View>

          <Animated.Text entering={FadeIn.delay(120)} style={styles.title}>
            Boarded successfully
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(180)} style={styles.subtitle}>
            {result.message || 'Passenger is marked as boarded for this trip.'}
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(220).springify()}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Passenger</Text>
            <Row icon={User} label="Name" value={name} delay={260} />
            <Row icon={Smartphone} label="Mobile" value={phone} delay={300} />
            <Row icon={Hash} label="Seats" value={seats} delay={340} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(380).springify()}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Trip</Text>
            <Row icon={MapPin} label="Route" value={routeLabel} delay={420} />
            <Row icon={Bus} label="Bus" value={bus} delay={460} />
            {pickup ? (
              <Row icon={MapPin} label="Pickup" value={pickup} delay={500} />
            ) : null}
            {dropoff ? (
              <Row icon={MapPin} label="Drop-off" value={dropoff} delay={540} />
            ) : null}
          </Animated.View>

          <Animated.Text entering={FadeIn.delay(560)} style={styles.bookingId}>
            Booking ID · {result.bookingId}
          </Animated.Text>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 16 }]}>
          <Pressable style={styles.btnSecondary} onPress={done}>
            <Text style={styles.btnSecondaryText}>Back to Board</Text>
          </Pressable>
          <Pressable style={styles.btnPrimary} onPress={scanAnother}>
            <Text style={styles.btnPrimaryText}>Scan another</Text>
          </Pressable>
        </View>
      </View>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingTop: 12,
  },
  heroIcon: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookingId: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    // BaseLayout adds horizontal padding; extend footer to full screen width.
    left: -16,
    right: -16,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default BoardScanSuccessScreen;
