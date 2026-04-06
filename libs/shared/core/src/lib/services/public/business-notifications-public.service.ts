import { inject, Injectable } from '@angular/core';

import {
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  MARK_NOTIFICATION_READ_MUTATION,
  MY_NOTIFICATIONS_QUERY,
  UNREAD_NOTIFICATIONS_COUNT_QUERY,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { InfinityScrollInput } from '../../models/catalog.model';
import type { PaginatedNotifications } from '../../models/notification.model';
import type { NotificationSchema } from '../../schemas';
import { ApiClient } from '../graphql.service';

@Injectable({
  providedIn: 'root',
})
export class BusinessNotificationsPublicService {
  private apollo = inject(Apollo);

  myNotifications(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedNotifications> {
    return this.apollo
      .use(ApiClient.USER)
      .query<{ myNotifications: PaginatedNotifications }>({
        query: MY_NOTIFICATIONS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.myNotifications));
  }

  unreadNotificationsCount(): Observable<number> {
    return this.apollo
      .use(ApiClient.USER)
      .query<{ unreadNotificationsCount: number }>({
        query: UNREAD_NOTIFICATIONS_COUNT_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.unreadNotificationsCount));
  }

  markAllNotificationsRead(): Observable<boolean> {
    return this.apollo
      .use(ApiClient.USER)
      .mutate<{ markAllNotificationsRead: boolean }>({
        mutation: MARK_ALL_NOTIFICATIONS_READ_MUTATION,
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.markAllNotificationsRead;
        }),
      );
  }

  markNotificationRead(id: number): Observable<NotificationSchema> {
    return this.apollo
      .use(ApiClient.USER)
      .mutate<{ markNotificationRead: NotificationSchema }>({
        mutation: MARK_NOTIFICATION_READ_MUTATION,
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
          return result.data.markNotificationRead;
        }),
      );
  }
}
