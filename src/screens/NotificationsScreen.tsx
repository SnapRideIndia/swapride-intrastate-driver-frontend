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
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead 
} from '../features/notifications/hooks/useNotifications';
import Loader from '../components/ui/Loader';

type FilterTab = 'All' | 'Unread';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const { data, isLoading } = useNotifications({
    status: activeTab === 'Unread' ? 'unread' : 'all',
    limit: 50,
  });

  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  const displayed = notifications;

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
          <TouchableOpacity onPress={() => markAllRead()} hitSlop={8} style={styles.markAllBtn}>
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

      {isLoading ? (
        <Loader message="Loading messages…" />
      ) : (
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
              onMarkRead={() => markRead(item.id)}
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
