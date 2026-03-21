import React, { useState, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, BellOff, CheckCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import NotificationCard from '../features/notifications/components/NotificationCard';
import type { Notification } from '../features/notifications/types';

const MOCK: Notification[] = [
  {
    id: 'n1',
    category: 'trip',
    title: 'Trip Assigned',
    body: 'You have been assigned a new trip: Chennai CMBT → Bangalore Majestic. Departure at 08:30 AM.',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    isRead: false,
  },
  {
    id: 'n2',
    category: 'payment',
    title: 'Earnings Credited',
    body: '₹1,240 has been credited to your wallet for trip T-0091 completed yesterday.',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    isRead: false,
  },
  {
    id: 'n3',
    category: 'alert',
    title: 'Route Delay Alert',
    body: 'Heavy traffic reported on NH-44 near Krishnagiri. Expect 45-minute delay. Plan accordingly.',
    createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    isRead: false,
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
  },
  {
    id: 'n4',
    category: 'promo',
    title: 'Driver of the Month 🏆',
    body: "Congratulations! You've been selected as Driver of the Month for February. Claim your reward now.",
    createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80',
  },
  {
    id: 'n5',
    category: 'system',
    title: 'App Updated',
    body: 'SwapRide Driver v1.1.0 is now live. New features: improved location accuracy and faster boarding scan.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
    isRead: true,
  },
  {
    id: 'n6',
    category: 'trip',
    title: 'Passenger Complaint',
    body: 'A passenger has submitted feedback for trip T-0088. Please review when available.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
    isRead: true,
  },
];

type FilterTab = 'All' | 'Unread';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications],
  );

  const displayed = useMemo(
    () => (activeTab === 'Unread' ? notifications.filter(n => !n.isRead) : notifications),
    [notifications, activeTab],
  );

  const markRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} hitSlop={8} style={styles.markAllBtn}>
            <CheckCheck size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.markAllText}>All read</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      <View style={styles.tabRow}>
        {(['All', 'Unread'] as FilterTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab}
              {tab === 'Unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          displayed.length === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => {}}
            onMarkRead={markRead}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBadge}>
              <BellOff size={32} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyBody}>No notifications here yet</Text>
          </View>
        }
      />
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
  markAllBtn: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.surface,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 10,
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 48,
  },
  emptyIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.slateTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default NotificationsScreen;
