import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  AuthStore,
  BusinessSchema,
  CatalogPrivateService,
  CatalogSchema,
  CreateDiscountInput,
  CurrencyPrivateService,
  DiscountPrivateService,
  DiscountSchema,
  DiscountScopeEnum,
  DiscountTypeEnum,
  ProductPrivateService,
  ProductSchema,
  UpdateDiscountInput,
  UtilsService,
} from '@lineup/core';
import { Button, ProductBreadcrumb } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';

/**
 * Creación y edición de descuentos con alcance negocio/catálogo/producto,
 * validaciones de fechas, tipo porcentaje/fijo y moneda cuando aplica.
 */
@Component({
  selector: 'app-create-discount-page',
  imports: [
    CommonModule,
    ProductBreadcrumb,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    Button,
    ProgressSpinner,
  ],
  templateUrl: './create-discount-page.html',
  styleUrl: './create-discount-page.scss',
})
export class CreateDiscountPage implements OnInit, OnDestroy {
  business: BusinessSchema | undefined;
  discountForm: FormGroup;
  isSubmitting = false;
  loadingDiscount = false;
  /** Si la ruta es `.../discounts/:id/edit`, aquí va el id; si no, `null`. */
  editingDiscountId: number | null = null;

  catalogs: CatalogSchema[] = [];
  products: ProductSchema[] = [];
  currencies: { id: number; name?: string; icon?: string; code?: string }[] =
    [];

  loadingCatalogs = false;
  loadingProducts = false;

  readonly DiscountScopeEnum = DiscountScopeEnum;
  readonly DiscountTypeEnum = DiscountTypeEnum;

  readonly scopeOptions: { labelKey: string; value: DiscountScopeEnum }[] = [
    {
      labelKey: 'general.discountScopeBusiness',
      value: DiscountScopeEnum.BUSINESS,
    },
    {
      labelKey: 'general.discountScopeCatalog',
      value: DiscountScopeEnum.CATALOG,
    },
    {
      labelKey: 'general.discountScopeProduct',
      value: DiscountScopeEnum.PRODUCT,
    },
  ];

  readonly typeOptions: { labelKey: string; value: DiscountTypeEnum }[] = [
    {
      labelKey: 'general.discountTypePercentage',
      value: DiscountTypeEnum.PERCENTAGE,
    },
    { labelKey: 'general.discountTypeFixed', value: DiscountTypeEnum.FIXED },
  ];

  private readonly _authStore = inject(AuthStore);
  private readonly _route = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _discountService = inject(DiscountPrivateService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _currencyService = inject(CurrencyPrivateService);
  private readonly _utils = inject(UtilsService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _subscriptions = new Subscription();

  constructor() {
    this.discountForm = this._formBuilder.group(
      {
        scope: [DiscountScopeEnum.BUSINESS, Validators.required],
        discountType: [DiscountTypeEnum.PERCENTAGE, Validators.required],
        idCatalog: [null as number | null],
        idProduct: [null as number | null],
        idCurrency: [null as number | null],
        value: [null as number | null, [Validators.required]],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
      },
      { validators: [this.dateOrderValidator] },
    );
  }

  /**
   * Inicializa validadores según alcance y tipo de descuento, escucha cambios en catálogo
   * para cargar productos y, si la ruta incluye id, entra en modo edición.
   */
  ngOnInit(): void {
    this.business = this._authStore.business();
    this.applyScopeValidators(
      this.discountForm.get('scope')?.value ?? DiscountScopeEnum.BUSINESS,
    );
    this.applyDiscountTypeValidators(
      this.discountForm.get('discountType')?.value ??
        DiscountTypeEnum.PERCENTAGE,
    );
    this.applyValueValidators(
      this.discountForm.get('discountType')?.value ??
        DiscountTypeEnum.PERCENTAGE,
    );

    const scopeCtrl = this.discountForm.get('scope');
    if (scopeCtrl) {
      this._subscriptions.add(
        scopeCtrl.valueChanges.subscribe((scope) => {
          this.discountForm.patchValue(
            {
              idCatalog: null,
              idProduct: null,
            },
            { emitEvent: false },
          );
          this.products = [];
          this.applyScopeValidators(scope);
        }),
      );
    }

    const discountTypeCtrl = this.discountForm.get('discountType');
    if (discountTypeCtrl) {
      this._subscriptions.add(
        discountTypeCtrl.valueChanges.subscribe((t) => {
          this.applyDiscountTypeValidators(t);
          this.applyValueValidators(t);
        }),
      );
    }

    const idCatalogCtrl = this.discountForm.get('idCatalog');
    if (idCatalogCtrl) {
      this._subscriptions.add(
        idCatalogCtrl.valueChanges.subscribe((idCatalog) => {
          if (
            this.discountForm.get('scope')?.value ===
              DiscountScopeEnum.PRODUCT &&
            idCatalog != null
          ) {
            this.loadProducts(idCatalog);
          } else {
            this.products = [];
            this.discountForm.patchValue(
              { idProduct: null },
              { emitEvent: false },
            );
          }
        }),
      );
    }

    this.loadCatalogs();
    this.loadCurrencies();

    const editId = this.getEditDiscountIdFromRoute();
    if (editId != null) {
      this.loadDiscountForEdit(editId);
    }
  }

  get isEditMode(): boolean {
    return this.editingDiscountId != null;
  }

  private getEditDiscountIdFromRoute(): number | null {
    const raw = this._route.snapshot.paramMap.get('idDiscount');
    if (raw == null) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  }

  private loadDiscountForEdit(id: number): void {
    this.editingDiscountId = id;
    this.loadingDiscount = true;
    this._subscriptions.add(
      this._discountService.findOneDiscount(id).subscribe({
        next: (d) => {
          this.applyLoadedDiscount(d, () => {
            this.loadingDiscount = false;
          });
        },
        error: () => {
          this.loadingDiscount = false;
          this.editingDiscountId = null;
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant('general.errorLoadingData'),
          });
        },
      }),
    );
  }

  /**
   * Rellena el formulario con el descuento. El API de actualización no permite
   * cambiar ámbito ni catálogo/producto; esos controles se deshabilitan en modo edición.
   */
  private applyLoadedDiscount(d: DiscountSchema, done: () => void): void {
    const idCatalog =
      d.scope === DiscountScopeEnum.BUSINESS
        ? null
        : (d.idCatalog ?? d.catalog?.id ?? null);
    const idProduct =
      d.scope === DiscountScopeEnum.PRODUCT
        ? (d.discountProducts?.[0]?.idProduct ?? null)
        : null;

    this.applyScopeValidators(d.scope);
    this.applyDiscountTypeValidators(d.discountType);
    this.applyValueValidators(d.discountType);

    const patch = {
      scope: d.scope,
      discountType: d.discountType,
      idCatalog,
      idProduct,
      idCurrency:
        d.discountType === DiscountTypeEnum.FIXED
          ? (d.idCurrency ?? null)
          : null,
      value: d.value,
      startDate: this.toDateInputValue(d.startDate),
      endDate: this.toDateInputValue(d.endDate),
    };

    const runFinish = (): void => {
      this.discountForm.patchValue(patch, { emitEvent: false });
      this.disableImmutableFieldsInEditMode();
      done();
    };

    if (d.scope === DiscountScopeEnum.PRODUCT && idCatalog != null) {
      this.loadingProducts = true;
      this._subscriptions.add(
        this._productService
          .getAllByCatalogPaginated(idCatalog, { page: 1, limit: 500 })
          .subscribe({
            next: (res) => {
              this.products = res.items ?? [];
              this.loadingProducts = false;
              runFinish();
            },
            error: () => {
              this.loadingProducts = false;
              this.products = [];
              this._messageService.add({
                severity: 'error',
                summary: this._translate.instant('general.error'),
                detail: this._translate.instant('general.errorLoadingData'),
              });
              runFinish();
            },
          }),
      );
    } else {
      runFinish();
    }
  }

  private disableImmutableFieldsInEditMode(): void {
    if (this.editingDiscountId == null) return;
    this.discountForm.get('scope')?.disable({ emitEvent: false });
    this.discountForm.get('idCatalog')?.disable({ emitEvent: false });
    this.discountForm.get('idProduct')?.disable({ emitEvent: false });
  }

  private toDateInputValue(iso: string): string {
    return new Date(iso).toISOString().slice(0, 10);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private dateOrderValidator: ValidatorFn = (
    group: AbstractControl,
  ): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;
    const a = new Date(start);
    const b = new Date(end);
    if (a.getTime() > b.getTime()) {
      return { dateOrder: true };
    }
    return null;
  };

  private applyScopeValidators(scope: DiscountScopeEnum): void {
    const idCatalog = this.discountForm.get('idCatalog');
    const idProduct = this.discountForm.get('idProduct');
    idCatalog?.clearValidators();
    idProduct?.clearValidators();

    if (scope === DiscountScopeEnum.CATALOG) {
      idCatalog?.setValidators([Validators.required]);
    } else if (scope === DiscountScopeEnum.PRODUCT) {
      idCatalog?.setValidators([Validators.required]);
      idProduct?.setValidators([Validators.required]);
    }

    idCatalog?.updateValueAndValidity({ emitEvent: false });
    idProduct?.updateValueAndValidity({ emitEvent: false });
  }

  private applyDiscountTypeValidators(discountType: DiscountTypeEnum): void {
    const idCurrency = this.discountForm.get('idCurrency');
    idCurrency?.clearValidators();
    if (discountType === DiscountTypeEnum.FIXED) {
      idCurrency?.setValidators([Validators.required]);
    }
    idCurrency?.updateValueAndValidity({ emitEvent: false });
  }

  private applyValueValidators(discountType: DiscountTypeEnum): void {
    const valueCtrl = this.discountForm.get('value');
    valueCtrl?.clearValidators();
    if (discountType === DiscountTypeEnum.PERCENTAGE) {
      valueCtrl?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(100),
      ]);
    } else {
      valueCtrl?.setValidators([Validators.required, Validators.min(0.01)]);
    }
    valueCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private loadCatalogs(): void {
    this.loadingCatalogs = true;
    this._subscriptions.add(
      this._catalogService
        .findAllMyCatalogs({ page: 1, limit: 200 })
        .subscribe({
          next: (res) => {
            this.catalogs = res.items ?? [];
            this.loadingCatalogs = false;
          },
          error: () => {
            this.loadingCatalogs = false;
            this._messageService.add({
              severity: 'error',
              summary: this._translate.instant('general.error'),
              detail: this._translate.instant('general.errorLoadingData'),
            });
          },
        }),
    );
  }

  private loadProducts(idCatalog: number): void {
    this.loadingProducts = true;
    this.discountForm.patchValue({ idProduct: null }, { emitEvent: false });
    this._subscriptions.add(
      this._productService
        .getAllByCatalogPaginated(idCatalog, { page: 1, limit: 500 })
        .subscribe({
          next: (res) => {
            this.products = res.items ?? [];
            this.loadingProducts = false;
          },
          error: () => {
            this.loadingProducts = false;
            this.products = [];
            this._messageService.add({
              severity: 'error',
              summary: this._translate.instant('general.error'),
              detail: this._translate.instant('general.errorLoadingData'),
            });
          },
        }),
    );
  }

  private loadCurrencies(): void {
    this._subscriptions.add(
      this._currencyService.findAllCurrencies().subscribe({
        next: (list) => {
          this.currencies = (list ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            icon: 'pi pi-money-bill',
          }));
        },
        error: () => {
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant('general.errorLoadingData'),
          });
        },
      }),
    );
  }

  get showCatalogField(): boolean {
    const s = this.discountForm.get('scope')?.value;
    return s === DiscountScopeEnum.CATALOG || s === DiscountScopeEnum.PRODUCT;
  }

  get showProductField(): boolean {
    return this.discountForm.get('scope')?.value === DiscountScopeEnum.PRODUCT;
  }

  get showCurrencyField(): boolean {
    return (
      this.discountForm.get('discountType')?.value === DiscountTypeEnum.FIXED
    );
  }

  private toIsoStart(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
  }

  private toIsoEnd(dateStr: string): string {
    return new Date(`${dateStr}T23:59:59.999Z`).toISOString();
  }

  submit(): void {
    if (this.discountForm.invalid) {
      this.discountForm.markAllAsTouched();
      return;
    }
    if (this.isSubmitting) return;

    const raw = this.discountForm.getRawValue() as {
      scope: DiscountScopeEnum;
      discountType: DiscountTypeEnum;
      idCatalog: number | null;
      idProduct: number | null;
      idCurrency: number | null;
      value: number;
      startDate: string;
      endDate: string;
    };

    const data: CreateDiscountInput = {
      scope: raw.scope,
      discountType: raw.discountType,
      value: Number(raw.value),
      startDate: this.toIsoStart(raw.startDate),
      endDate: this.toIsoEnd(raw.endDate),
    };

    if (raw.scope === DiscountScopeEnum.CATALOG && raw.idCatalog != null) {
      data.idCatalog = raw.idCatalog;
    }
    if (raw.scope === DiscountScopeEnum.PRODUCT && raw.idProduct != null) {
      data.idProduct = raw.idProduct;
    }
    if (raw.discountType === DiscountTypeEnum.FIXED && raw.idCurrency != null) {
      data.idCurrency = raw.idCurrency;
    }

    this.isSubmitting = true;

    if (this.editingDiscountId != null) {
      const updatePayload: UpdateDiscountInput = {
        id: this.editingDiscountId,
        discountType: raw.discountType,
        value: Number(raw.value),
        startDate: this.toIsoStart(raw.startDate),
        endDate: this.toIsoEnd(raw.endDate),
      };
      if (raw.discountType === DiscountTypeEnum.FIXED && raw.idCurrency != null) {
        updatePayload.idCurrency = raw.idCurrency;
      }
      this._subscriptions.add(
        this._discountService.updateDiscount(updatePayload).subscribe({
          next: () => {
            this.isSubmitting = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('general.discountUpdated'),
            });
            this._utils.navigate([
              AppConfigService.config.routes.dashboard,
              AppConfigService.config.routes.discounts,
            ]);
          },
          error: (err: { message?: string }) => {
            this.isSubmitting = false;
            this._messageService.add({
              severity: 'error',
              summary: this._translate.instant('general.error'),
              detail:
                err?.message ??
                this._translate.instant('general.errorUpdatingDiscount'),
            });
          },
        }),
      );
      return;
    }

    this._subscriptions.add(
      this._discountService.createDiscount(data).subscribe({
        next: () => {
          this.isSubmitting = false;
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant('general.discountCreated'),
          });
          this._utils.navigate([
            AppConfigService.config.routes.dashboard,
            AppConfigService.config.routes.discounts,
          ]);
        },
        error: (err: { message?: string }) => {
          this.isSubmitting = false;
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail:
              err?.message ??
              this._translate.instant('general.errorCreatingDiscount'),
          });
        },
      }),
    );
  }

  cancel(): void {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.discounts,
    ]);
  }
}
