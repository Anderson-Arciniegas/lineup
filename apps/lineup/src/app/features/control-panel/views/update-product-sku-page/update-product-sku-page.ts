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
  AppConfigService,
  BASIC_COLORS,
  BASIC_SIZES,
  StorageService,
  UpdateProductSkuItemInput,
  UtilsService,
} from '@lineup/core';
import { Button, ConfirmationModal, ProductBreadcrumb } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BusinessSchema } from 'libs/shared/core/src/lib/schemas/business.schema';
import { ProductSchema } from 'libs/shared/core/src/lib/schemas/product.schema';
import { BusinessPrivateService } from 'libs/shared/core/src/lib/services/private/business-private.service';
import { CatalogPrivateService } from 'libs/shared/core/src/lib/services/private/catalog-private.service';
import { CurrencyPrivateService } from 'libs/shared/core/src/lib/services/private/currency-private.service';
import { ProductPrivateService } from 'libs/shared/core/src/lib/services/private/product-private.service';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
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
import { forkJoin, Subscription, take } from 'rxjs';
import { getMinValueFieldError } from '../../../auth/utils/form-field-error';

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
export class UpdateProductSkuPage implements OnInit, OnDestroy {
  skuProductForm: FormGroup;
  business: BusinessSchema | undefined;
  product: ProductSchema | undefined;
  idProduct: string | undefined;
  path: string;
  catalogPath: string | undefined;
  attempt = false;
  isSubmitting = false;
  loadErrorKey: string | null = null;
  minValueError = getMinValueFieldError;
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
  private readonly _storage = inject(StorageService);
  private readonly _messageService = inject(MessageService);
  private readonly _dialogService = inject(DialogService);
  private readonly _subscription = new Subscription();
  private _skuCurrencySub = new Subscription();
  private readonly destroyRef = inject(DestroyRef);

  private static readonly BUSINESS_ONBOARDING_PENDING_KEY =
    'businessOnboardingPending';
  private static readonly NO_PRICE_CURRENCY_ID = 0;

  constructor() {
    this.skuProductForm = this._formBuilder.group({
      general: this._formBuilder.group({
        idCurrency: [null],
        price: [null, [Validators.min(0)]],
      }),
      skus: this._formBuilder.array([]),
    });
    this.bindCurrencyPriceSync(this.generalFormGroup, this._subscription, {
      requirePrice: false,
    });
  }

  ngOnDestroy(): void {
    this._skuCurrencySub.unsubscribe();
    this._subscription.unsubscribe();
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
    const isNoPrice =
      idCurrency === UpdateProductSkuPage.NO_PRICE_CURRENCY_ID;
    const price = isNoPrice
      ? null
      : general.price != null
        ? Number(general.price)
        : null;

    this.skusFormArray.controls.forEach((control) => {
      const group = control as FormGroup;
      if (!isNoPrice) {
        group.get('price')?.enable({ emitEvent: false });
      }
      const patch: { idCurrency?: number | null; price?: number | null } = {};
      if (idCurrency != null) patch.idCurrency = idCurrency;
      if (isNoPrice || price != null) patch.price = price;
      group.patchValue(patch, { emitEvent: true });
      this.syncPriceWithCurrency(group, {
        requirePrice: true,
        revealEmptyError: true,
      });
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
    this.loadErrorKey = null;

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
          this.skuProductForm.markAsPristine();
          this._cdr.markForCheck();
        },
        error: () => {
          this.attempt = false;
          this.loadErrorKey = 'errors.loadFailed';
        },
        complete: () => {
          this.attempt = false;
        },
      }),
    );
  }

  retryLoad(): void {
    this.loadProductAndCurrencies();
  }

  private buildSkusFormArray(): void {
    this._skuCurrencySub.unsubscribe();
    this._skuCurrencySub = new Subscription();

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
      this.bindCurrencyPriceSync(group, this._skuCurrencySub, {
        requirePrice: true,
      });
    });
  }

  /**
   * «Sin precio» deja el monto en null y lo deshabilita. En variaciones, cualquier
   * otra moneda exige un monto y muestra el error si el input queda vacío.
   */
  private bindCurrencyPriceSync(
    group: FormGroup,
    subscription: Subscription,
    options: { requirePrice: boolean },
  ): void {
    const currencyControl = group.get('idCurrency');
    if (!currencyControl) return;

    this.syncPriceWithCurrency(group, {
      requirePrice: options.requirePrice,
      revealEmptyError:
        options.requirePrice && this.hasPricedCurrency(currencyControl.value),
    });

    subscription.add(
      currencyControl.valueChanges.subscribe(() => {
        this.syncPriceWithCurrency(group, {
          requirePrice: options.requirePrice,
          revealEmptyError: options.requirePrice,
        });
        this._cdr.markForCheck();
      }),
    );
  }

  private syncPriceWithCurrency(
    group: FormGroup,
    options: { requirePrice: boolean; revealEmptyError: boolean },
  ): void {
    const priceControl = group.get('price');
    if (!priceControl) return;

    const currencyId = group.get('idCurrency')?.value;
    const isNoPrice = currencyId === UpdateProductSkuPage.NO_PRICE_CURRENCY_ID;

    if (isNoPrice) {
      priceControl.setValue(null, { emitEvent: false });
      priceControl.setValidators([Validators.min(0)]);
      priceControl.disable({ emitEvent: false });
      priceControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    priceControl.enable({ emitEvent: false });
    if (options.requirePrice && this.hasPricedCurrency(currencyId)) {
      priceControl.setValidators([Validators.required, Validators.min(0)]);
    } else {
      priceControl.setValidators([Validators.min(0)]);
    }
    priceControl.updateValueAndValidity({ emitEvent: false });

    if (
      options.revealEmptyError &&
      this.hasPricedCurrency(currencyId) &&
      this.isPriceEmpty(priceControl.value)
    ) {
      priceControl.markAsTouched();
      priceControl.markAsDirty();
    }
  }

  private hasPricedCurrency(currencyId: unknown): boolean {
    return (
      currencyId != null &&
      currencyId !== '' &&
      currencyId !== UpdateProductSkuPage.NO_PRICE_CURRENCY_ID
    );
  }

  private isPriceEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * El backend exige el par `price` + `idCurrency` juntos o ambos nulos
   * (`PriceCurrencyPairValidator` + CHECK en `product_skus`). El id 0 de
   * «Sin precio» no es una moneda: hay que enviar `null`/`null` para borrar.
   */
  private toSkuUpdateItem(value: {
    id: number;
    idCurrency: number | null;
    price: number | null;
    quantity: number | null;
  }): UpdateProductSkuItemInput {
    const item: UpdateProductSkuItemInput = { id: value.id };
    if (value.quantity != null) {
      item.quantity = Number(value.quantity);
    }

    const isNoPrice =
      value.idCurrency === UpdateProductSkuPage.NO_PRICE_CURRENCY_ID;
    if (isNoPrice) {
      item.price = null;
      item.idCurrency = null;
      return item;
    }

    if (value.idCurrency != null) {
      item.idCurrency = value.idCurrency;
    }
    if (value.price != null) {
      item.price = Number(value.price);
    }
    return item;
  }

  updateProductSku(): void {
    if (this.skuProductForm.invalid || this.isSubmitting) return;

    const skus: UpdateProductSkuItemInput[] = this.skusFormArray.controls
      .map((control) =>
        this.toSkuUpdateItem((control as FormGroup).getRawValue()),
      )
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
          this._navigateAfterInventoryUpdate();
        },
        error: () => {
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
          this._cdr.markForCheck();
        },
      }),
    );
  }

  cancel(): void {
    if (!this.skuProductForm.dirty) {
      this._navigateAfterCancel();
      return;
    }
    const ref = this._dialogService.open(ConfirmationModal, {
      width: '500px',
      style: { maxHeight: '80vh' },
      data: {
        message: this._translate.instant('confirmation.discardUnsavedChanges'),
        color: 'warn',
      },
      modal: true,
      draggable: false,
      resizable: false,
    });
    ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this._navigateAfterCancel();
        }
      });
  }

  private _navigateAfterCancel(): void {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.catalogs,
      this.catalogPath ?? '',
      this.idProduct ?? '',
    ]);
  }

  /**
   * Tras inventario: onboarding → perfil público del negocio;
   * edición normal → panel privado del producto.
   */
  private _navigateAfterInventoryUpdate(): void {
    const isOnboardingPending = !!this._storage.get(
      UpdateProductSkuPage.BUSINESS_ONBOARDING_PENDING_KEY,
    );

    if (isOnboardingPending) {
      this._storage.remove(
        UpdateProductSkuPage.BUSINESS_ONBOARDING_PENDING_KEY,
      );
      const businessPath = this.business?.path ?? this.product?.business?.path;
      if (businessPath) {
        this._utils.navigate([businessPath]);
        return;
      }
      this._utils.navigate([AppConfigService.config.routes.dashboard]);
      return;
    }

    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.catalogs,
      this.catalogPath ?? '',
      this.idProduct ?? '',
    ]);
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
