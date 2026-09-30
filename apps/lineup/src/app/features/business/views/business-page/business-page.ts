import {
  CommonModule,
  isPlatformBrowser,
  isPlatformServer,
  Location,
} from '@angular/common';
import {
  Component,
  inject,
  makeStateKey,
  OnInit,
  PendingTasks,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessPublicService,
  BusinessSchema,
  CatalogPublicService,
  CatalogSchema,
  ProductPublicService,
  ProductSchema,
  SeoService,
  UserPublicService,
  UtilsService,
  VisitTypeEnum,
} from '@lineup/core';
import {
  BusinessData,
  Button,
  CatalogCard,
  CreateCatalogCard,
  ProductBreadcrumb,
  ProductCard,
  SearchBar,
} from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { forkJoin, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

/** Snapshot SSR → cliente para no volver a pedir negocio, productos y catálogos. */
interface BusinessPageSnapshot {
  business: BusinessSchema;
  products: ProductSchema[];
  catalogs: CatalogSchema[];
  page: number;
  productPage: number;
  noMoreResults: boolean;
  noMoreProductsResults: boolean;
}

const businessPageStateKey = (path: string, search: string) =>
  makeStateKey<BusinessPageSnapshot>(`business-page-${path}::${search}`);

/**
 * Vista pública de un negocio: datos de marca, catálogos y productos con scroll infinito,
 * búsqueda local vía query params, visitas registradas para analytics y tema visual
 * derivado del color corporativo (degradado y contraste de texto).
 */
@Component({
  selector: 'app-business-page',
  imports: [
    CommonModule,
    BusinessData,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CatalogCard,
    ProductBreadcrumb,
    CreateCatalogCard,
    InfiniteScrollDirective,
    ProgressSpinnerModule,
    TranslateModule,
    ProductCard,
    SearchBar,
    Button,
  ],

  templateUrl: './business-page.html',
  styleUrl: './business-page.scss',
})
export class BusinessPage implements OnInit {
  public readonly categories = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Camisas' },
    { id: 3, name: 'Pantalones' },
    { id: 4, name: 'Chaquetas' },
    { id: 5, name: 'Zapatos' },
    { id: 6, name: 'Accesorios' },
    { id: 7, name: 'Ropa Interior' },
  ];
  value: '';
  business: BusinessSchema;
  myBusiness = false;
  path: string;
  catalogs: CatalogSchema[] = [];
  products: ProductSchema[] = [];
  page = 1;
  productPage = 1;
  noMoreResults = false;
  noMoreProductsResults = false;
  productsAttempt = false;
  attempt = false;
  /**
   * Tras la primera carga de listados; evita que el infinite scroll dispare
   * otra petición (y el spinner) en el mismo ciclo en que aparece el contenido.
   */
  initialContentReady = false;
  /** Degradado vertical (arriba más intenso, abajo más suave; siempre más claro que el original). */
  pageBackgroundGradient = '';
  /** Según la zona superior del degradado: si es oscura, el texto de marca debe ser claro. */
  isDarkBackground = false;
  searchQuery = '';
  /** Destino explícito del atrás del breadcrumb (viene de `history.state`, p. ej. '/' o '/dashboard'). */
  breadcrumbBackPath: string | null = null;

  /** Mezcla con blanco en la parte superior del degradado (color principal, un poco más claro que el original). */
  private static readonly _GRADIENT_TOP_LIGHTEN = 0.25;
  /** Mezcla con blanco abajo (aún más claro que la parte superior). */
  private static readonly _GRADIENT_BOTTOM_LIGHTEN = 0.6;
  private static readonly _LUMINANCE_THRESHOLD = 0.45;

  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _pendingTasks = inject(PendingTasks);
  private readonly _transferState = inject(TransferState);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _authStore = inject(AuthStore);
  private readonly _utils = inject(UtilsService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _catalogService = inject(CatalogPublicService);
  private readonly _productService = inject(ProductPublicService);
  private readonly _seoService = inject(SeoService);
  private readonly _userService = inject(UserPublicService);
  private readonly _location = inject(Location);

  private readonly _subscription = new Subscription();

  /**
   * Lee `business` de la ruta, estado de navegación para el breadcrumb y `search` en query.
   * Dispara la carga del negocio y, según haya búsqueda o no, el flujo inicial o filtrado.
   */
  ngOnInit(): void {
    this.path = this.resolveBusinessPath();
    const st = this._location.getState() as { lineupPublicBack?: string };
    const back = st?.lineupPublicBack?.trim();
    this.breadcrumbBackPath = back
      ? back.startsWith('/')
        ? back
        : `/${back}`
      : null;

    this.searchQuery =
      this._activatedRoute.snapshot.queryParams?.['search'] ?? '';

    this.getBusiness();
  }

  /** Path del negocio desde la ruta actual o padres (`:business`). */
  private resolveBusinessPath(): string {
    let route: ActivatedRoute | null = this._activatedRoute;
    while (route) {
      const value = route.snapshot.params['business'];
      if (value) {
        return value;
      }
      route = route.parent;
    }
    return this._activatedRoute.snapshot.params['business'];
  }

  /**
   * Obtiene el negocio por path y sus listados iniciales.
   * TransferState evita refetch de negocio + productos + catálogos al hidratar.
   */
  private getBusiness(): void {
    const stateKey = businessPageStateKey(this.path, this.searchQuery);
    const transferred = this._transferState.get(stateKey, null);
    if (transferred) {
      this._transferState.remove(stateKey);
      this.restoreSnapshot(transferred);
      return;
    }

    const taskDone = this._pendingTasks.add();
    this._subscription.add(
      this._businessPublicService.findBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.bindBusiness(business);
          this.loadInitialLists(stateKey, taskDone);
        },
        error: (error) => {
          console.error(error);
          taskDone();
        },
      }),
    );
  }

  /** Restaura snapshot SSR sin volver a pedir listados. */
  private restoreSnapshot(snapshot: BusinessPageSnapshot): void {
    this.bindBusiness(snapshot.business);
    this.products = snapshot.products ?? [];
    this.catalogs = snapshot.catalogs ?? [];
    this.page = snapshot.page ?? 1;
    this.productPage = snapshot.productPage ?? 1;
    this.noMoreResults = snapshot.noMoreResults ?? false;
    this.noMoreProductsResults = snapshot.noMoreProductsResults ?? false;
    this.attempt = false;
    this.productsAttempt = false;
    this.initialContentReady = true;
    this.recordVisitIfNeeded();
  }

  /** Asigna negocio, dueño, color y SEO (sin disparar listados). */
  private bindBusiness(business: BusinessSchema): void {
    this.business = business;
    this.myBusiness =
      Number(this._authStore.business()?.id) === Number(this.business.id);
    if (this.business.hexColor) {
      this.setColor(this.business.hexColor);
    }
    this._seoService.setBusinessPage(this.business);
  }

  /** Visita solo en navegador para no duplicar entre SSR y cliente. */
  private recordVisitIfNeeded(): void {
    if (!isPlatformBrowser(this._platformId) || this.myBusiness) {
      return;
    }
    this.visitBusiness();
  }

  /** Registra visita al perfil del negocio (usuarios no dueños). */
  private visitBusiness(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.business.id,
          type: VisitTypeEnum.BUSINESS,
        })
        .subscribe(),
    );
  }

  /**
   * Primera carga de productos + catálogos; en SSR espera PendingTasks y
   * persiste snapshot para el cliente.
   */
  private loadInitialLists(
    stateKey: ReturnType<typeof businessPageStateKey>,
    taskDone: () => void,
  ): void {
    if (this.attempt) {
      taskDone();
      return;
    }

    this.attempt = true;
    this.productsAttempt = true;
    this.initialContentReady = false;
    this.products = [];
    this.catalogs = [];
    this.page = 1;
    this.productPage = 1;
    this.noMoreResults = false;
    this.noMoreProductsResults = false;

    const hasSearch = !!(this.searchQuery && this.searchQuery !== '');
    const catalogs$ = this._catalogService.findCatalogsByBusinessId(
      this.business.id,
      {
        page: this.page,
        limit: 20,
        ...(hasSearch ? { search: this.searchQuery } : {}),
      },
    );

    const products$ = hasSearch
      ? this._productService.getAllByBusiness(this.business.id, {
          page: this.productPage,
          limit: 20,
          search: this.searchQuery,
        })
      : this._productService.getAllPrimaryProductsByBusiness({
          idBusiness: this.business.id,
        });

    this._subscription.add(
      forkJoin({ products: products$, catalogsPage: catalogs$ })
        .pipe(
          finalize(() => {
            this.attempt = false;
            this.productsAttempt = false;
            this.initialContentReady = true;
            taskDone();
          }),
        )
        .subscribe({
          next: ({ products, catalogsPage }) => {
            if (Array.isArray(products)) {
              this.products = products;
            } else {
              this.products = products.items;
              this.productPage++;
              if (products.items.length === 0) {
                this.noMoreProductsResults = true;
              }
            }
            this.applyCatalogPage(catalogsPage);
            this.persistSnapshotIfServer(stateKey);
            this.recordVisitIfNeeded();
          },
          error: (error) => {
            console.error(error);
          },
        }),
    );
  }

  private persistSnapshotIfServer(
    stateKey: ReturnType<typeof businessPageStateKey>,
  ): void {
    if (!isPlatformServer(this._platformId)) {
      return;
    }
    this._transferState.set(stateKey, {
      business: this.business,
      products: this.products,
      catalogs: this.catalogs,
      page: this.page,
      productPage: this.productPage,
      noMoreResults: this.noMoreResults,
      noMoreProductsResults: this.noMoreProductsResults,
    });
  }

  /** Infinite scroll: si hay búsqueda activa pagina productos y catálogos; si no, solo catálogos. */
  onScroll(): void {
    if (!this.initialContentReady) return;
    if (this.searchQuery && this.searchQuery !== '') {
      this.getProducts();
      this.getCatalogs();
    } else {
      this.getCatalogs();
    }
  }

  /**
   * Actualiza la búsqueda en la URL del negocio o limpia si el término queda vacío
   * (en cuyo caso equivale a `onClearSearch`).
   */
  onSearchSubmit(query: string): void {
    if (query === '') {
      if (this.searchQuery && this.searchQuery !== '') {
        this.onClearSearch();
      }
      return;
    }
    this.searchQuery = query;
    this._utils.navigate([this.business.path], {
      queryParams: { search: this.searchQuery },
    });
    this.reloadListsAfterFilterChange();
  }

  /** Quita filtros de búsqueda y vuelve a la carga inicial paralela de productos y catálogos. */
  onClearSearch(): void {
    this.searchQuery = '';
    this._utils.navigate([this.business.path]);
    this.reloadListsAfterFilterChange();
  }

  /** Recarga listados tras cambiar búsqueda (sin refetch del negocio). */
  private reloadListsAfterFilterChange(): void {
    this.attempt = false;
    this.productsAttempt = false;
    this.loadInitialLists(
      businessPageStateKey(this.path, this.searchQuery),
      () => undefined,
    );
  }

  /** Paginación de productos cuando hay término de búsqueda en la página del negocio. */
  private getProducts(): void {
    if (this.productsAttempt || this.noMoreProductsResults) return;
    this.productsAttempt = true;
    this._subscription.add(
      this._productService
        .getAllByBusiness(this.business.id, {
          page: this.productPage,
          limit: 20,
          search: this.searchQuery,
        })
        .pipe(finalize(() => (this.productsAttempt = false)))
        .subscribe({
          next: (response) => {
            this.products = [...this.products, ...response.items];
            this.productPage++;
            if (response.items.length === 0) {
              this.noMoreProductsResults = true;
            }
          },
          error: (error) => {
            console.error(error);
          },
        }),
    );
  }

  /** Paginación de catálogos del negocio, opcionalmente filtrados por búsqueda. */
  private getCatalogs(): void {
    if (this.attempt || this.noMoreResults) return;
    this.attempt = true;
    this._subscription.add(
      this._catalogService
        .findCatalogsByBusinessId(this.business.id, {
          page: this.page,
          limit: 20,
          search: this.searchQuery,
        })
        .pipe(finalize(() => (this.attempt = false)))
        .subscribe({
          next: (response) => {
            this.applyCatalogPage(response);
          },
          error: (error) => {
            console.error(error);
          },
        }),
    );
  }

  /** Acumula ítems de catálogo y marca fin de lista cuando la página viene vacía. */
  private applyCatalogPage(response: { items: CatalogSchema[] }): void {
    this.page++;
    if (response.items.length === 0) {
      this.noMoreResults = true;
    } else {
      this.catalogs = [...this.catalogs, ...response.items];
    }
  }

  /**
   * Construye el degradado de página a partir de un color hex/RGB y fija si el texto
   * sobre la zona superior debe ir en tono claro según luminancia WCAG.
   */
  setColor(raw: string): void {
    const rgb = BusinessPage.parseColorToRgb(raw);
    if (!rgb) {
      return;
    }
    const top = BusinessPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      BusinessPage._GRADIENT_TOP_LIGHTEN,
    );
    const bottom = BusinessPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      BusinessPage._GRADIENT_BOTTOM_LIGHTEN,
    );
    this.pageBackgroundGradient = `linear-gradient(to bottom, rgba(${top.r}, ${top.g}, ${top.b}, 1), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, 1))`;
    const luminance = BusinessPage.relativeLuminance(top.r, top.g, top.b);
    this.isDarkBackground = luminance < BusinessPage._LUMINANCE_THRESHOLD;
  }

  private static clampByte(n: number): number {
    return Math.max(0, Math.min(255, Math.round(n)));
  }

  /** Interpreta `#rgb`, `#rrggbb` o `rgb()/rgba()` y devuelve componentes 0–255. */
  private static parseColorToRgb(
    input: string,
  ): { r: number; g: number; b: number } | null {
    const s = input?.trim();
    if (!s) {
      return null;
    }

    const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) {
        h = h
          .split('')
          .map((c) => c + c)
          .join('');
      }
      const n = parseInt(h, 16);
      return {
        r: (n >> 16) & 255,
        g: (n >> 8) & 255,
        b: n & 255,
      };
    }

    const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(s);
    if (rgb) {
      return {
        r: BusinessPage.clampByte(Number(rgb[1])),
        g: BusinessPage.clampByte(Number(rgb[2])),
        b: BusinessPage.clampByte(Number(rgb[3])),
      };
    }

    return null;
  }

  /** Mezcla el color con blanco para aclararlo (`amount` entre 0 y 1). */
  private static lightenRgb(
    r: number,
    g: number,
    b: number,
    amount: number,
  ): { r: number; g: number; b: number } {
    const t = Math.max(0, Math.min(1, amount));
    return {
      r: BusinessPage.clampByte(r + (255 - r) * t),
      g: BusinessPage.clampByte(g + (255 - g) * t),
      b: BusinessPage.clampByte(b + (255 - b) * t),
    };
  }

  /** Luminancia relativa sRGB usada para decidir contraste del texto sobre el degradado. */
  private static relativeLuminance(r: number, g: number, b: number): number {
    const linear = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }
}
