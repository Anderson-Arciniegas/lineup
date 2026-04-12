import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BusinessNotificationsPrivateService,
  NotificationsSocketService,
  UserNotificationsPublicService,
  type NotificationSchema,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from '../button/button';
import { NotificationItem } from '../notification-item/notification-item';

/**
 * Panel de lista de notificaciones: carga paginada, merge con eventos en vivo del socket,
 * marcar una o todas como leídas y notificar cambios de conteo al padre.
 */
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

  private readonly _destroyRef = inject(DestroyRef);
  private readonly _publicNotifications = inject(
    UserNotificationsPublicService,
  );
  private readonly _privateNotifications = inject(
    BusinessNotificationsPrivateService,
  );
  private readonly _notificationsSocket = inject(NotificationsSocketService);

  readonly items = signal<NotificationSchema[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly socketConnected = this._notificationsSocket.isConnected;
  markAllLoading = false;

  /** Suscripción al stream del socket para insertar o actualizar ítems sin recargar toda la lista. */
  constructor() {
    this._notificationsSocket.notification$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((incoming) => this.mergeRealtimeNotification(incoming));
  }

  /** Recarga la primera página desde la API y fusiona con entradas solo locales. */
  refresh(): void {
    this.loading.set(true);
    this.loadError.set(false);
    const pagination = { page: 1, limit: 25 };
    const request$ = this.businessMode
      ? this._privateNotifications.myBusinessNotifications(pagination)
      : this._publicNotifications.myNotifications(pagination);

    request$.subscribe({
      next: (data) => {
        this.items.set(this.mergeListWithExisting(data.items));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  /** Inserta o actualiza por `id` y avisa que el contador del nav puede haber cambiado. */
  private mergeRealtimeNotification(incoming: NotificationSchema): void {
    this.items.update((list) => {
      const idx = list.findIndex((n) => n.id === incoming.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], ...incoming };
        return next;
      }
      return [incoming, ...list];
    });
    this.countMayHaveChanged.emit();
  }

  /** Conserva entradas solo-en-cliente (p. ej. socket durante el fetch) al reconciliar con la API. */
  private mergeListWithExisting(
    fromApi: NotificationSchema[],
  ): NotificationSchema[] {
    const prev = this.items();
    const apiIds = new Set(fromApi.map((n) => n.id));
    const onlyLocal = prev.filter((n) => !apiIds.has(n.id));
    const combined = [...onlyLocal, ...fromApi];
    return combined.sort(
      (a, b) =>
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime(),
    );
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
