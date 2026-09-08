import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';
import { ShareModal } from '../share-modal/share-modal';

/**
 * Slide de producto dentro del carrusel de catálogo: precio con BCV, stock, like y compartir.
 */
@Component({
  selector: 'lib-catalog-carousel-item',
  imports: [
    CommonModule,
    Button,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './catalog-carousel-item.html',
  styleUrl: './catalog-carousel-item.scss',
})
export class CatalogCarouselItem implements AfterViewInit, OnChanges, OnDestroy {
  @Input() product: ProductSchema;
  @Input() useLightText?: boolean;
  /** Product image URL when available. */
  productImageSrc: string | undefined;
  imageLoaded = false;
  hasLiked = false;
  price: number;
  originalPrice: number;
  currency: CurrencySchema;
  rates: BcvOfficialRatesSchema;
  inStock: boolean;
  outOfStock: boolean;
  ref: DynamicDialogRef | undefined;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _authStore = inject(AuthStore);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _ratesService = inject(RatesPrivateService);
  private readonly _subscription = new Subscription();

  /** True when a resolvable product image URL is available. */
  get hasProductImage(): boolean {
    return !!this.productImageSrc;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.resolveProductImageSrc();
    }
  }

  /** Inicializa precios, disponibilidad, tasas BCV y estado de favorito. */
  ngAfterViewInit(): void {
    this.resolveProductImageSrc();
    this.hasLikedProduct();

    this.price = this.product.skus?.[0].price ?? null;
    this.originalPrice = this.product.skus?.[0].price ?? null;
    this.currency = this.product.skus?.[0]?.currency ?? null;
    this.getRates();
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
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /** Resolves the first product file URL, or clears it for the placeholder. */
  private resolveProductImageSrc(): void {
    const raw = getFileThumbnailUrl(
      this.product?.productFiles?.[0]?.file,
      'md',
    );
    this.productImageSrc = raw?.trim() || undefined;
    this.imageLoaded = false;
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
        url: `${window.location.origin}/${this.product.business.path}/${this.product.catalog.path}/${this.product.id}`,
      },
      modal: true,
      closable: true,
    });
  }

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

  hasLikedProduct(): void {
    if (!this._authStore.isUserLoggedIn()) return;
    this._subscription.add(
      this._productPublicService.hasLikedProduct(this.product.id).subscribe({
        next: (response) => {
          this.hasLiked = response;
        },
      }),
    );
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
