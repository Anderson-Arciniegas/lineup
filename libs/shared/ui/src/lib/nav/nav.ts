import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  AuthStore,
  BusinessNotificationsPrivateService,
  BusinessNotificationsPublicService,
  NotificationsSocketService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerModule } from 'primeng/drawer';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PopoverModule } from 'primeng/popover';
import { Button } from '../button/button';
import { Notifications } from '../notifications/notifications';
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
  visible = false;
  private platformId: object = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);
  private _authStore = inject(AuthStore);
  private _userNotificationsPublicService = inject(
    BusinessNotificationsPublicService,
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
        console.log('holaaa connect', profile, entityId);
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
