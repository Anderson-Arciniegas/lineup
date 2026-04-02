import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AuthStore,
  BcvOfficialRatesSchema,
  CurrencySchema,
  CurrencySymbolPipe,
  DiscountSchema,
  ProductPublicService,
  ProductSchema,
  RatesPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Skeleton } from 'primeng/skeleton';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';
import { ShareModal } from '../share-modal/share-modal';

@Component({
  selector: 'lib-catalog-carousel-item',
  imports: [CommonModule, Button, Skeleton, CurrencySymbolPipe, RouterModule],
  templateUrl: './catalog-carousel-item.html',
  styleUrl: './catalog-carousel-item.scss',
})
export class CatalogCarouselItem implements AfterViewInit {
  @Input() product: ProductSchema;
  @Input() useLightText?: boolean;
  imageLoaded = false;
  hasLiked = false;
  price: number;
  originalPrice: number;
  currency: CurrencySchema;
  rates: BcvOfficialRatesSchema;
  ref: DynamicDialogRef | undefined;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _authStore = inject(AuthStore);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _ratesService = inject(RatesPrivateService);
  private readonly _subscription = new Subscription();

  ngAfterViewInit(): void {
    this.hasLikedProduct();

    this.price = this.product.skus?.[0].price ?? null;
    this.originalPrice = this.product.skus?.[0].price ?? null;
    this.currency = this.product.skus?.[0]?.currency ?? null;
    this.getRates();
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
