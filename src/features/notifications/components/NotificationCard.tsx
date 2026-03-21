import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bus,
  Wallet,
  Bell,
  AlertTriangle,
  Tag,
} from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import type { Notification, NotificationCategory } from '../types';
import { formatRelativeTime } from '../../../utils/dateUtils';

type Props = {
  notification: Notification;
  onPress: (n: Notification) => void;
  onMarkRead: (id: string) => void;
};

type CategoryConfig = {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color: string;
  bg: string;
};

const CATEGORY_CONFIG: Record<NotificationCategory, CategoryConfig> = {
  trip:    { Icon: Bus,           color: colors.primary,  bg: colors.primaryTint },
  payment: { Icon: Wallet,        color: colors.success,  bg: colors.successTint },
  system:  { Icon: Bell,          color: colors.indigo,   bg: colors.indigoTint  },
  alert:   { Icon: AlertTriangle, color: colors.warning,  bg: colors.warningTint },
  promo:   { Icon: Tag,           color: colors.purple,   bg: colors.purpleTint  },
};


const NotificationCard = ({ notification, onPress, onMarkRead }: Props) => {
  const cfg = CATEGORY_CONFIG[notification.category];
  const { isRead, imageUrl } = notification;

  return (
    <TouchableOpacity
      style={[styles.card, !isRead && styles.cardUnread]}
      onPress={() => {
        onMarkRead(notification.id);
        onPress(notification);
      }}
      activeOpacity={0.75}
    >
      {/* Unread dot */}
      {!isRead && <View style={styles.unreadDot} />}

      {/* Top row — icon + text */}
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: cfg.bg }]}>
          <cfg.Icon size={18} color={cfg.color} strokeWidth={2} />
        </View>

        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !isRead && styles.titleBold]} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
          </View>
          <Text style={styles.body} numberOfLines={imageUrl ? 2 : 3}>
            {notification.body}
          </Text>
        </View>
      </View>

      {/* Optional banner image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cardUnread: {
    borderColor: colors.primaryTint,
    backgroundColor: colors.surfaceBlue,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  titleBold: {
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
});

export default NotificationCard;
