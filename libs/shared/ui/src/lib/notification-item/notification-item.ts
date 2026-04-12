import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AppConfigService,
  appRoutes,
  NotificationTypeEnum,
  type NotificationSchema,
} from '@lineup/core';

const NOTIFICATION_TYPE_VISUAL: Record<
  NotificationTypeEnum,
  { icon: string; badgeClass: string }
> = {
  [NotificationTypeEnum.INFO]: {
    icon: 'pi pi-info-circle',
    badgeClass: 'notification-item__badge--info',
  },
  [NotificationTypeEnum.SUCCESS]: {
    icon: 'pi pi-check-circle',
    badgeClass: 'notification-item__badge--success',
  },
  [NotificationTypeEnum.WARNING]: {
    icon: 'pi pi-exclamation-triangle',
    badgeClass: 'notification-item__badge--warning',
  },
  [NotificationTypeEnum.ERROR]: {
    icon: 'pi pi-times-circle',
    badgeClass: 'notification-item__badge--error',
  },
  [NotificationTypeEnum.SYSTEM]: {
    icon: 'pi pi-cog',
    badgeClass: 'notification-item__badge--system',
  },
};

/**
 * Representa una notificación individual: icono según tipo, marca como leída al activarla.
 */
@Component({
  selector: 'lib-notification-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.scss',
})
export class NotificationItem {
  @Input({ required: true }) notification!: NotificationSchema;
  @Output() markRead = new EventEmitter<number>();

  private readonly _routes = AppConfigService.config.routes ?? appRoutes;

  /** Devuelve icono PrimeIcons y clase CSS del badge según `notification.type`. */
  protected typeVisual(): { icon: string; badgeClass: string } {
    const v = NOTIFICATION_TYPE_VISUAL[this.notification.type];
    return v ?? NOTIFICATION_TYPE_VISUAL[NotificationTypeEnum.INFO];
  }

  /**
   * Ruta al panel del producto: `/dashboard/catalogs/:catalogPath/:id`.
   */
  protected productPanelRouterCommands(): (string | number)[] | null {
    const p = this.notification.payload;
    if (
      !p ||
      p.entity?.toLowerCase() !== 'products' ||
      !p.catalogPath ||
      p.id == null
    ) {
      return null;
    }
    return [
      '/',
      this._routes.dashboard,
      this._routes.catalogs,
      p.catalogPath,
      p.id,
    ];
  }

  /** Enlace absoluto (http/https) en `payload.link`. */
  protected externalPayloadHref(): string | null {
    const link = this.notification.payload?.link?.trim();
    if (!link || !/^https?:\/\//i.test(link)) {
      return null;
    }
    return link;
  }

  /** Ruta interna en `payload.link` (sin recarga completa vía RouterLink). */
  protected internalPayloadRouterLink(): string | null {
    const link = this.notification.payload?.link?.trim();
    if (!link || /^https?:\/\//i.test(link)) {
      return null;
    }
    return link.startsWith('/') ? link : `/${link}`;
  }

  /** Emite `markRead` si la notificación aún no tenía `readAt`. */
  protected onActivate(): void {
    if (!this.notification.readAt) {
      this.markRead.emit(this.notification.id);
    }
  }
}
