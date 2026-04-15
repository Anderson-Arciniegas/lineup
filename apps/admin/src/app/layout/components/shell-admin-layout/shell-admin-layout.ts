import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Sidebar } from '@lineup/ui';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { ADMIN_ROUTE_SEGMENTS } from '../../../core/admin-routes';
import { AuthAdminService } from '../../../core/services/auth-admin.service';
import { TopNavAdmin } from '../top-nav-admin/top-nav-admin';

/**
 * Layout del admin: nav superior, sidebar responsive y cierre del menú tras navegar.
 */
@Component({
  selector: 'app-shell-admin-layout',
  imports: [CommonModule, RouterModule, TopNavAdmin, Sidebar],
  templateUrl: './shell-admin-layout.html',
  styleUrl: './shell-admin-layout.scss',
})
export class ShellAdminLayout {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authAdmin = inject(AuthAdminService);

  sidebarOpen = signal(false);

  readonly items = signal<MenuItem[]>(this.buildMenuItems());

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeSidebar());
  }

  private buildMenuItems(): MenuItem[] {
    const r = ADMIN_ROUTE_SEGMENTS;
    return [
      {
        label: 'admin.nav.dashboard',
        icon: 'pi pi-objects-column',
        url: `/${r.dashboard}`,
      },
      {
        label: 'admin.nav.stats',
        icon: 'pi pi-chart-bar',
        url: `/${r.stats}`,
      },
      {
        label: 'admin.nav.businesses',
        icon: 'pi pi-briefcase',
        url: `/${r.businesses}`,
      },
      {
        label: 'admin.nav.users',
        icon: 'pi pi-users',
        url: `/${r.users}`,
      },
      {
        label: 'admin.nav.roles',
        icon: 'pi pi-id-card',
        url: `/${r.roles}`,
      },
      {
        label: 'admin.nav.socialNetworks',
        icon: 'pi pi-share-alt',
        url: `/${r.socialNetworks}`,
      },
      {
        label: 'admin.nav.settings',
        icon: 'pi pi-cog',
        url: `/${r.settings}`,
      },
      {
        label: 'admin.nav.signOut',
        icon: 'pi pi-sign-out',
        command: () => this.signOut(),
      },
    ];
  }

  signOut(): void {
    this.authAdmin.signOut(true);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onDocumentEscape(): void {
    if (this.sidebarOpen()) {
      this.closeSidebar();
    }
  }
}
