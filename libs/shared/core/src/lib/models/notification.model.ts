import type { NotificationSchema } from '../schemas/notification.schema';

export interface PaginatedNotifications {
  items: NotificationSchema[];
  limit: number;
  page: number;
  total: number;
}
