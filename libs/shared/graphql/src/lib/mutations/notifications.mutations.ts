import { gql } from 'apollo-angular';

import { notificationSelection } from '../selections/notification.selection';

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: Int!) {
    markNotificationRead(id: $id) ${notificationSelection}
  }
`;
