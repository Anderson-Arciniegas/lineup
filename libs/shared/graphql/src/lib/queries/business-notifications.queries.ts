import { gql } from 'apollo-angular';

import { notificationSelection } from '../selections/notification.selection';

export const MY_BUSINESS_NOTIFICATIONS_QUERY = gql`
  query MyBusinessNotifications($pagination: InfinityScrollInput!) {
    myBusinessNotifications(pagination: $pagination) {
      items ${notificationSelection}
      limit
      page
      total
    }
  }
`;

export const UNREAD_BUSINESS_NOTIFICATIONS_COUNT_QUERY = gql`
  query UnreadBusinessNotificationsCount {
    unreadBusinessNotificationsCount
  }
`;
