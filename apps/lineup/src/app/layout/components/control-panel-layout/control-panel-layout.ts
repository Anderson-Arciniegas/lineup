import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthStore, BusinessPrivateService } from '@lineup/core';
import { Nav, Sidebar } from '@lineup/ui';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Layout del panel de control del negocio: navegación principal, sidebar responsive
 * y cierre automático del menú tras cada navegación o tecla Escape.
 */
@Component({
  selector: 'app-control-panel-layout',
  imports: [CommonModule, RouterModule, Nav, Sidebar],
  templateUrl: './control-panel-layout.html',
  styleUrl: './control-panel-layout.scss',
})
export class ControlPanelLayout {
  private _business = inject(BusinessPrivateService);
  private _authStore = inject(AuthStore);
  private _auth = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  /** `true` = panel lateral abierto encima del contenido. Por defecto cerrado. */
  sidebarOpen = signal(false);

  // Acceder directamente a los signals
  business = this._authStore.business;

  /** Ítems del menú lateral derivados del negocio autenticado (rutas y acción de cerrar sesión). */
  items = computed(() => {
    const business = this.business();
    if (!business) return [];

    return [
      {
        label: 'general.dashboard',
        icon: 'pi pi-objects-column',
        url: '/dashboard',
      },
      {
        label: 'general.profile',
        icon: 'pi pi-shop',
        url: `/${business.path}`,
        navigationState: { lineupPublicBack: '/dashboard' },
      },
      {
        label: 'general.editBusiness',
        icon: 'pi pi-pencil',
        url: '/dashboard/edit',
      },
      {
        label: 'general.catalogs',
        icon: 'pi pi-book',
        url: '/dashboard/catalogs',
      },
      {
        label: 'general.discounts',
        icon: 'pi pi-percentage',
        url: '/dashboard/discounts',
      },
      {
        label: 'general.socialMedias',
        icon: 'pi pi-instagram',
        url: '/dashboard/social-medias',
      },
      {
        label: 'general.locations',
        icon: 'pi pi-map-marker',
        url: '/dashboard/locations',
      },
      {
        label: 'general.inventory',
        icon: 'pi pi-warehouse',
        url: '/dashboard/inventory',
      },
      {
        label: 'general.registerSale',
        icon: 'pi pi-shopping-cart',
        url: '/dashboard/register-sale',
      },

      {
        label: 'general.statistics',
        icon: 'pi pi-chart-bar',
        url: '/dashboard/statistics',
      },
      {
        label: 'general.businessHours',
        icon: 'pi pi-clock',
        url: '/dashboard/business-hours',
      },
      {
        label: 'general.settings',
        icon: 'pi pi-cog',
        url: '/dashboard/settings',
      },
      {
        label: 'general.signOut',
        icon: 'pi pi-sign-out',
        command: () => {
          this.signOut();
        },
      },
    ];
  });

  /**
   * Suscribe eventos de router para cerrar el sidebar en cada `NavigationEnd`
   * y evitar que el overlay quede abierto al cambiar de vista.
   */
  constructor() {
    this._router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this.closeSidebar());
  }

  /** Cierra sesión del negocio y redirige según la lógica de `AuthService`. */
  signOut() {
    this._auth.signOut();
  }

  /** Alterna la visibilidad del panel lateral en móvil / escritorio compacto. */
  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  /** Fuerza el cierre del sidebar (p. ej. tras navegar o Escape). */
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  /** Atajo de teclado: Escape cierra el menú lateral si está abierto. */
  @HostListener('document:keydown.escape')
  onDocumentEscape(): void {
    if (this.sidebarOpen()) {
      this.closeSidebar();
    }
  }
}
