import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Clock, Users } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import type { TripPassenger } from '../../trips/types';
import { formatBoardedDateTime } from '../../../utils/dateUtils';

type Props = {
  visible: boolean;
  onClose: () => void;
  boarded: TripPassenger[];
};

const getInitial = (name: string) =>
  name.trim().charAt(0).toUpperCase() || '?';

const RecentBoardedBottomSheet = ({ visible, onClose, boarded }: Props) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  const sortedBoarded = useMemo(() => {
    return [...boarded].sort((a, b) => {
      const ta = a.boardedAt ? Date.parse(a.boardedAt) : 0;
      const tb = b.boardedAt ? Date.parse(b.boardedAt) : 0;
      return tb - ta;
    });
  }, [boarded]);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;

    const slideDistance = Math.ceil(Dimensions.get('window').height);

    if (visible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(slideDistance);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: slideDistance,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [mounted, visible, backdropOpacity, sheetTranslateY]);

  const sheetMaxHeight = useMemo(() => {
    const pct = Platform.OS === 'ios' ? 0.78 : 0.8;
    return Math.round(windowHeight * pct);
  }, [windowHeight]);

  /** ScrollView needs a bounded height; otherwise it often lays out with 0px inside modal + Pressable. */
  const listMaxHeight = useMemo(
    () =>
      Math.max(
        200,
        Math.round(windowHeight * 0.5) - 120,
      ),
    [windowHeight],
  );

  const sheetDynamicStyle = {
    paddingBottom: Math.max(insets.bottom, 16),
    maxHeight: sheetMaxHeight,
  };

  return (
    <Modal
      visible={mounted}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
      hardwareAccelerated={Platform.OS === 'android'}>
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Animated.View
          pointerEvents="box-none"
          style={[styles.backdropFill, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetOuter,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
          pointerEvents="box-none">
          {/* View (not Pressable): Pressable was collapsing ScrollView height in this layout */}
          <View style={[styles.sheet, sheetDynamicStyle]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Recently boarded</Text>

            {sortedBoarded.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Users size={28} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>No passengers boarded yet</Text>
                <Text style={styles.emptySub}>
                  Open the passenger manifest and mark passengers as boarded.
                  They’ll show up here.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sheetSub}>
                  {sortedBoarded.length} passenger
                  {sortedBoarded.length === 1 ? '' : 's'} on this trip
                </Text>
                <ScrollView
                  style={[styles.listScroll, { maxHeight: listMaxHeight }]}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={sortedBoarded.length > 4}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled>
                  {sortedBoarded.map((passenger, index) => {
                    const seat =
                      passenger.seats.length === 0
                        ? '—'
                        : passenger.seats.length === 1
                          ? passenger.seats[0]
                          : passenger.seats.join(', ');
                    const boardedLabel =
                      passenger.boardedAt != null && passenger.boardedAt !== ''
                        ? formatBoardedDateTime(passenger.boardedAt)
                        : 'Boarded';
                    return (
                      <View
                        key={passenger.bookingId || `boarded-${index}`}
                        style={[
                          styles.row,
                          index < sortedBoarded.length - 1 && styles.rowBorder,
                        ]}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {getInitial(passenger.passengerName)}
                          </Text>
                        </View>
                        <View style={styles.rowBody}>
                          <Text style={styles.name} numberOfLines={1}>
                            {passenger.passengerName}
                          </Text>
                          <View style={styles.meta}>
                            <Text style={styles.seat}>Seat {seat}</Text>
                            <View style={styles.metaDot} />
                            <Clock
                              size={11}
                              color={colors.textSecondary}
                              strokeWidth={2}
                            />
                            <Text style={styles.boardedLabel} numberOfLines={2}>
                              {boardedLabel}
                            </Text>
                          </View>
                        </View>
                        <CheckCircle2
                          size={20}
                          color={colors.success}
                          strokeWidth={2}
                        />
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheetOuter: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  listScroll: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seat: {
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
  boardedLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default RecentBoardedBottomSheet;
