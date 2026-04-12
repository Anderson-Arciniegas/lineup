import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Nav, Sidebar } from '@lineup/ui';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Layout para el área de usuario final: menú lateral con accesos a perfil,
 * listas y ajustes; cierra el sidebar al navegar o al pulsar Escape.
 */
@Component({
  selector: 'app-user-layout',
  imports: [CommonModule, RouterModule, Nav, Sidebar],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss',
})
export class UserLayout implements OnInit {
  items: MenuItem[];

  /** `true` = panel lateral abierto encima del contenido. Por defecto cerrado. */
  sidebarOpen = signal(false);

  private _auth = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  /**
   * Cierra el sidebar en cada fin de navegación para no dejar el overlay activo.
   */
  constructor() {
    this._router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this.closeSidebar());
  }

  /** Construye la estructura estática del menú (enlaces PrimeNG `MenuItem`). */
  ngOnInit(): void {
    this.items = [
      {
        label: 'general.dashboard',
        icon: 'pi pi-objects-column',
        url: '/profile',
      },
      {
        label: 'general.profile',
        icon: 'pi pi-user',
        url: '/profile/edit',
      },
      {
        label: 'general.wishlist',
        icon: 'pi pi-heart',
        url: '/profile/wishlist',
      },
      {
        label: 'general.favorites',
        icon: 'pi pi-shop',
        url: '/profile/favorites',
      },
      {
        label: 'general.ratings',
        icon: 'pi pi-star',
        url: '/profile/my-ratings',
      },
      {
        label: 'general.settings',
        icon: 'pi pi-cog',
        url: '/profile/settings',
      },
      {
        label: 'general.signOut',
        icon: 'pi pi-sign-out',
        url: '/profile/sign-out',
        command: () => {
          this.signOut();
        },
      },
    ];
  }

  /** Cierra la sesión del consumidor y delega en `AuthService`. */
  signOut() {
    this._auth.signOut();
  }

  /** Alterna el panel lateral en vistas estrechas. */
  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  /** Oculta el sidebar de forma explícita. */
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  /** Escape cierra el menú lateral si está visible. */
  @HostListener('document:keydown.escape')
  onDocumentEscape(): void {
    if (this.sidebarOpen()) {
      this.closeSidebar();
    }
  }
}
