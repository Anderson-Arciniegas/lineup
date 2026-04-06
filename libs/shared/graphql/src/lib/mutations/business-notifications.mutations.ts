import { gql } from 'apollo-angular';

import { notificationSelection } from '../selections/notification.selection';

export const MARK_ALL_BUSINESS_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllBusinessNotificationsRead {
    markAllBusinessNotificationsRead
  }
`;

export const MARK_BUSINESS_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkBusinessNotificationRead($id: Int!) {
    markBusinessNotificationRead(id: $id) ${notificationSelection}
  }
`;
