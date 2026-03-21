export type NotificationCategory =
  | 'trip'
  | 'payment'
  | 'system'
  | 'alert'
  | 'promo';

export type Notification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** ISO timestamp */
  createdAt: string;
  isRead: boolean;
  /** Optional image URL — banner-style media notification */
  imageUrl?: string;
  /** Optional deep-link data (e.g. trip id to navigate to) */
  meta?: Record<string, string>;
};
