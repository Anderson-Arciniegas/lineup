import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessPublicService,
  BusinessSchema,
  CatalogPrivateService,
  CatalogPublicService,
  CatalogSchema,
  ProductPublicService,
  ProductSchema,
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
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog-page',
  imports: [
    CommonModule,
    ProductBreadcrumb,
    ProductCard,
    Button,
    IconField,
    InputIcon,
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
  attempt = false;
  productsAttempt = false;
  page = 1;
  noMoreResults = false;
  myBusiness = false;
  searchQuery = '';
  layoutMode = 'Grid';
  layoutOptions = [
    { index: 0, icon: 'pi pi-th-large', label: 'Grid', value: 'Grid' },
    { index: 1, icon: 'pi pi-list', label: 'List', value: 'List' },
  ];
  downloadMode = false;
  color = '#ffffff';
  attemptColor = false;
  ref: DynamicDialogRef | undefined;
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _catalogPublicService = inject(CatalogPublicService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productPublicService = inject(ProductPublicService);

  private readonly _authStore = inject(AuthStore);
  private readonly _userService = inject(UserPublicService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    this.getBusiness();
    this.getCatalog();
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessPublicService.findBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
          if (this.catalog) {
            if (this.catalog.hexColor) {
              this.setColor(this.catalog.hexColor);
            } else if (this.business.hexColor) {
              this.setColor(this.business.hexColor);
            }
          }
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

  onLayoutModeChange(event: any): void {
    console.log(event);
    // this.layoutMode = event.value;
    console.log(this.layoutMode);
  }

  onSearchSubmit(query: string): void {
    console.log(query);
    this.searchQuery = query;
    this.products = [];
    this.page = 1;
    this.noMoreResults = false;
    this.getProducts();
  }

  private getCatalog(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._subscription.add(
      this._catalogPublicService
        .findOneCatalogByPath(this.catalogPath)
        .subscribe({
          next: (catalog) => {
            this.catalog = catalog;
            this.attempt = false;
            console.log(this.catalog);
            this.getProducts();
            if (!this.myBusiness) {
              this.visitCatalog();
            }

            if (this.catalog.hexColor) {
              this.setColor(this.catalog.hexColor);
            } else if (this.business && this.business.hexColor) {
              this.setColor(this.business.hexColor);
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

  private visitCatalog(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.catalog.id,
          type: VisitTypeEnum.CATALOG,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
        }),
    );
  }

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
            console.log(products);
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
            console.log('complete');
            this.productsAttempt = false;
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

  onScroll(): void {
    console.log('onScroll');
    this.getProducts();
  }

  downloadCatalog(): void {
    console.log('downloadCatalog');
    this.downloadMode = true;
  }

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

  saveColor(): void {
    console.log('saveColor');
    this.attemptColor = true;
    this._subscription.add(
      this._catalogService
        .updateCatalog({
          idCatalog: this.catalog.id,
          hexColor: this.color,
          title: this.catalog.title,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
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
            console.log('complete');
            this.attemptColor = false;
          },
        }),
    );
  }
}
