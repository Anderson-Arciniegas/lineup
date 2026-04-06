import { inject, Injectable } from '@angular/core';

import {
  MARK_ALL_BUSINESS_NOTIFICATIONS_READ_MUTATION,
  MARK_BUSINESS_NOTIFICATION_READ_MUTATION,
  MY_BUSINESS_NOTIFICATIONS_QUERY,
  UNREAD_BUSINESS_NOTIFICATIONS_COUNT_QUERY,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { InfinityScrollInput } from '../../models/catalog.model';
import type { PaginatedNotifications } from '../../models/notification.model';
import type { NotificationSchema } from '../../schemas';
import { ApiClient } from '.';

@Injectable({
  providedIn: 'root',
})
export class BusinessNotificationsPrivateService {
  private apollo = inject(Apollo);

  myBusinessNotifications(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedNotifications> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ myBusinessNotifications: PaginatedNotifications }>({
        query: MY_BUSINESS_NOTIFICATIONS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.myBusinessNotifications));
  }

  unreadBusinessNotificationsCount(): Observable<number> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ unreadBusinessNotificationsCount: number }>({
        query: UNREAD_BUSINESS_NOTIFICATIONS_COUNT_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.unreadBusinessNotificationsCount));
  }

  markAllBusinessNotificationsRead(): Observable<boolean> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ markAllBusinessNotificationsRead: boolean }>({
        mutation: MARK_ALL_BUSINESS_NOTIFICATIONS_READ_MUTATION,
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.markAllBusinessNotificationsRead;
        }),
      );
  }

  markBusinessNotificationRead(id: number): Observable<NotificationSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ markBusinessNotificationRead: NotificationSchema }>({
        mutation: MARK_BUSINESS_NOTIFICATION_READ_MUTATION,
        variables: { id: Math.trunc(id) },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.markBusinessNotificationRead;
        }),
      );
  }
}
