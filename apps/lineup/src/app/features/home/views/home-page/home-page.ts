import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

import {
  afterNextRender,
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BusinessCard,
  Button,
  CatalogCard,
  ProductCard,
  SearchBar,
} from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
import { FormsModule } from '@angular/forms';
import {
  AppConfigService,
  BusinessSchema,
  CatalogSchema,
  getFileThumbnailUrl,
  ProductCollectionSchema,
  ProductPublicService,
  ProductSchema,
  TagSchema,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import { ButtonModule } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/** Misma forma que PrimeNG; no se pasa al carousel (evita `.sort()` in-place compartido entre instancias). */
interface CarouselBreakpointConfig {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
}

// gsap.registerPlugin(ScrollTrigger);

/**
 * Página de inicio pública: carruseles de negocios, catálogos, productos y colecciones,
 * con lógica responsive para PrimeNG Carousel (evita mutación compartida de `responsiveOptions`)
 * y optimizaciones LCP (preload de miniatura del producto principal).
 */
@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    Button,
    BusinessCard,
    ProductCard,
    CatalogCard,
    Carousel,
    ButtonModule,
    TranslateModule,
    FormsModule,
    SearchBar,
    ProgressSpinner,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  /**
   * PrimeNG muta `responsiveOptions` con `.sort()` al inyectar estilos; varios `p-carousel` con la misma
   * referencia se pisan entre sí. Aquí solo usamos copias para calcular `numVisible`.
   */
  private readonly carouselBreakpointsStandard: CarouselBreakpointConfig[] = [
    { breakpoint: '1920px', numVisible: 5, numScroll: 1 },
    { breakpoint: '1536px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 2, numScroll: 1 },
    { breakpoint: '500px', numVisible: 1, numScroll: 1 },
  ];

  private readonly carouselBreakpointsCollections: CarouselBreakpointConfig[] =
    [
      { breakpoint: '1920px', numVisible: 5, numScroll: 1 },
      { breakpoint: '1536px', numVisible: 4, numScroll: 1 },
      { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
      { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
      { breakpoint: '768px', numVisible: 2, numScroll: 1 },
      { breakpoint: '640px', numVisible: 2, numScroll: 1 },
      { breakpoint: '550px', numVisible: 1, numScroll: 1 },
    ];

  private readonly windowInnerWidth = signal(0);

  readonly carouselNumVisibleStandard = computed(() =>
    this.resolveNumVisibleForWidth(
      this.carouselBreakpointsStandard,
      this.windowInnerWidth(),
    ),
  );

  readonly carouselNumVisibleCollections = computed(() =>
    this.resolveNumVisibleForWidth(
      this.carouselBreakpointsCollections,
      this.windowInnerWidth(),
    ),
  );

  /**
   * Al cambiar `numVisible`, PrimeNG a veces deja mal `transform` / clones. Subir la clave recrea el carousel.
   */
  readonly carouselRemountStandard = signal(0);
  readonly carouselRemountCollections = signal(0);

  private prevNumVisibleStandard = -1;
  private prevNumVisibleCollections = -1;

  tags: TagSchema[] = [];

  products: ProductSchema[] = [];
  catalogs: CatalogSchema[] = [];
  businesses: BusinessSchema[] = [];
  productCollections: ProductCollectionSchema[] = [];
  featuredAttempt = false;
  collectionsAttempt = false;

  get businessesAttempt(): boolean {
    return this.featuredAttempt;
  }

  get catalogsAttempt(): boolean {
    return this.featuredAttempt;
  }

  get productsAttempt(): boolean {
    return this.featuredAttempt;
  }
  private readonly _userPublicService = inject(UserPublicService);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _utils = inject(UtilsService);
  private readonly _subscription = new Subscription();
  private leadProductThumbPreloadInjected = false;
  private static readonly leadProductPreloadLinkId =
    'lineup-preload-lead-product-thumbnail';

  /**
   * Tras el render en el cliente, escucha `resize` con debounce para recalcular
   * `numVisible` de los carruseles y forzar remount cuando cambia el breakpoint efectivo.
   */
  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      fromEvent(window, 'resize')
        .pipe(debounceTime(120), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.onWindowResizeForCarousels());
    });
  }

  /** Dispara las peticiones de contenido destacado y etiquetas principales. */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const w = window.innerWidth;
      this.windowInnerWidth.set(w);
      this.prevNumVisibleStandard = this.resolveNumVisibleForWidth(
        this.carouselBreakpointsStandard,
        w,
      );
      this.prevNumVisibleCollections = this.resolveNumVisibleForWidth(
        this.carouselBreakpointsCollections,
        w,
      );
      this.loadInitialBrowserData();
    }
  }

  /** Sincroniza el ancho inicial del viewport para los computed de carrusel. */
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.windowInnerWidth.set(window.innerWidth);
  }

  /** Cancela suscripciones y elimina el `<link rel="preload">` del LCP si existía. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    if (!isPlatformBrowser(this.platformId)) return;
    this.document
      .getElementById(HomePage.leadProductPreloadLinkId)
      ?.remove();
  }

  /**
   * Primer producto del primer carrusel de colecciones: candidato LCP (Lighthouse).
   */
  isLeadCollectionProduct(
    collection: ProductCollectionSchema,
    product: ProductSchema,
  ): boolean {
    const first = this.productCollections[0];
    return (
      !!first &&
      first.id === collection.id &&
      collection.products?.[0]?.id === product.id
    );
  }

  /** Primer producto de la parrilla “destacados”. */
  isLeadFeaturedProduct(product: ProductSchema): boolean {
    return this.products.length > 0 && this.products[0].id === product.id;
  }

  /**
   * Inserta un preload de la miniatura del primer producto de la primera colección
   * para mejorar LCP en auditorías de rendimiento.
   */
  private injectLeadProductImagePreload(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      this.leadProductThumbPreloadInjected
    ) {
      return;
    }
    const file = this.productCollections[0]?.products?.[0]?.productFiles?.[0]
      ?.file;
    if (!file) return;
    const href = getFileThumbnailUrl(file, 'sm');
    if (!href || !/^https?:\/\//i.test(href)) return;
    if (this.document.getElementById(HomePage.leadProductPreloadLinkId)) {
      return;
    }
    const link = this.document.createElement('link');
    link.id = HomePage.leadProductPreloadLinkId;
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    link.setAttribute('crossorigin', 'anonymous');
    this.document.head.appendChild(link);
    this.leadProductThumbPreloadInjected = true;
  }

  /**
   * Menos ítems que `numVisible` en la resolución actual (para layout compacto bajo `lg` en estilos).
   */
  fewerItemsThanCarouselViewport(
    itemCount: number,
    kind: 'standard' | 'collections',
  ): boolean {
    if (itemCount <= 0) return false;
    const nv =
      kind === 'collections'
        ? this.carouselNumVisibleCollections()
        : this.carouselNumVisibleStandard();
    return itemCount < nv;
  }

  /** Actualiza signals de ancho y fuerza remount de carruseles si cambió `numVisible`. */
  private onWindowResizeForCarousels(): void {
    const w = window.innerWidth;
    const ns = this.resolveNumVisibleForWidth(
      this.carouselBreakpointsStandard,
      w,
    );
    const nc = this.resolveNumVisibleForWidth(
      this.carouselBreakpointsCollections,
      w,
    );
    this.windowInnerWidth.set(w);
    if (ns !== this.prevNumVisibleStandard) {
      this.prevNumVisibleStandard = ns;
      this.carouselRemountStandard.update((k) => k + 1);
    }
    if (nc !== this.prevNumVisibleCollections) {
      this.prevNumVisibleCollections = nc;
      this.carouselRemountCollections.update((k) => k + 1);
    }
  }

  /**
   * Igual que PrimeNG `calculatePosition`: último `numVisible` cuyo breakpoint >= ancho (opciones ordenadas como en PrimeNG).
   */
  private resolveNumVisibleForWidth(
    options: CarouselBreakpointConfig[],
    windowWidth: number,
  ): number {
    if (!isPlatformBrowser(this.platformId) || windowWidth <= 0) {
      return 1;
    }
    const sorted = [...options].sort((data1, data2) => {
      const value1 = data1.breakpoint;
      const value2 = data2.breakpoint;
      let result: number | null = null;
      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2, undefined, { numeric: true });
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      return -1 * result;
    });
    let numVisible = 1;
    for (const res of sorted) {
      if (parseInt(res.breakpoint, 10) >= windowWidth) {
        numVisible = res.numVisible;
      }
    }
    return numVisible;
  }

  /** Carga en una sola petición los negocios, catálogos y productos destacados. */
  private getFeatured(): void {
    this.featuredAttempt = true;
    this._subscription.add(
      this._userPublicService
        .featured({ page: 1, limit: 10 })
        .subscribe({
          next: (response) => {
            this.businesses = [...this.businesses, ...response.featuredBusinesses];
            this.catalogs = [...this.catalogs, ...response.featuredCatalogs];
            this.products = [...this.products, ...response.featuredProducts];
            this.featuredAttempt = false;
          },
          error: (error) => {
            console.error(error);
            this.featuredAttempt = false;
          },
        }),
    );
  }

  /** Obtiene colecciones de productos para el carrusel agrupado. */
  private getProductCollections(): void {
    this.collectionsAttempt = true;
    this._subscription.add(
      this._productPublicService.productCollections().subscribe({
        next: (response) => {
          this.productCollections = [...this.productCollections, ...response];
          this.collectionsAttempt = false;
          this.injectLeadProductImagePreload();
        },
        error: (error) => {
          console.error(error);
          this.collectionsAttempt = false;
        },
      }),
    );
  }

  /** Etiquetas principales para navegación rápida hacia búsqueda por tag. */
  private getMainTags(): void {
    this._subscription.add(
      this._productPublicService.getMainTags(8).subscribe({
        next: (response) => {
          this.tags = response;
        },
      }),
    );
  }

  /** Navega a la ruta de búsqueda global con el término indicado. */
  onSearchSubmit(query: string): void {
    if (query === '') return;

    this._utils.navigate([AppConfigService.config.routes.search, query]);
  }

  /**
   * Evita bloquear el SSR de la portada con peticiones HTTP no críticas para el primer render.
   * Estas cargas se ejecutan solo en navegador tras hidratar.
   */
  private loadInitialBrowserData(): void {
    this.getFeatured();
    this.getProductCollections();
    this.getMainTags();
  }
}
