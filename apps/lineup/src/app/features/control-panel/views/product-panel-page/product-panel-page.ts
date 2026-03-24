import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  BASIC_COLORS,
  ProductPrivateService,
  ProductRatingSchema,
  ProductSchema,
  ProductSkuSchema,
  RatingPublicService,
  UtilsService,
} from '@lineup/core';
import { Button, ConfirmationModal } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-panel-page',
  imports: [
    CommonModule,
    Button,
    TranslateModule,
    ProgressSpinner,
    SkeletonModule,
    TagModule,
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
  ratings: ProductRatingSchema[] = [];
  page = 1;
  loadingRatings = false;
  readonly colorsVariations = BASIC_COLORS;

  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _ratingService = inject(RatingPublicService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _utils = inject(UtilsService);
  private readonly _location = inject(Location);
  private readonly _dialogService = inject(DialogService);
  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    this.idProduct = this._activatedRoute.snapshot.params['idProduct'];
    if (this.idProduct) {
      this.loadProduct();
      this.loadRatings();
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

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
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
    this._location.back();
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
          this.loading = false;
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
            console.log(ratings);
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

    this.ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        console.log(confirmed);
        const id = this.product.id;
        if (this.attemptDelete) return;
        this.attemptDelete = true;
        this._subscription.add(
          this._productService.removeProduct(id).subscribe({
            next: (response) => {
              console.log(response);
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
            complete: () => {
              console.log('Product deleted');
            },
          }),
        );
      }
    });
  }
}
