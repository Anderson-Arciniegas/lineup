import { gql } from 'apollo-angular';

import { notificationSelection } from '../selections/notification.selection';

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($pagination: InfinityScrollInput!) {
    myNotifications(pagination: $pagination) {
      items ${notificationSelection}
      limit
      page
      total
    }
  }
`;

export const UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`;
