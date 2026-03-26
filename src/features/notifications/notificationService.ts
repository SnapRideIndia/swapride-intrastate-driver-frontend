import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { Notification } from './types';

export type NotificationListResponse = {
  data: Notification[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
};

export const fetchNotifications = async (params: {
  offset?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await apiClient.get<NotificationListResponse>(
    ENDPOINTS.NOTIFICATIONS.LIST,
    { params }
  );
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  return response.data;
};

export const fetchNotificationStats = async () => {
  const response = await apiClient.get<{ unreadCount: number }>(
    `${ENDPOINTS.NOTIFICATIONS.LIST}/stats`
  );
  return response.data;
};
