import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AuthStore,
  BcvOfficialRatesSchema,
  CurrencySchema,
  DiscountSchema,
  ProductPublicService,
  ProductSchema,
  RatesPrivateService,
  UtilsService,
} from '@lineup/core';
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
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard implements AfterViewInit, OnInit {
  @Input() product: ProductSchema;
  @Input() width = 'w-65';
  @Input() height = 'h-100';
  @Input() dashboardMode: boolean;
  image: string;
  businessImage: string;
  imageLoaded: boolean;
  url: string;
  price: number;
  originalPrice: number;
  currency: CurrencySchema;
  hasLiked: boolean;
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

  /** Id único por instancia para el contenedor flip (DOM / GSAP). */
  readonly cardFlipId = `product-flip-${
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }`;

  ngOnInit(): void {
    if (this.product) {
      this.image = this.product.productFiles[0].file?.url;
      if (this.product.business && this.product.catalog) {
        this.url = `/${this.product.business?.path}/${this.product.catalog?.path}/${this.product.id}`;
        this.businessImage = this.product.business.image?.url;
      } else {
        this.url = `/business-1/catalog-1/123`;
      }
      this.price = this.product.skus?.[0].price ?? null;
      this.originalPrice = this.product.skus?.[0].price ?? null;
      this.currency = this.product.skus?.[0]?.currency ?? null;
      if (isPlatformBrowser(this.platformId)) {
        this.getRates();
      }
    } else {
      this.image = this.images[Math.floor(Math.random() * this.images.length)];
      this.url = `/business-1/catalog-1/123`;
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const flipBox = document.getElementById(this.cardFlipId);
      const inner = flipBox.querySelector('.flip-inner');

      flipBox.addEventListener('mouseenter', () => {
        gsap.to(inner, {
          rotateX: 180,
          duration: 0.4,
          ease: 'power2.inOut',
        });
      });

      flipBox.addEventListener('mouseleave', () => {
        gsap.to(inner, {
          rotateX: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        });
      });
    }, 100);

    this.hasLikedProduct();
  }

  likeProduct(): void {
    if (this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
    this.hasLiked = true;
    this._subscription.add(
      this._productPublicService.likeProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = true;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = false;
        },
        complete: () => {
          console.log('Product liked');
        },
      }),
    );
  }

  unlikeProduct(): void {
    if (!this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
    this.hasLiked = false;
    this._subscription.add(
      this._productPublicService.unlikeProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = false;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = true;
        },
        complete: () => {
          console.log('Product unliked');
        },
      }),
    );
  }

  hasLikedProduct(): void {
    if (this._authStore.isBusinessLoggedIn()) return;
    this._subscription.add(
      this._productPublicService.hasLikedProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
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
