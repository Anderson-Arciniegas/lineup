import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessPrivateService,
  BusinessSchema,
  CatalogPrivateService,
  ProductPrivateService,
  ProductSchema,
  UserPublicService,
  UtilsService,
  VisitTypeEnum,
} from '@lineup/core';
import { ProductBreadcrumb, ProductInfo } from '@lineup/ui';
import { TranslateService } from '@ngx-translate/core';
import { Carousel, CarouselPageEvent } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    ProductInfo,
    Carousel,
    ImageModule,
    ProgressSpinner,
  ],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage implements OnInit {
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
  imageLoaded: boolean[] = [];
  attempt = false;
  responsiveOptions: any[] | undefined;
  myBusiness = false;
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _utils = inject(UtilsService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _userService = inject(UserPublicService);

  private readonly _subscription = new Subscription();

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];

    // this.product = generateRandomProducts(1)[0];
    console.log(this.product);

    this.path = this._activatedRoute.snapshot.params['business'];
    this.id = Number(this._activatedRoute.snapshot.params['idProduct']);
    console.log(this.id);
    console.log(this.path);
    console.log('business', this._authStore.business());

    this.getBusiness();
    this.getProduct();
  }

  private getProduct(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._subscription.add(
      this._productService.findOneProduct(this.id).subscribe({
        next: (product) => {
          console.log(product);
          this.product = product;
          if (product.productFiles) {
            this.images = product.productFiles.map(
              (file) => file.file?.url || '',
            );
          }
          if (!this.myBusiness) {
            this.visitProduct();
          }
          this.applyBrandSurfaceColor();
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          console.log(
            (error as { graphQLErrors?: Array<{ message?: string }> })
              ?.graphQLErrors,
          );
          this.attempt = false;
        },
        complete: () => {
          console.log('complete');
          this.attempt = false;
        },
      }),
    );
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          console.log(business);
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
          this.applyBrandSurfaceColor();
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          console.log('complete');
        },
      }),
    );
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

  onPage($event: CarouselPageEvent): void {
    console.log('Page changed to: ', $event.page);
  }

  onImageLoad(index: number): void {
    this.imageLoaded[index] = true;
    this._cdr.detectChanges();
  }

  private visitProduct(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.product.id,
          type: VisitTypeEnum.PRODUCT,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
        }),
    );
  }
}
