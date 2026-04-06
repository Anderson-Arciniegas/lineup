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
  UtilsService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { gsap } from 'gsap';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';

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
  @Input() dashboardMode: boolean;
  /** Catálogo PDF: sin botones, flip fijado en la cara del título. */
  @Input() pdfExportAttempt = false;
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

  /** Id único por instancia para el contenedor flip (DOM / GSAP). */
  readonly cardFlipId = `product-flip-${
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }`;

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

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this._flipInitTimeoutId = setTimeout(() => {
      this._flipInitTimeoutId = undefined;
      this.syncFlipForExportState();
    }, 100);

    this.hasLikedProduct();
  }

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
    }
    if (changes['pdfExportAttempt'] && isPlatformBrowser(this.platformId)) {
      this.syncFlipForExportState();
    }
  }

  /**
   * Igual que catalog-carousel: `?t=` para URLs remotas (canvas / html2canvas / CORS).
   */
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

  /** PDF: cara frontal (título). Normal: hover flip si aplica. */
  private syncFlipForExportState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const flipBox = document.getElementById(this.cardFlipId);
    const inner = flipBox?.querySelector('.flip-inner');
    if (!flipBox || !inner) {
      return;
    }

    this._teardownFlipListeners?.();
    this._teardownFlipListeners = undefined;
    gsap.killTweensOf(inner);

    if (this.pdfExportAttempt) {
      gsap.set(inner, { rotateX: 0 });
      return;
    }

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
  }

  ngOnDestroy(): void {
    if (this._flipInitTimeoutId !== undefined) {
      clearTimeout(this._flipInitTimeoutId);
    }
    this._teardownFlipListeners?.();
    this._subscription.unsubscribe();
  }

  likeProduct(): void {
    if (this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
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

  unlikeProduct(): void {
    if (!this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
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

  hasLikedProduct(): void {
    if (this._authStore.isBusinessLoggedIn()) return;
    this._subscription.add(
      this._productPublicService.hasLikedProduct(this.product.id).subscribe({
        next: (response) => {
          this.hasLiked = response;
        },
      }),
    );
  }

  setTitle(title: string): string {
    return title.length > 50
      ? (title[49] === ' ' ? title.substring(0, 49) : title.substring(0, 50)) +
          '...'
      : title;
  }

  navigateToBusiness(): void {
    if (this.product?.business?.path) {
      this._router.navigate([`/${this.product.business.path}`]);
    }
  }

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
