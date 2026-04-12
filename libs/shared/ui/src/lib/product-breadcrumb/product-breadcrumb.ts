import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  Injectable,
  Input,
  PLATFORM_ID,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterLink,
} from '@angular/router';
import { AuthStore, BusinessSchema, CatalogSchema } from '@lineup/core';
import { filter } from 'rxjs/operators';
import { Button } from '../button/button';

/** Segmentos de ruta sin query ni hash (p. ej. `/a/b/` → `['a','b']`). */
function pathSegments(url: string): string[] {
  const path = url.split('?')[0].split('#')[0];
  return path
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter((s) => s.length > 0);
}

/**
 * Indica si `from` es exactamente un segmento más profundo que `to` y comparte prefijo
 * (p. ej. `/negocio/cat` → `/negocio`).
 */
function isDirectParentRoute(fromUrl: string, toUrl: string): boolean {
  const from = pathSegments(fromUrl);
  const to = pathSegments(toUrl);
  if (to.length < 1 || from.length !== to.length + 1) {
    return false;
  }
  return to.every((seg, i) => from[i] === seg);
}

/** Comparación de rutas normalizada por segmentos. */
function isSamePath(a: string, b: string): boolean {
  const sa = pathSegments(a);
  const sb = pathSegments(b);
  if (sa.length !== sb.length) {
    return false;
  }
  return sa.every((s, i) => s === sb[i]);
}

/**
 * Evita que, tras volver del catálogo al negocio con history.back(), un nuevo back
 * devuelva al catálogo (bucle entre dos vistas).
 */
@Injectable({ providedIn: 'root' })
class ProductBreadcrumbNavTracker {
  private lastUrlAfterRedirects = '';

  private suppressHistoryBack = false;

  constructor() {
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);

    router.events
      .pipe(
        filter((e): e is NavigationStart => e instanceof NavigationStart),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((e) => {
        if (e.navigationTrigger === 'imperative') {
          this.suppressHistoryBack = false;
          return;
        }
        if (e.navigationTrigger !== 'popstate') {
          return;
        }
        const fromUrl = this.lastUrlAfterRedirects;
        const toUrl = e.url;
        if (isDirectParentRoute(fromUrl, toUrl)) {
          this.suppressHistoryBack = true;
        }
      });

    router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((e) => {
        this.lastUrlAfterRedirects = e.urlAfterRedirects;
      });
  }

  get suppressesHistoryBack(): boolean {
    return this.suppressHistoryBack;
  }
}

/**
 * Migas de navegación con botón atrás inteligente: respeta `history.back`, evita bucles
 * catálogo ↔ negocio con `ProductBreadcrumbNavTracker` y admite `path` explícito desde el padre.
 */
@Component({
  selector: 'lib-product-breadcrumb',
  imports: [CommonModule, Button, RouterLink],
  templateUrl: './product-breadcrumb.html',
  styleUrl: './product-breadcrumb.scss',
})
export class ProductBreadcrumb {
  @Input() business?: BusinessSchema | null;
  @Input() catalog?: CatalogSchema | null;
  @Input() path?: string | null;
  @Input() useLightText?: boolean;
  @Input() publicMode?: boolean;
  @Input() hiddenBusiness?: boolean;
  @Input() downloadMode?: boolean;
  private _authStore = inject(AuthStore);
  private location = inject(Location);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private navTracker = inject(ProductBreadcrumbNavTracker);

  logged = computed(
    () =>
      this._authStore.isUserLoggedIn() || this._authStore.isBusinessLoggedIn(),
  );

  businessMode = computed(() => this._authStore.isBusinessLoggedIn());

  /**
   * Elige entre `navigateByUrl` a un padre lógico o `Location.back` según modo público,
   * historial del navegador y señales del tracker de popstate.
   */
  goBack(): void {
    const hierarchyTarget = this.pickFirstFallbackDifferentFromCurrent();
    const hasExplicitBackPath = Boolean(this.path?.trim());

    // En público, solo forzamos URL por jerarquía si:
    // - el tracker detectó popstate "hijo → padre" (evita volver al catálogo/producto en bucle), o
    // - el padre pasó `path` (p. ej. state lineupPublicBack: '/' o '/dashboard').
    // Si no, usamos history.back() para respetar origen real (ej. dashboard → negocio).
    if (
      this.publicMode &&
      hierarchyTarget &&
      (this.navTracker.suppressesHistoryBack || hasExplicitBackPath)
    ) {
      void this.router.navigateByUrl(hierarchyTarget);
      return;
    }

    if (
      isPlatformBrowser(this.platformId) &&
      window.history.length > 1 &&
      !this.navTracker.suppressesHistoryBack
    ) {
      this.location.back();
      return;
    }

    if (hierarchyTarget) {
      void this.router.navigateByUrl(hierarchyTarget);
      return;
    }

    void this.router.navigateByUrl('/');
  }

  /**
   * Prioridad explícita: `path` → URL de catálogo → URL de negocio → `/` (solo modo público con negocio).
   * Se usa el primer destino que no sea la ruta actual.
   */
  private pickFirstFallbackDifferentFromCurrent(): string | null {
    const current = this.router.url;
    const candidates = [...this.getFallbackUrls()];
    if (this.publicMode && this.business?.path?.trim()) {
      candidates.push('/');
    }
    for (const candidate of candidates) {
      if (!isSamePath(candidate, current)) {
        return candidate;
      }
    }
    return null;
  }

  private getFallbackUrls(): string[] {
    const urls: string[] = [];

    const customPath = this.path?.trim();
    if (customPath) {
      urls.push(customPath.startsWith('/') ? customPath : `/${customPath}`);
    }

    const businessPath = this.business?.path?.trim();
    const catalogPath = this.catalog?.path?.trim();
    if (catalogPath && businessPath) {
      urls.push(`/${businessPath}/${catalogPath}`);
    }
    if (businessPath) {
      urls.push(`/${businessPath}`);
    }

    return urls;
  }
}
