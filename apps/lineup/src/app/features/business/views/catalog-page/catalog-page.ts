import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PendingTasks,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  AuthStore,
  BusinessPublicService,
  BusinessSchema,
  CatalogPrivateService,
  CatalogPublicService,
  CatalogSchema,
  CurrencySymbolPipe,
  DiscountSchema,
  DiscountScopeEnum,
  DiscountTypeEnum,
  ProductPublicService,
  ProductSchema,
  SeoService,
  StatusEnum,
  UserPublicService,
  VisitTypeEnum,
} from '@lineup/core';
import {
  Button,
  CatalogCarousel,
  CreateProductCard,
  ProductBreadcrumb,
  ProductCard,
  ProductExpandedItem,
  SearchBar,
  ShareModal,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MessageService } from 'primeng/api';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * Vista pública de un catálogo: productos paginados, productos primarios en carrusel,
 * modo grid/lista, descarga PDF (nueva pestaña), compartir y edición de color para el dueño.
 */
@Component({
  selector: 'app-catalog-page',
  imports: [
    CommonModule,
    ProductBreadcrumb,
    ProductCard,
    Button,
    CatalogCarousel,
    CreateProductCard,
    ProgressSpinner,
    SearchBar,
    InfiniteScrollDirective,
    TranslateModule,
    SelectButtonModule,
    FormsModule,
    ProductExpandedItem,
    PopoverModule,
    ColorPickerModule,
    InputTextModule,
    CurrencySymbolPipe,
  ],
  templateUrl: 'catalog-page.html',
  styleUrls: ['./catalog-page.scss'],
})
export class CatalogPage implements OnInit {
  business: BusinessSchema;
  catalog: CatalogSchema;
  /** Degradado vertical (misma lógica que business-page). */
  pageBackgroundGradient = '';
  /** Texto claro sobre fondo oscuro en la franja superior del degradado. */
  isDarkBackground = false;

  private static readonly _GRADIENT_TOP_LIGHTEN = 0.25;
  private static readonly _GRADIENT_BOTTOM_LIGHTEN = 0.6;
  private static readonly _LUMINANCE_THRESHOLD = 0.45;

  path: string;
  catalogPath: string;
  products: ProductSchema[] = [];
  primaryProducts: ProductSchema[] = [];
  attempt = false;
  productsAttempt = false;
  primaryProductsAttempt = false;
  page = 1;
  noMoreResults = false;
  myBusiness = false;
  searchQuery = '';
  layoutMode: 'Grid' | 'List' = 'Grid';
  layoutOptions = [
    { index: 0, icon: 'pi pi-th-large', label: 'Grid', value: 'Grid' },
    { index: 1, icon: 'pi pi-list', label: 'List', value: 'List' },
  ];
  color = '#ffffff';
  attemptColor = false;
  ref: DynamicDialogRef | undefined;
  configUrl: string;
  discount: DiscountSchema;
  DiscountTypeEnum = DiscountTypeEnum;
  DiscountScopeEnum = DiscountScopeEnum;
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _catalogPublicService = inject(CatalogPublicService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _pendingTasks = inject(PendingTasks);
  private readonly _seoService = inject(SeoService);

  private readonly _authStore = inject(AuthStore);
  private readonly _userService = inject(UserPublicService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private _subscription: Subscription = new Subscription();

  /** Detecta el breakpoint Tailwind activo según el ancho del viewport. */
  private getTailwindBreakpoint(): 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' {
    const w = document.documentElement.clientWidth;
    if (w >= 1536) return 'xxl';
    if (w >= 1280) return 'xl';
    if (w >= 1024) return 'lg';
    if (w >= 768) return 'md';
    if (w >= 640) return 'sm';
    return 'xs';
  }

  /** Inicializa rutas `business` / `catalogPath` y dispara carga de negocio y catálogo. */
  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    this.getBusiness();
    this.getCatalog();
  }

  /** Carga el negocio por path y sincroniza colores, SEO y flags de propiedad. */
  private getBusiness(): void {
    const taskDone = this._pendingTasks.add();
    this._subscription.add(
      this._businessPublicService
        .findBusinessByPath(this.path)
        .pipe(finalize(() => taskDone()))
        .subscribe({
          next: (business) => {
            this.business = business;
            this.myBusiness =
              Number(this._authStore.business()?.id) ===
              Number(this.business.id);
            if (this.catalog) {
              if (this.catalog.hexColor) {
                this.setColor(this.catalog.hexColor);
              } else if (this.business.hexColor) {
                this.setColor(this.business.hexColor);
              }
              this.getPrimaryProducts();
              if (this.myBusiness) {
                this.configUrl = `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${this.catalogPath}`;
              }
            }
            this.applyCatalogSeoIfReady();
          },
        }),
    );
  }

  /** Contraste para bloques sobre el degradado (título, carrusel, búsqueda). */
  get brandToneLight(): boolean {
    return !!this.pageBackgroundGradient && this.isDarkBackground;
  }

  get brandToneDark(): boolean {
    return !!this.pageBackgroundGradient && !this.isDarkBackground;
  }

  /** Normaliza el valor del selector de layout a `Grid` o `List`. */
  onLayoutModeChange(value: unknown): void {
    if (value !== 'Grid' && value !== 'List') {
      this.layoutMode = 'Grid';
    }
  }

  /** Reinicia lista y paginación y vuelve a pedir productos con el término indicado. */
  onSearchSubmit(query: string): void {
    this.searchQuery = query;
    this.products = [];
    this.page = 1;
    this.noMoreResults = false;
    this.getProducts();
  }

  /** Resuelve el catálogo por path, SEO, visitas, descuentos activos y carga de productos. */
  private getCatalog(): void {
    if (this.attempt) return;
    this.attempt = true;
    const taskDone = this._pendingTasks.add();
    this._subscription.add(
      this._catalogPublicService
        .findOneCatalogByPath(this.catalogPath)
        .pipe(finalize(() => taskDone()))
        .subscribe({
          next: (catalog) => {
            this.catalog = catalog;
            this.attempt = false;
            this.getProducts();
            if (this.business) {
              this.getPrimaryProducts();
            }
            if (!this.myBusiness) {
              this.visitCatalog();
            } else {
              this.configUrl = `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${this.catalogPath}`;
            }

            if (this.catalog.hexColor) {
              this.setColor(this.catalog.hexColor);
            } else if (this.business && this.business.hexColor) {
              this.setColor(this.business.hexColor);
            }
            this.applyCatalogSeoIfReady();

            this.discount = this.catalog.discounts.find(
              (discount) =>
                discount.scope === DiscountScopeEnum.CATALOG &&
                discount.status === StatusEnum.ACTIVE,
            );
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
          complete: () => {
            this.attempt = false;
          },
        }),
    );
  }

  private applyCatalogSeoIfReady(): void {
    if (this.business && this.catalog) {
      this._seoService.setCatalogPage(this.business, this.catalog);
    }
  }

  /** Registra visita al catálogo para usuarios que no son el negocio autenticado. */
  private visitCatalog(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.catalog.id,
          type: VisitTypeEnum.CATALOG,
        })
        .subscribe(),
    );
  }

  /** Paginación de productos del catálogo (solo en navegador, con flags de carga y fin de lista). */
  getProducts(): void {
    if (!isPlatformBrowser(this._platformId)) return;
    if (this.productsAttempt || this.noMoreResults) return;
    this.productsAttempt = true;
    this._subscription.add(
      this._productPublicService
        .getAllByCatalogPaginated(this.catalog.id, {
          page: this.page,
          limit: 20,
          search: this.searchQuery,
        })
        .subscribe({
          next: (products) => {
            this.productsAttempt = false;
            this.products = [...this.products, ...products.items];
            this.page++;
            if (products.items.length === 0) {
              this.noMoreResults = true;
            }
          },
          error: (error) => {
            console.error(error);
            this.productsAttempt = false;
          },
          complete: () => {
            this.productsAttempt = false;
          },
        }),
    );
  }

  /** Productos marcados como primarios dentro de este catálogo para el carrusel superior. */
  private getPrimaryProducts(): void {
    if (this.primaryProductsAttempt || this.noMoreResults) return;
    this.primaryProductsAttempt = true;
    this._subscription.add(
      this._productPublicService
        .getAllPrimaryProductsByBusiness({
          idBusiness: this.business.id,
          idCatalog: this.catalog.id,
        })
        .subscribe({
          next: (products) => {
            this.primaryProductsAttempt = false;
            this.primaryProducts = products;
          },
          error: (error) => {
            console.error(error);
            this.primaryProductsAttempt = false;
          },
        }),
    );
  }

  setColor(raw: string): void {
    this.color = raw;
    const rgb = CatalogPage.parseColorToRgb(raw);
    if (!rgb) {
      return;
    }
    const top = CatalogPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      CatalogPage._GRADIENT_TOP_LIGHTEN,
    );
    const bottom = CatalogPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      CatalogPage._GRADIENT_BOTTOM_LIGHTEN,
    );
    this.pageBackgroundGradient = `linear-gradient(to bottom, rgba(${top.r}, ${top.g}, ${top.b}, 1), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, 1))`;
    const luminance = CatalogPage.relativeLuminance(top.r, top.g, top.b);
    this.isDarkBackground = luminance < CatalogPage._LUMINANCE_THRESHOLD;
  }

  private static clampByte(n: number): number {
    return Math.max(0, Math.min(255, Math.round(n)));
  }

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
        r: CatalogPage.clampByte(Number(rgb[1])),
        g: CatalogPage.clampByte(Number(rgb[2])),
        b: CatalogPage.clampByte(Number(rgb[3])),
      };
    }

    return null;
  }

  private static lightenRgb(
    r: number,
    g: number,
    b: number,
    amount: number,
  ): { r: number; g: number; b: number } {
    const t = Math.max(0, Math.min(1, amount));
    return {
      r: CatalogPage.clampByte(r + (255 - r) * t),
      g: CatalogPage.clampByte(g + (255 - g) * t),
      b: CatalogPage.clampByte(b + (255 - b) * t),
    };
  }

  private static relativeLuminance(r: number, g: number, b: number): number {
    const linear = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  /** Infinite scroll: solicita la siguiente página de productos. */
  onScroll(): void {
    this.getProducts();
  }

  /** Abre la ruta `/download` en nueva pestaña respetando el layout elegido (grid/list). */
  downloadCatalog(): void {
    const base = window.location.href.replace(/\/$/, '');
    window.open(`${base}/download?layout=${this.layoutMode}`, '_blank');
  }

  /** Diálogo modal con URL actual para compartir el catálogo. */
  share() {
    this.ref = this._dialogService.open(ShareModal, {
      header: this._translate.instant('general.share'),
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        url: location.href,
      },
      modal: true,
      closable: true,
    });
  }

  /** Persiste el color hex del catálogo vía API privada y notifica con toast. */
  saveColor(): void {
    this.attemptColor = true;
    this._subscription.add(
      this._catalogService
        .updateCatalog({
          idCatalog: this.catalog.id,
          hexColor: this.color,
          title: this.catalog.title,
        })
        .subscribe({
          next: () => {
            this.attemptColor = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('toast.catalogUpdated'),
            });
          },
          error: (error) => {
            console.error(error);
            this.attemptColor = false;
          },
          complete: () => {
            this.attemptColor = false;
          },
        }),
    );
  }
}
