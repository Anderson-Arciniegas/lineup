import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  Input,
  Output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  AuthStore,
  BusinessNotificationsPrivateService,
  NotificationsSocketService,
  UserNotificationsPublicService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerModule } from 'primeng/drawer';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PopoverModule } from 'primeng/popover';
import { Button } from '../button/button';
import { Notifications } from '../notifications/notifications';

/**
 * Barra superior: marca, enlaces, drawer de notificaciones y contador en tiempo real vía WebSocket.
 * Conecta al servicio de notificaciones según perfil usuario/negocio y expone toggle del sidebar.
 */
@Component({
  selector: 'lib-nav',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    RouterLink,
    DrawerModule,
    TranslateModule,
    InputIcon,
    IconField,
    OverlayBadgeModule,
    PopoverModule,
    Notifications,
  ],
  templateUrl: './nav.html',
  styleUrls: ['./nav.scss'],
})
export class Nav {
  @Input() navItems: any[];
  /** Muestra el botón hamburguesa para abrir/cerrar el sidebar en overlay (layouts con sidebar). */
  @Input() showSidebarToggle = false;
  /** `true` cuando el panel lateral está abierto (visible encima del contenido). */
  @Input() sidebarOpen = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  visible = false;
  private platformId: object = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);
  private _authStore = inject(AuthStore);
  private _userNotificationsPublicService = inject(
    UserNotificationsPublicService,
  );
  private _businessNotificationsPrivateService = inject(
    BusinessNotificationsPrivateService,
  );
  private readonly _notificationsSocket = inject(NotificationsSocketService);

  /** Contador de no leídas: usuario (API user) o negocio (API business), según sesión. */
  pendingNotificationsCount = signal(0);

  logged = computed(
    () =>
      this._authStore.isUserLoggedIn() || this._authStore.isBusinessLoggedIn(),
  );

  businessMode = computed(() => this._authStore.isBusinessLoggedIn());

  /**
   * Escucha push de socket para refrescar el badge; usa `effect` para conectar/desconectar
   * y pedir el conteo inicial cuando cambia la sesión.
   */
  constructor() {
    this._notificationsSocket.notification$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        if (!this.logged()) {
          return;
        }
        this.refreshPendingNotificationsCount();
      });

    effect((onCleanup) => {
      if (!this.logged()) {
        this.pendingNotificationsCount.set(0);
        this._notificationsSocket.disconnect();
        return;
      }
      const profile = this.businessMode() ? 'business' : 'user';
      const user = this._authStore.user();
      const business = this._authStore.business();
      const entityId = profile === 'business' ? business?.id : user?.id;
      if (entityId != null) {
        this._notificationsSocket.connect(profile, entityId);
      }

      const request$ = this.businessMode()
        ? this._businessNotificationsPrivateService.unreadBusinessNotificationsCount()
        : this._userNotificationsPublicService.unreadNotificationsCount();

      const sub = request$.subscribe({
        next: (count) => this.pendingNotificationsCount.set(count),
        error: () => this.pendingNotificationsCount.set(0),
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  /** Notifica al layout padre para abrir/cerrar el menú lateral. */
  emitSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  /** Vuelve a consultar el conteo de no leídas en API (usuario o negocio). */
  refreshPendingNotificationsCount(): void {
    if (!this.logged()) {
      return;
    }
    const request$ = this.businessMode()
      ? this._businessNotificationsPrivateService.unreadBusinessNotificationsCount()
      : this._userNotificationsPublicService.unreadNotificationsCount();
    request$.subscribe({
      next: (count) => this.pendingNotificationsCount.set(count),
      error: () => this.pendingNotificationsCount.set(0),
    });
  }
}
