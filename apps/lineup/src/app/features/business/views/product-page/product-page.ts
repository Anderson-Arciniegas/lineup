import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PendingTasks,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  AuthStore,
  BusinessPublicService,
  BusinessSchema,
  CatalogPrivateService,
  FileThumbnailUrlPipe,
  getFileThumbnailUrl,
  InfinityScrollInput,
  PaginatedProducts,
  ProductPrivateService,
  ProductPublicService,
  ProductSchema,
  SeoService,
  UserPublicService,
  UtilsService,
  VisitTypeEnum,
} from '@lineup/core';
import {
  Button,
  ProductBreadcrumb,
  ProductCard,
  ProductInfo,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Carousel } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

/**
 * Ficha pública de producto: galería responsive, datos enriquecidos, SEO,
 * productos relacionados por etiquetas y registro de visita para usuarios externos.
 */
@Component({
  selector: 'app-product-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    ProductCard,
    ProductInfo,
    TranslateModule,
    Carousel,
    FileThumbnailUrlPipe,
    ImageModule,
    ProgressSpinner,
    Button,
  ],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage implements OnInit, OnDestroy {
  business: BusinessSchema;
  path: string;
  id: number;
  product: ProductSchema;

  /** Degradado vertical (misma lógica que catalog-page). */
  pageBackgroundGradient = '';
  /** Texto claro en breadcrumb / título si la franja superior del degradado es oscura. */
  isDarkBackground = false;

  private static readonly _GRADIENT_TOP_LIGHTEN = 0.25;
  private static readonly _GRADIENT_BOTTOM_LIGHTEN = 0.6;
  private static readonly _LUMINANCE_THRESHOLD = 0.45;
  attempt = false;
  /**
   * Slides visibles (Tailwind por defecto): xl/2xl (≥1280px) → 3; lg (1024–1279) → 2; debajo de lg → 1.
   * Sin `responsiveOptions` para que PrimeNG regenere CSS vía `@Input` al redimensionar.
   */
  carouselNumVisible = 2;
  /** Al cambiar, destruye y recrea `p-carousel` (evita transform/clones desincronizados al cruzar breakpoints). */
  carouselInstanceKey = 0;
  myBusiness = false;
  configUrl: string;
  /** Hasta 4 productos del mismo negocio que comparten etiquetas con el producto actual. */
  sameBusinessProducts: ProductSchema[] = [];
  /** Hasta 4 productos de otros contextos (sin filtrar por negocio), excl. los de `sameBusinessProducts`. */
  relatedProductsByTags: ProductSchema[] = [];

  private static readonly _TAG_RELATED_MAX = 4;
  private static readonly _TAG_RELATED_FETCH = 4;

  private readonly _businessService = inject(BusinessPublicService);
  private readonly _breakpointObserver = inject(BreakpointObserver);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _utils = inject(UtilsService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _pendingTasks = inject(PendingTasks);
  private readonly _seoService = inject(SeoService);
  private readonly _userService = inject(UserPublicService);

  private readonly _subscription = new Subscription();

  /**
   * Observa breakpoints para el carrusel de imágenes, lee `business` e `idProduct` de la ruta
   * y lanza la carga paralela de negocio y producto.
   */
  ngOnInit() {
    this._subscription.add(
      this._breakpointObserver
        .observe([
          '(max-width: 1023px)',
          '(min-width: 1024px) and (max-width: 1279px)',
          '(min-width: 1280px)',
        ])
        .subscribe(() => {
          const next = this._carouselNumVisibleForViewport();
          if (next !== this.carouselNumVisible) {
            this.carouselNumVisible = next;
            this.carouselInstanceKey += 1;
            this._cdr.markForCheck();
          }
        }),
    );

    this.path = this._activatedRoute.snapshot.params['business'];
    this.id = Number(this._activatedRoute.snapshot.params['idProduct']);

    this.getBusiness();
    this.getProduct();
  }

  /** Obtiene el detalle del producto, aplica SEO, visitas y dispara relaciones por tags. */
  private getProduct(): void {
    if (this.attempt) return;
    this.attempt = true;
    const taskDone = this._pendingTasks.add();
    this._subscription.add(
      this._productPublicService
        .findOneProduct(this.id)
        .pipe(finalize(() => taskDone()))
        .subscribe({
          next: (product) => {
            this.product = product;
            if (product.productFiles?.length) {
              this.carouselInstanceKey += 1;
            }
            if (!this.myBusiness) {
              this.visitProduct();
            }
            if (this.myBusiness) {
              this.configUrl = `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${this.product.catalog.path}/${this.product.id}`;
            }
            this.applyBrandSurfaceColor();
            this.loadTaggedRelatedProducts(product);
            this._seoService.setProductPage(product, this.path);
            this.attempt = false;
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

  /** Resuelve el negocio por path para breadcrumb, permisos de edición y color de marca. */
  private getBusiness(): void {
    this._subscription.add(
      this._businessService.findBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
          this.applyBrandSurfaceColor();
        },
        error: (error) => {
          console.error(error);
        },
      }),
    );
  }

  /** Cancela suscripciones (breakpoint observer y peticiones). */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /** Prioridad: `catalog.hexColor` → `business.hexColor`. */
  private applyBrandSurfaceColor(): void {
    const catalogHex = this.product?.catalog?.hexColor?.trim();
    const businessHex = this.business?.hexColor?.trim();
    if (catalogHex) {
      this.setColor(catalogHex);
    } else if (businessHex) {
      this.setColor(businessHex);
    }
  }

  get brandToneLight(): boolean {
    return !!this.pageBackgroundGradient && this.isDarkBackground;
  }

  get brandToneDark(): boolean {
    return !!this.pageBackgroundGradient && !this.isDarkBackground;
  }

  /**
   * PrimeNG activa circular si `length >= numVisible`: con 1 foto y 1 visible entran clones y autoplay rotos.
   * Solo circular cuando haya más ítems que cupo en pantalla.
   */
  get carouselCircular(): boolean {
    return this._carouselSlideCount() > this.carouselNumVisible;
  }

  /** Sin autoplay si una sola imagen o si todas caben a la vez. */
  get carouselAutoplayInterval(): number {
    const n = this._carouselSlideCount();
    if (n <= 1) return 0;
    if (n <= this.carouselNumVisible) return 0;
    return 8000;
  }

  get carouselShowNavigators(): boolean {
    return this._carouselSlideCount() > this.carouselNumVisible;
  }

  private _carouselSlideCount(): number {
    const files = this.product?.productFiles;
    if (!files?.length) {
      return 0;
    }
    return files.filter((pf) => !!getFileThumbnailUrl(pf.file, 'md')?.trim())
      .length;
  }

  /** Mapea media queries CDK a número de slides visibles del carousel PrimeNG. */
  private _carouselNumVisibleForViewport(): number {
    if (this._breakpointObserver.isMatched('(min-width: 1280px)')) {
      return 3;
    }
    if (this._breakpointObserver.isMatched('(min-width: 1024px)')) {
      return 2;
    }
    return 1;
  }

  setColor(raw: string): void {
    const rgb = ProductPage.parseColorToRgb(raw);
    if (!rgb) {
      return;
    }
    const top = ProductPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      ProductPage._GRADIENT_TOP_LIGHTEN,
    );
    const bottom = ProductPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      ProductPage._GRADIENT_BOTTOM_LIGHTEN,
    );
    this.pageBackgroundGradient = `linear-gradient(to bottom, rgba(${top.r}, ${top.g}, ${top.b}, 1), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, 1))`;
    const luminance = ProductPage.relativeLuminance(top.r, top.g, top.b);
    this.isDarkBackground = luminance < ProductPage._LUMINANCE_THRESHOLD;
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
        r: ProductPage.clampByte(Number(rgb[1])),
        g: ProductPage.clampByte(Number(rgb[2])),
        b: ProductPage.clampByte(Number(rgb[3])),
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
      r: ProductPage.clampByte(r + (255 - r) * t),
      g: ProductPage.clampByte(g + (255 - g) * t),
      b: ProductPage.clampByte(b + (255 - b) * t),
    };
  }

  private static relativeLuminance(r: number, g: number, b: number): number {
    const linear = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  /** Lista única de slugs o nombres de etiqueta asociados al producto. */
  private extractProductTagIdentifiers(product: ProductSchema): string[] {
    const ids =
      product.productTags?.flatMap((pt) => {
        const t = pt.tag;
        if (!t) {
          return [];
        }
        const id = (t.slug?.trim() || t.name?.trim() || '').trim();
        return id ? [id] : [];
      }) ?? [];
    return [...new Set(ids)];
  }

  /**
   * Consulta en paralelo productos con las mismas etiquetas dentro del negocio
   * y en el catálogo global, excluyendo duplicados y limitando a cuatro ítems por bloque.
   */
  private loadTaggedRelatedProducts(product: ProductSchema): void {
    const tagNamesOrSlugs = this.extractProductTagIdentifiers(product);
    if (tagNamesOrSlugs.length === 0) {
      this.sameBusinessProducts = [];
      this.relatedProductsByTags = [];
      return;
    }

    const pagination: InfinityScrollInput = {
      page: 1,
      limit: ProductPage._TAG_RELATED_FETCH,
    };

    const idBusinessRaw = product.business?.id ?? product.idCreationBusiness;
    const idBusiness =
      idBusinessRaw != null && !Number.isNaN(Number(idBusinessRaw))
        ? Number(idBusinessRaw)
        : null;

    const emptyPage: PaginatedProducts = {
      items: [],
      limit: pagination.limit ?? 0,
      page: pagination.page,
      total: 0,
    };

    const same$ =
      idBusiness != null
        ? this._productPublicService
            .getAllByTags(pagination, tagNamesOrSlugs, {
              idBusiness,
              idProducts: [product.id],
            })
            .pipe(catchError(() => of(emptyPage)))
        : of(emptyPage);

    const related$ = this._productPublicService
      .getAllByTags(pagination, tagNamesOrSlugs, {
        idProducts: [product.id],
      })
      .pipe(catchError(() => of(emptyPage)));

    this._subscription.add(
      forkJoin({ same: same$, related: related$ }).subscribe({
        next: ({ same, related }) => {
          if (this.product?.id !== product.id) {
            return;
          }
          this.sameBusinessProducts = same.items.slice(
            0,
            ProductPage._TAG_RELATED_MAX,
          );
          const sameIds = new Set(this.sameBusinessProducts.map((p) => p.id));
          this.relatedProductsByTags = related.items
            .filter((p) => !sameIds.has(p.id))
            .slice(0, ProductPage._TAG_RELATED_MAX);
        },
      }),
    );
  }

  /** Registra visita al producto para analíticas (visitantes no dueños). */
  private visitProduct(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.product.id,
          type: VisitTypeEnum.PRODUCT,
        })
        .subscribe(),
    );
  }
}
