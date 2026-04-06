import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import {
  BusinessNotificationsPrivateService,
  BusinessNotificationsPublicService,
  type NotificationSchema,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from '../button/button';
import { NotificationItem } from '../notification-item/notification-item';

@Component({
  selector: 'lib-notifications',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    Button,
    NotificationItem,
    ProgressSpinner,
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  @Input({ required: true }) businessMode!: boolean;
  @Output() countMayHaveChanged = new EventEmitter<void>();

  private readonly _publicNotifications = inject(
    BusinessNotificationsPublicService,
  );
  private readonly _privateNotifications = inject(
    BusinessNotificationsPrivateService,
  );

  readonly items = signal<NotificationSchema[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal(false);
  markAllLoading = false;

  refresh(): void {
    this.loading.set(true);
    this.loadError.set(false);
    const pagination = { page: 1, limit: 25 };
    const request$ = this.businessMode
      ? this._privateNotifications.myBusinessNotifications(pagination)
      : this._publicNotifications.myNotifications(pagination);

    request$.subscribe({
      next: (data) => {
        this.items.set(data.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  protected hasUnread(): boolean {
    return this.items().some((n) => !n.readAt);
  }

  protected markAllRead(): void {
    this.markAllLoading = true;
    const obs = this.businessMode
      ? this._privateNotifications.markAllBusinessNotificationsRead()
      : this._publicNotifications.markAllNotificationsRead();
    obs.subscribe({
      next: () => {
        this.markAllLoading = false;
        this.refresh();
        this.countMayHaveChanged.emit();
      },
      error: () => {
        this.markAllLoading = false;
      },
    });
  }

  protected onMarkRead(id: number): void {
    const obs = this.businessMode
      ? this._privateNotifications.markBusinessNotificationRead(id)
      : this._publicNotifications.markNotificationRead(id);
    obs.subscribe({
      next: (updated) => {
        this.items.update((list) =>
          list.map((n) => (n.id === id ? { ...n, ...updated } : n)),
        );
        this.countMayHaveChanged.emit();
      },
    });
  }
}
