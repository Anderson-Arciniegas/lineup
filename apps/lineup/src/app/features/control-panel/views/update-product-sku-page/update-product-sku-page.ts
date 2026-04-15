import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BASIC_COLORS,
  BASIC_SIZES,
  UpdateProductSkuItemInput,
  UtilsService,
} from '@lineup/core';
import { Button, ProductBreadcrumb } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BusinessSchema } from 'libs/shared/core/src/lib/schemas/business.schema';
import { ProductSchema } from 'libs/shared/core/src/lib/schemas/product.schema';
import { BusinessPrivateService } from 'libs/shared/core/src/lib/services/private/business-private.service';
import { CatalogPrivateService } from 'libs/shared/core/src/lib/services/private/catalog-private.service';
import { CurrencyPrivateService } from 'libs/shared/core/src/lib/services/private/currency-private.service';
import { ProductPrivateService } from 'libs/shared/core/src/lib/services/private/product-private.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin, Subscription } from 'rxjs';

/**
 * Edición masiva de SKUs de un producto: variaciones color/talla, precios por moneda,
 * stock y envío batch al servicio privado de producto.
 */
@Component({
  selector: 'app-update-product-sku-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    InputTextModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    MultiSelectModule,
    Button,
    PanelModule,
    MenuModule,
    ChipModule,
    ReactiveFormsModule,
    ProgressSpinner,
    SelectModule,
    InputNumberModule,
  ],
  templateUrl: './update-product-sku-page.html',
  styleUrl: './update-product-sku-page.scss',
})
export class UpdateProductSkuPage implements OnInit {
  skuProductForm: FormGroup;
  business: BusinessSchema | undefined;
  product: ProductSchema | undefined;
  idProduct: string | undefined;
  path: string;
  catalogPath: string | undefined;
  attempt = false;
  isSubmitting = false;
  image: string | undefined;
  currencies: {
    id: number;
    name?: string;
    icon?: string;
    code?: string;
    status?: string;
  }[] = [
    { name: 'general.noPrice', icon: 'pi pi-ban', id: 0 },
    { icon: 'pi pi-dollar', id: 1 },
    { icon: 'pi pi-money-bill', id: 2 },
    { icon: 'pi pi-euro', id: 3 },
  ];
  readonly colorsVariations = BASIC_COLORS;
  readonly sizesVariations = BASIC_SIZES;

  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _currencyService = inject(CurrencyPrivateService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _utils = inject(UtilsService);
  private readonly _messageService = inject(MessageService);
  private readonly _subscription = new Subscription();

  constructor() {
    this.skuProductForm = this._formBuilder.group({
      general: this._formBuilder.group({
        idCurrency: [null],
        price: [null, [Validators.min(0)]],
      }),
      skus: this._formBuilder.array([]),
    });
  }

  get generalFormGroup(): FormGroup {
    return this.skuProductForm.get('general') as FormGroup;
  }

  get skusFormArray(): FormArray {
    return this.skuProductForm.get('skus') as FormArray;
  }

  applyGeneralToAllSkus(): void {
    const general = this.generalFormGroup.getRawValue();
    const idCurrency = general.idCurrency ?? null;
    const price = general.price != null ? Number(general.price) : null;

    this.skusFormArray.controls.forEach((control) => {
      const group = control as FormGroup;
      const patch: { idCurrency?: number | null; price?: number | null } = {};
      if (idCurrency != null) patch.idCurrency = idCurrency;
      if (price != null) patch.price = price;
      group.patchValue(patch, { emitEvent: true });
    });
    this._cdr.markForCheck();
  }

  ngOnInit(): void {
    this.idProduct = this._activatedRoute.snapshot.params['idProduct'];
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];

    if (this.idProduct) {
      this.loadProductAndCurrencies();
    }
  }

  private loadProductAndCurrencies(): void {
    if (!this.idProduct || this.attempt) return;
    this.attempt = true;

    this._subscription.add(
      forkJoin({
        product: this._productService.findOneProduct(Number(this.idProduct)),
        currencies: this._currencyService.findAllCurrencies(),
      }).subscribe({
        next: ({ product, currencies }) => {
          this.product = product;
          this.business = product.business;
          this.image = product.productFiles?.[0]?.file?.url ?? undefined;
          this.currencies = this.currencies.map((currency) => {
            const currencyFound = currencies.find(
              (c) => Number(c.id) === Number(currency.id),
            );
            if (currencyFound) {
              currency = {
                ...currency,
                code: currencyFound?.code,
                name: currencyFound?.name,
                status: currencyFound?.status,
              };
            }
            return currency;
          });
          this.buildSkusFormArray();
          this._cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant('general.errorLoadingData'),
          });
        },
        complete: () => {
          this.attempt = false;
        },
      }),
    );
  }

  private buildSkusFormArray(): void {
    const skus = this.product?.skus ?? [];
    this.skusFormArray.clear();

    skus.forEach((sku) => {
      const group = this._formBuilder.group({
        id: [sku.id, Validators.required],
        idCurrency: [sku.idCurrency ?? null],
        price: [sku.price ?? null, [Validators.min(0)]],
        quantity: [sku.quantity ?? null, [Validators.min(0)]],
      });
      this.skusFormArray.push(group);
    });
  }

  updateProductSku(): void {
    if (this.skuProductForm.invalid || this.isSubmitting) return;

    const skus: UpdateProductSkuItemInput[] = this.skusFormArray.controls
      .map((control) => {
        const value = (control as FormGroup).getRawValue();
        return {
          id: value.id,
          idCurrency: value.idCurrency ?? undefined,
          price: value.price != null ? Number(value.price) : undefined,
          quantity: value.quantity != null ? Number(value.quantity) : undefined,
        };
      })
      .filter((item) => item.id != null);

    if (skus.length === 0) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('general.noSkusToUpdate'),
      });
      return;
    }

    this.isSubmitting = true;
    this._subscription.add(
      this._productService.updateProductSkus({ skus }).subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant('toast.productInventoryUpdated'),
          });
          this.loadProductAndCurrencies();
        },
        error: (error) => {
          console.error(error);
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail:
              error?.message ??
              this._translate.instant('general.errorUpdatingData'),
          });
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
          this._cdr.markForCheck();
        },
      }),
    );
  }

  getSkuOptions(i: number): string {
    const options = Object.values(
      this.product?.skus?.[i]?.variationOptions ?? {},
    );
    return (
      options
        .map((option) => {
          const translationKey = this.getColor(option as string);
          if (translationKey != null && translationKey !== '') {
            return this._translate.instant(translationKey);
          }
          return String(option ?? '');
        })
        .join(', ') ?? ''
    );
  }

  getColor(option: string): string {
    return this.colorsVariations.find((c) => c.value === option)?.name ?? null;
  }
}
