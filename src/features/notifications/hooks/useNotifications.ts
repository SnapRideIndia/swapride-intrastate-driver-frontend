import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  fetchNotificationStats
} from '../notificationService';

export const NOTIFICATIONS_KEY = ['notifications'];

export const useNotifications = (params: { offset?: number; limit?: number; status?: string } = {}) => {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, params],
    queryFn: () => fetchNotifications(params),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'stats'],
    queryFn: fetchNotificationStats,
    refetchInterval: 30000,
  });
};
