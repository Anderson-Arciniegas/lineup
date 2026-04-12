import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { environment } from '@lineup/envs';
import { Subject } from 'rxjs';
import { io, type Socket } from 'socket.io-client';

import {
  NOTIFICATION_SOCKET_EVENT,
  NOTIFICATION_SOCKET_JOIN_EVENT,
  NOTIFICATION_SOCKET_NAMESPACE,
} from '../constants/notifications-socket.constants';
import type { NotificationSchema } from '../schemas';

export type NotificationsSessionProfile = 'user' | 'business';

@Injectable({
  providedIn: 'root',
})
export class NotificationsSocketService {
  private readonly platformId = inject(PLATFORM_ID);

  private socket: Socket | null = null;

  private readonly notificationSubject = new Subject<NotificationSchema>();
  readonly notification$ = this.notificationSubject.asObservable();

  private readonly _status = signal<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');

  private readonly _lastNotification = signal<NotificationSchema | null>(null);

  readonly connectionStatus = this._status.asReadonly();
  readonly lastNotification = this._lastNotification.asReadonly();
  readonly isConnected = computed(() => this._status() === 'connected');

  /**
   * Conecta al namespace con cookies (`withCredentials`).
   * Tras `connect`, emite `notifications` con `{ type, id }` para unirse a la room.
   */
  connect(profile: NotificationsSessionProfile, entityId: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!Number.isFinite(entityId) || entityId <= 0) {
      console.warn('[NotificationsSocket] id inválido; no se conecta.');
      return;
    }

    this.disconnect();

    const base = this.socketBaseUrl();
    const url = `${base}${NOTIFICATION_SOCKET_NAMESPACE}`;
    this._status.set('connecting');

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      this._status.set('connected');
      const joinPayload =
        profile === 'user'
          ? { type: 'user' as const, id: entityId }
          : { type: 'business' as const, id: entityId };
      this.socket?.emit(NOTIFICATION_SOCKET_JOIN_EVENT, joinPayload);
    });

    this.socket.on('connect_error', () => {
      this._status.set('error');
    });

    this.socket.on('disconnect', () => {
      if (this.socket) {
        this._status.set('disconnected');
      }
    });

    this.socket.on(NOTIFICATION_SOCKET_EVENT, (payload: NotificationSchema) => {
      this._lastNotification.set(payload);
      this.notificationSubject.next(payload);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._status.set('disconnected');
  }

  clearLastNotification(): void {
    this._lastNotification.set(null);
  }

  private socketBaseUrl(): string {
    return environment.notificationsSocketUrl.replace(/\/$/, '');
  }
}
