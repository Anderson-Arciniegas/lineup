import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  UserPublicService,
  UtilsService,
  VisitTypeEnum,
} from '@lineup/core';
import {
  BusinessData,
  CatalogCard,
  CreateCatalogCard,
  ProductBreadcrumb,
  ProductCard,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-business-page',
  imports: [
    CommonModule,
    BusinessData,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    CatalogCard,
    ProductBreadcrumb,
    CreateCatalogCard,
    InfiniteScrollDirective,
    ProgressSpinnerModule,
    TranslateModule,
    ProductCard,
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
  noMoreResults = false;
  attempt = false;
  attemptProducts = false;
  /** Degradado vertical (arriba más intenso, abajo más suave; siempre más claro que el original). */
  pageBackgroundGradient = '';
  /** Según la zona superior del degradado: si es oscura, el texto de marca debe ser claro. */
  isDarkBackground = false;

  /** Mezcla con blanco en la parte superior del degradado (color principal, un poco más claro que el original). */
  private static readonly _GRADIENT_TOP_LIGHTEN = 0.25;
  /** Mezcla con blanco abajo (aún más claro que la parte superior). */
  private static readonly _GRADIENT_BOTTOM_LIGHTEN = 0.6;
  private static readonly _LUMINANCE_THRESHOLD = 0.45;

  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _utils = inject(UtilsService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _catalogService = inject(CatalogPublicService);
  private readonly _productService = inject(ProductPublicService);
  private readonly _userService = inject(UserPublicService);

  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    console.log(this.path);
    console.log('business', this._authStore.business());

    this.getBusiness();
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessPublicService.findBusinessByPath(this.path).subscribe({
        next: (business) => {
          console.log(business);
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
          this.getCatalogs();
          this.getProducts();
          if (!this.myBusiness) {
            this.visitBusiness();
          }
          if (this.business.hexColor) {
            this.setColor(this.business.hexColor);
          }
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

  private visitBusiness(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.business.id,
          type: VisitTypeEnum.BUSINESS,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
        }),
    );
  }

  onScroll(): void {
    console.log('onScroll');
    this.getCatalogs();
  }

  private getProducts(): void {
    if (this.attemptProducts || this.noMoreResults) return;
    this.attemptProducts = true;
    this._subscription.add(
      this._productService
        .getAllPrimaryProductsByBusiness({ idBusiness: this.business.id })
        .subscribe({
          next: (products) => {
            this.attemptProducts = false;
            console.log(products);
            this.products = products;
          },
          error: (error) => {
            console.error(error);
            this.attemptProducts = false;
          },
        }),
    );
  }

  private getCatalogs(): void {
    if (this.attempt || this.noMoreResults) return;
    this.attempt = true;
    this._subscription.add(
      this._catalogService
        .findCatalogsByBusinessId(this.business.id, {
          page: this.page,
          limit: 20,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
            this.page++;
            if (response.items.length === 0) {
              this.noMoreResults = true;
            } else {
              this.catalogs = [...this.catalogs, ...response.items];
            }
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
          complete: () => {
            console.log('complete');
            this.attempt = false;
          },
        }),
    );
  }

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

  /** Luminancia relativa sRGB (WCAG), entre 0 y 1. */
  private static relativeLuminance(r: number, g: number, b: number): number {
    const linear = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }
}
