import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  WifiOff,
  X,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { ToastItem } from '../../lib/toast';

type Props = {
  item: ToastItem;
  onDismiss: (id: string) => void;
};

const CONFIG = {
  success: {
    Icon: CheckCircle2,
    iconColor: colors.success,
    barColor: colors.success,
  },
  error: {
    Icon: XCircle,
    iconColor: colors.error,
    barColor: colors.error,
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: colors.warning,
    barColor: colors.warning,
  },
  info: {
    Icon: Info,
    iconColor: colors.primary,
    barColor: colors.primary,
  },
  network: {
    Icon: WifiOff,
    iconColor: colors.error,
    barColor: colors.error,
  },
} as const;

const Toast = ({ item, onDismiss }: Props) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(1)).current;

  const duration = item.duration ?? 3500;
  const cfg = CONFIG[item.type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(item.id));
  };

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.accentBar, { backgroundColor: cfg.barColor }]} />

      <cfg.Icon
        size={22}
        color={cfg.iconColor}
        style={styles.icon}
        strokeWidth={2}
      />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {item.message ? (
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={dismiss} hitSlop={8} style={styles.close}>
        <X size={16} color={colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: cfg.barColor,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    minHeight: 60,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  icon: {
    marginLeft: 12,
    marginRight: 10,
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 4,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  close: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    opacity: 0.5,
  },
});

export default Toast;
