import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AuthStore,
  BcvOfficialRatesSchema,
  CurrencySchema,
  DiscountSchema,
  getFileThumbnailUrl,
  ProductPublicService,
  ProductSchema,
  RatesPrivateService,
  ReactionTypeEnum,
  UtilsService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';

/**
 * Tarjeta de producto pública con flip 3D (GSAP), like, precio con BCV/descuento,
 * modo exportación PDF (sin animación) y `fetchpriority` opcional para LCP.
 */
@Component({
  selector: 'lib-product-card',
  imports: [
    CommonModule,
    Button,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    TooltipModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard
  implements AfterViewInit, OnChanges, OnDestroy, OnInit
{
  @Input() product: ProductSchema;
  @Input() width = 'w-65';
  @Input() height = 'h-100';
  /** Primera imagen above-the-fold (p. ej. carrusel): mejora LCP con fetchpriority. */
  @Input() imageFetchPriority = false;
  @Input() dashboardMode: boolean;
  /** Catálogo PDF: sin botones, flip fijado en la cara del título. */
  @Input() pdfExportAttempt = false;
  /** Estado opcional al ir al negocio (p. ej. `{ lineupPublicBack: '/' }` desde catálogo). */
  @Input() businessNavigateState?: Record<string, unknown>;
  image: string;
  businessImage: string;
  imageLoaded: boolean;
  url: string;
  price: number;
  originalPrice: number;
  currency: CurrencySchema;
  hasLiked: boolean;
  inStock: boolean;
  outOfStock: boolean;
  images: string[] = [
    'assets/images/products/headphones-min.webp',
    'assets/images/products/makeup.webp',
    'assets/images/products/shoes-min.webp',
    'assets/images/products/phone-min.webp',
    'assets/images/products/skincare-min.webp',
    'assets/images/products/tomato-min.webp',
    'assets/images/products/camera.webp',
    'assets/images/products/cooler.webp',
    'assets/images/products/laptop.webp',
  ];

  rates: BcvOfficialRatesSchema;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly _authStore = inject(AuthStore);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _ratesService = inject(RatesPrivateService);
  private readonly _router = inject(Router);
  private readonly _subscription = new Subscription();
  private _flipInitTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private _teardownFlipListeners: (() => void) | undefined;
  private _teardownFlipWarmup: (() => void) | undefined;
  private _gsap: typeof import('gsap').gsap | null = null;

  /** Id único por instancia para el contenedor flip (DOM / GSAP). */
  readonly cardFlipId = `product-flip-${
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }`;

  /** Resuelve miniaturas, URL al detalle, precios iniciales y disponibilidad por SKUs. */
  ngOnInit(): void {
    if (this.product) {
      this.image = this.srcWithCrossOriginNonce(
        getFileThumbnailUrl(this.product.productFiles[0].file, 'sm'),
      );
      if (this.product.business && this.product.catalog) {
        this.url = `/${this.product.business?.path}/${this.product.catalog?.path}/${this.product.id}`;
        this.businessImage = this.srcWithCrossOriginNonce(
          getFileThumbnailUrl(this.product.business.image, 'xs'),
        );
      } else {
        this.url = `/business-1/catalog-1/123`;
      }
      this.price = this.product.skus?.[0].price ?? null;
      this.originalPrice = this.product.skus?.[0].price ?? null;
      this.currency = this.product.skus?.[0]?.currency ?? null;
      if (isPlatformBrowser(this.platformId)) {
        this.getRates();
      }
      this.product.skus?.map((sku) => {
        if (
          sku.quantity === null ||
          sku.quantity === undefined ||
          sku.quantity > 0
        ) {
          this.inStock = true;
        }
      });

      if (this.inStock) {
        this.outOfStock = false;
      } else {
        this.outOfStock = true;
      }
    } else {
      this.image = this.images[Math.floor(Math.random() * this.images.length)];
      this.url = `/business-1/catalog-1/123`;
    }
  }

  /** Marca imagen cargada si viene de caché, inicializa flip y consulta si el usuario dio like. */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    requestAnimationFrame(() => this.syncImageLoadedIfCached());

    this._flipInitTimeoutId = setTimeout(() => {
      this._flipInitTimeoutId = undefined;
      this.syncFlipForExportState();
      this.syncImageLoadedIfCached();
    }, 100);

    this.hasLikedProduct();
  }

  /** Al cambiar `product` o `pdfExportAttempt`, actualiza imágenes y estado del flip. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.imageLoaded = false;
      this.image = this.srcWithCrossOriginNonce(
        getFileThumbnailUrl(this.product.productFiles[0]?.file, 'sm'),
      );
      this.businessImage = this.srcWithCrossOriginNonce(
        getFileThumbnailUrl(this.product.business?.image, 'sm'),
      );
      if (this.product.business && this.product.catalog) {
        this.url = `/${this.product.business.path}/${this.product.catalog.path}/${this.product.id}`;
      }
      queueMicrotask(() =>
        requestAnimationFrame(() => this.syncImageLoadedIfCached()),
      );
    }
    if (changes['pdfExportAttempt'] && isPlatformBrowser(this.platformId)) {
      this.syncFlipForExportState();
    }
  }

  /**
   * Si la imagen ya está en caché, `complete` es true pero el evento `load` puede no dispararse;
   * sin esto el PDF (waitForImages + html2canvas) dejaba el spinner visible indefinidamente.
   */
  private syncImageLoadedIfCached(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const flip = document.getElementById(this.cardFlipId);
    const img = flip?.querySelector<HTMLImageElement>('.product-image');
    if (img?.complete && img.naturalWidth > 0) {
      this.imageLoaded = true;
    }
  }

  /** Añade `?t=` a URLs http(s) para forzar bust de caché en capturas (html2canvas / CORS). */
  private srcWithCrossOriginNonce(
    url: string | undefined | null,
  ): string | undefined {
    if (url == null || url === '') {
      return undefined;
    }
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    if (!/^https?:\/\//i.test(url)) {
      return url;
    }
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}t=${Date.now()}`;
  }

  /** En PDF fija la cara frontal; en vista normal prepara hover/touch para el flip con GSAP. */
  private syncFlipForExportState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    void this.syncFlipForExportStateAsync();
  }

  private async ensureGsap(): Promise<typeof import('gsap').gsap> {
    if (!this._gsap) {
      const m = await import('gsap');
      this._gsap = m.gsap;
    }
    return this._gsap;
  }

  private async syncFlipForExportStateAsync(): Promise<void> {
    const flipBox = document.getElementById(this.cardFlipId);
    const inner = flipBox?.querySelector('.flip-inner');
    if (!flipBox || !inner) {
      return;
    }

    this._teardownFlipListeners?.();
    this._teardownFlipListeners = undefined;
    this._teardownFlipWarmup?.();
    this._teardownFlipWarmup = undefined;

    if (this.pdfExportAttempt) {
      const gsap = await this.ensureGsap();
      gsap.killTweensOf(inner);
      gsap.set(inner, { rotateX: 0 });
      this._teardownFlipListeners = (): void => {
        gsap.killTweensOf(inner);
      };
      return;
    }

    this._gsap?.killTweensOf(inner);

    const onWarmup = (): void => {
      void this.attachFlipHoverAfterWarmup(flipBox, inner);
    };

    flipBox.addEventListener('mouseenter', onWarmup, { passive: true });
    flipBox.addEventListener('touchstart', onWarmup, { passive: true });
    this._teardownFlipWarmup = (): void => {
      flipBox.removeEventListener('mouseenter', onWarmup);
      flipBox.removeEventListener('touchstart', onWarmup);
    };
  }

  private async attachFlipHoverAfterWarmup(
    flipBox: HTMLElement,
    inner: Element,
  ): Promise<void> {
    this._teardownFlipWarmup?.();
    this._teardownFlipWarmup = undefined;

    const gsap = await this.ensureGsap();
    gsap.killTweensOf(inner);

    const onEnter = (): void => {
      gsap.to(inner, {
        rotateX: 180,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    };
    const onLeave = (): void => {
      gsap.to(inner, {
        rotateX: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    };

    flipBox.addEventListener('mouseenter', onEnter);
    flipBox.addEventListener('mouseleave', onLeave);
    this._teardownFlipListeners = (): void => {
      flipBox.removeEventListener('mouseenter', onEnter);
      flipBox.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(inner);
    };

    if (flipBox.matches(':hover')) {
      onEnter();
    }
  }

  /** Limpia timeouts, listeners GSAP y suscripciones HTTP. */
  ngOnDestroy(): void {
    if (this._flipInitTimeoutId !== undefined) {
      clearTimeout(this._flipInitTimeoutId);
    }
    this._teardownFlipWarmup?.();
    this._teardownFlipListeners?.();
    this._subscription.unsubscribe();
  }

  /** Registra like vía API (no aplica si el negocio está logueado como dueño). */
  likeProduct(): void {
    if (this.hasLiked || !this._authStore.isUserLoggedIn()) return;
    this.hasLiked = true;
    this._subscription.add(
      this._productPublicService.likeProduct(this.product.id).subscribe({
        next: () => {
          this.hasLiked = true;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = false;
        },
      }),
    );
  }

  /** Quita el like del producto en backend. */
  unlikeProduct(): void {
    if (!this.hasLiked || !this._authStore.isUserLoggedIn()) return;
    this.hasLiked = false;
    this._subscription.add(
      this._productPublicService.unlikeProduct(this.product.id).subscribe({
        next: () => {
          this.hasLiked = false;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = true;
        },
      }),
    );
  }

  /** Consulta estado inicial de favorito para usuarios consumidores. */
  hasLikedProduct(): void {
    if (!this._authStore.isUserLoggedIn()) return;

    this.hasLiked =
      this.product.reactions?.some(
        (reaction) => reaction.type === ReactionTypeEnum.LIKE,
      ) ?? false;

    // this._subscription.add(
    //   this._productPublicService.hasLikedProduct(this.product.id).subscribe({
    //     next: (response) => {
    //       this.hasLiked = response;
    //     },
    //   }),
    // );
  }

  /** Trunca título largo evitando cortar en medio de una palabra cuando es posible. */
  setTitle(title: string): string {
    return title.length > 50
      ? (title[49] === ' ' ? title.substring(0, 49) : title.substring(0, 50)) +
          '...'
      : title;
  }

  /** Navega al perfil público del negocio con `state` opcional (p. ej. breadcrumb atrás). */
  navigateToBusiness(): void {
    if (this.product?.business?.path) {
      this._router.navigate([`/${this.product.business.path}`], {
        state: this.businessNavigateState,
      });
    }
  }

  /** Obtiene tasas BCV y recalcula precio mostrado con descuento de producto. */
  getRates(): void {
    this._subscription.add(
      this._ratesService.findBcvOfficialRates().subscribe({
        next: (rates) => {
          this.rates = rates;
          this.price = this._utilsService.formatPriceWithDiscount(
            this.product.skus?.[0] ?? null,
            (this.product.discountProduct?.discount as DiscountSchema) ?? null,
            this.rates ?? null,
          );
          this.currency = this.product.skus?.[0]?.currency ?? null;
        },
      }),
    );
  }
}
