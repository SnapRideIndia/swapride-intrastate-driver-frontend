export type NotificationCategory =
  | 'trip'
  | 'payment'
  | 'system'
  | 'alert'
  | 'promo'
  | string; // Handle unexpected types from backend

export type Notification = {
  id: string;
  type: NotificationCategory;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
  imageUrl?: string;
  metadata?: any;
};
