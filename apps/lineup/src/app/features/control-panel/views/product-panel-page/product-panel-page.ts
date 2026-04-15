import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppConfigService,
  BASIC_COLORS,
  BcvOfficialRatesSchema,
  CurrencySymbolPipe,
  DiscountSchema,
  DiscountTypeEnum,
  LocaleDatePipe,
  ProductPrivateService,
  ProductRatingSchema,
  ProductSchema,
  ProductSkuSchema,
  RatesPrivateService,
  RatingPublicService,
  UtilsService,
} from '@lineup/core';
import { Button, ConfirmationModal, ProductRatingItem } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Subscription, take } from 'rxjs';

/**
 * Panel de gestión de un producto concreto: precios, SKUs, descuentos aplicables,
 * valoraciones recibidas y acciones destructivas con confirmación.
 */
@Component({
  selector: 'app-product-panel-page',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    TranslateModule,
    ProgressSpinner,
    SkeletonModule,
    TagModule,
    LocaleDatePipe,
    CurrencySymbolPipe,
    ProductRatingItem,
    ToggleSwitchModule,
  ],
  templateUrl: './product-panel-page.html',
  styleUrl: './product-panel-page.scss',
})
export class ProductPanelPage implements OnInit, OnDestroy {
  product: ProductSchema | undefined;
  idProduct: string | undefined;
  catalogPath: string | undefined;
  loading = true;
  ref: DynamicDialogRef | undefined;
  attemptDelete = false;
  togglingPrimary = false;
  /** Copia editable; `product` de Apollo es inmutable en `isPrimary`. */
  isPrimaryToggle = false;
  private _programmaticPrimaryUpdate = false;
  ratings: ProductRatingSchema[] = [];
  page = 1;
  loadingRatings = false;
  rates: BcvOfficialRatesSchema;
  productUrl: string;

  readonly colorsVariations = BASIC_COLORS;
  readonly DiscountTypeEnum = DiscountTypeEnum;

  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _ratingService = inject(RatingPublicService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _utils = inject(UtilsService);
  private readonly _router = inject(Router);
  private readonly _dialogService = inject(DialogService);
  private readonly _ratesService = inject(RatesPrivateService);
  private readonly _subscription = new Subscription();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    this.idProduct = this._activatedRoute.snapshot.params['idProduct'];
    if (this.idProduct) {
      this.loadProduct();
      this.loadRatings();
      this.getRates();
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  get productImage(): string | undefined {
    return this.product?.productFiles?.[0]?.file?.url ?? undefined;
  }

  get totalStock(): number {
    return (
      this.product?.skus?.reduce((acc, sku) => acc + (sku.quantity ?? 0), 0) ??
      0
    );
  }

  // get ratingsCount(): number {
  //   return this.product?.ratings?.length ?? 0;
  // }

  get appliedProductDiscount(): DiscountSchema | undefined {
    const d = this.product?.discountProduct?.discount;
    return d as DiscountSchema | undefined;
  }

  discountTypeLabelKey(discountType: DiscountTypeEnum): string {
    return discountType === DiscountTypeEnum.PERCENTAGE
      ? 'general.discountTypePercentage'
      : 'general.discountTypeFixed';
  }

  private canComputeDiscountedPrice(
    sku: ProductSkuSchema,
    discount: DiscountSchema,
  ): boolean {
    if (discount.discountType !== DiscountTypeEnum.FIXED) return true;
    if (sku.idCurrency === discount.idCurrency) return true;
    return !!this.rates;
  }

  getSkuDiscountedPrice(sku: ProductSkuSchema): number | null {
    const discount = this.appliedProductDiscount;
    if (!discount || sku.price == null) return null;
    if (!this.canComputeDiscountedPrice(sku, discount)) return null;
    return this._utils.formatPriceWithDiscount(sku, discount, this.rates);
  }

  skuShowsDiscountedPrice(sku: ProductSkuSchema): boolean {
    const discounted = this.getSkuDiscountedPrice(sku);
    const original = sku.price;
    if (discounted == null || original == null) return false;
    return Math.round(discounted * 100) < Math.round(original * 100);
  }

  getSkuVariationLabel(sku: ProductSkuSchema): string {
    const options = Object.values(sku.variationOptions ?? {});
    if (!options.length) return sku.skuCode;
    return (
      options
        .map((option) => {
          const colorKey = this.colorsVariations.find(
            (c) => c.value === option,
          )?.name;
          return colorKey
            ? this._translate.instant(colorKey)
            : String(option ?? '');
        })
        .join(', ') || sku.skuCode
    );
  }

  goBack(): void {
    void this._router.navigate(['..'], { relativeTo: this._activatedRoute });
  }

  navigateToEdit(): void {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.catalogs,
      this.catalogPath,
      this.idProduct,
      AppConfigService.config.routes.edit,
    ]);
  }

  navigateToInventory(): void {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.catalogs,
      this.catalogPath,
      this.idProduct,
      AppConfigService.config.routes.inventory,
    ]);
  }

  private loadProduct(): void {
    this.loading = true;
    this._subscription.add(
      this._productService.findOneProduct(Number(this.idProduct)).subscribe({
        next: (product) => {
          this.product = product;
          this.isPrimaryToggle = product.isPrimary;
          this.loading = false;
          this.productUrl = `/${this.product.business?.path}/${this.product.catalog?.path}/${this.product.id}`;
          this._cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant('general.errorLoadingData'),
          });
          this._cdr.markForCheck();
        },
      }),
    );
  }

  private loadRatings(): void {
    if (this.loadingRatings) return;
    this.loadingRatings = true;

    this._subscription.add(
      this._ratingService
        .productRatings(Number(this.idProduct), { page: this.page, limit: 10 })
        .subscribe({
          next: (ratings) => {
            this.ratings = [...this.ratings, ...ratings.items];
            this.loadingRatings = false;
          },
          error: (error) => {
            console.error(error);
            this.loadingRatings = false;
          },
          complete: () => {
            this.loadingRatings = false;
          },
        }),
    );
  }

  deleteProduct(): void {
    this.ref = this._dialogService.open(ConfirmationModal, {
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        message: this._translate.instant(
          'confirmation.areYouSureYouWantToDeleteThisProduct',
        ),
        color: 'danger',
      },
      modal: true,
      draggable: false,
      resizable: false,
    });

    this.ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          const id = this.product.id;
          if (this.attemptDelete) return;
          this.attemptDelete = true;
          this._subscription.add(
            this._productService.removeProduct(id).subscribe({
              next: () => {
                this.attemptDelete = false;
                this._messageService.add({
                  severity: 'success',
                  summary: this._translate.instant('general.success'),
                  detail: this._translate.instant(
                    'toast.productDeletedSuccessfully',
                  ),
                  life: 3000,
                });
                this._utils.navigate([
                  AppConfigService.config.routes.dashboard,
                  AppConfigService.config.routes.catalogs,
                  this.catalogPath,
                ]);
              },
              error: (error) => {
                console.error(error);
                this.attemptDelete = false;
              },
            }),
          );
        }
      });
  }

  getRates(): void {
    this._subscription.add(
      this._ratesService.findBcvOfficialRates().subscribe({
        next: (rates) => {
          this.rates = rates;
        },
      }),
    );
  }

  onIsPrimaryToggle(newValue: boolean): void {
    if (
      !this.product ||
      this.togglingPrimary ||
      this._programmaticPrimaryUpdate
    ) {
      return;
    }
    const id = this.product.id;
    const previousValue = !newValue;
    this.togglingPrimary = true;
    this._subscription.add(
      this._productService.toggleProductIsPrimary(id).subscribe({
        next: (updated) => {
          this.setProductIsPrimary(updated.isPrimary);
          this.togglingPrimary = false;
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant(
              updated.isPrimary
                ? 'toast.primaryProductAdded'
                : 'toast.primaryProductRemoved',
            ),
            life: 3000,
          });
          this._cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this.setProductIsPrimary(previousValue);
          this.togglingPrimary = false;
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant(
              'general.errorTogglingPrimaryProduct',
            ),
          });
          this._cdr.markForCheck();
        },
      }),
    );
  }

  private setProductIsPrimary(value: boolean): void {
    if (!this.product) return;
    this._programmaticPrimaryUpdate = true;
    this.product = { ...this.product, isPrimary: value };
    this.isPrimaryToggle = value;
    this._programmaticPrimaryUpdate = false;
  }
}
