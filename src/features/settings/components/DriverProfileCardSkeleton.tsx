import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../../theme/colors';

const DriverProfileCardSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.topRow}>
        <View style={styles.avatar} />
        <View style={styles.info}>
          <View style={styles.lineLong} />
          <View style={styles.lineShort} />
          <View style={styles.lineShort} />
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.statsRow}>
        <View style={styles.stat} />
        <View style={styles.statDivider} />
        <View style={styles.stat} />
        <View style={styles.statDivider} />
        <View style={styles.stat} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 8,
    paddingTop: 4,
  },
  lineLong: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    width: '70%',
  },
  lineShort: {
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.border,
    width: '50%',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
});

export default DriverProfileCardSkeleton;
