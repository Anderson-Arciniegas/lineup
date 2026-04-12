import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AppConfigService,
  AuthStore,
  BASIC_COLORS,
  BASIC_SIZES,
  BcvOfficialRatesSchema,
  BusinessSchema,
  CatalogPrivateService,
  CatalogSchema,
  DiscountSchema,
  DiscountTypeEnum,
  ProductPrivateService,
  ProductSchema,
  ProductSkuSchema,
  RatesPrivateService,
  SalesInput,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import {
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';

/** Línea de venta por SKU dentro de un producto del carrito */
export interface SaleCartSkuLine {
  idProductSku: number | null;
  quantity: number;
}

/** Entrada del carrito: un producto y sus líneas por SKU */
export interface SaleCartEntry {
  productId: number;
  product: ProductSchema;
  lines: SaleCartSkuLine[];
}

/**
 * Punto de venta interno: selección de catálogo/producto/SKU, carrito multi-línea,
 * tipos de cambio BCV y envío del payload de venta al backend.
 */
@Component({
  selector: 'app-register-sale-page',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PanelModule,
    ProgressSpinner,
    SelectModule,
    IconField,
    InputIcon,
    InputTextModule,
    InputNumberModule,
    Button,
  ],
  templateUrl: './register-sale-page.html',
  styleUrl: './register-sale-page.scss',
})
export class RegisterSalePage implements OnInit, OnDestroy {
  business: BusinessSchema;
  catalogs: CatalogSchema[] = [];
  products: ProductSchema[] = [];
  selectedCatalogId: number | null = null;
  searchText = '';
  loadingCatalogs = false;
  loadingProducts = false;
  submittingSale = false;
  cart: SaleCartEntry[] = [];
  readonly colorsVariations = BASIC_COLORS;
  readonly sizesVariations = BASIC_SIZES;
  rates: BcvOfficialRatesSchema | undefined;
  readonly DiscountTypeEnum = DiscountTypeEnum;

  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _ratesService = inject(RatesPrivateService);
  private readonly _utils = inject(UtilsService);
  private readonly _subscriptions = new Subscription();
  /** Incluye catalogId para que distinctUntilChanged no bloquee la recarga al cambiar de catálogo con el mismo término. */
  private readonly _productLoad$ = new Subject<{
    catalogId: number;
    term: string;
  }>();

  ngOnInit(): void {
    this.business = this._authStore.business();
    this._subscriptions.add(
      this._productLoad$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(
            (a, b) => a.catalogId === b.catalogId && a.term === b.term,
          ),
          switchMap(({ catalogId, term }) => {
            if (!catalogId) {
              return of<ProductSchema[]>([]);
            }
            const trimmed = term.trim();
            if (!trimmed) {
              return this._productService
                .getAllByCatalogPaginated(catalogId, { page: 1, limit: 100 })
                .pipe(map((r) => r.items));
            }
            return this._productService
              .getAllByCatalog(catalogId, trimmed)
              .pipe(
                switchMap((list) =>
                  this.mergeByNumericProductId(catalogId, trimmed, list),
                ),
                map((list) => this.prioritizeTagMatches(list, trimmed)),
              );
          }),
        )
        .subscribe({
          next: (items) => {
            this.products = items;
            this.loadingProducts = false;
          },
          error: (error: unknown) => {
            console.error(error);
            this.loadingProducts = false;
            this.showLoadError();
          },
        }),
    );
    this.loadCatalogs();
    this.getRates();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  get selectedCatalog(): CatalogSchema | undefined {
    return this.catalogs.find((c) => c.id === this.selectedCatalogId);
  }

  navigateToInventory(product: ProductSchema): string {
    const productId = product?.id;
    if (productId == null) {
      return `/${AppConfigService.config.routes.dashboard}`;
    }
    const path =
      product.catalog?.path ??
      this.catalogs.find((c) => c.id === product.idCatalog)?.path ??
      '';
    return `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${path}/${String(productId)}/${AppConfigService.config.routes.inventory}`;
  }

  onCatalogChange(): void {
    this.products = [];
    if (!this.selectedCatalogId) {
      this.loadingProducts = false;
      return;
    }
    this.triggerProductLoad();
  }

  onSearchInput(): void {
    const catalogId = this.selectedCatalogId;
    if (!catalogId) return;
    this.loadingProducts = true;
    this._productLoad$.next({ catalogId, term: this.searchText });
  }

  trackByProduct(_: number, p: ProductSchema): number {
    return p.id;
  }

  skuLabel(sku: ProductSkuSchema): string {
    const opts = sku.variationOptions;
    if (opts && typeof opts === 'object' && Object.keys(opts).length > 0) {
      const parts = Object.entries(opts).map(
        ([k, v]) =>
          `${this._translate.instant(k)}: ${this._translate.instant(this.getOptionLabel(String(v)))}`,
      );
      return `${sku.skuCode} (${parts.join(', ')})`;
    }
    return sku.skuCode;
  }

  getOptionLabel(option: string): string {
    return (
      this.colorsVariations.find((c) => c.value === option)?.name ??
      this.sizesVariations.find((s) => s.value === option)?.name ??
      option
    );
  }

  isInCart(productId: number): boolean {
    return this.cart.some((e) => e.productId === productId);
  }

  addToCart(product: ProductSchema): void {
    if (!product) return;
    const skus =
      product.skus?.filter((s) => s.status !== StatusEnum.DELETED) ?? [];
    if (skus.length === 0) {
      this._subscriptions.add(
        this._productService.findOneProduct(product.id).subscribe({
          next: (fresh) => {
            const s =
              fresh.skus?.filter((x) => x.status !== StatusEnum.DELETED) ?? [];
            if (s.length === 0) {
              this._messageService.add({
                severity: 'warn',
                summary: this._translate.instant('general.warning'),
                detail: this._translate.instant(
                  'registerSalePage.noSkusForProduct',
                ),
                life: 4000,
              });
              return;
            }
            this.pushCartEntry(fresh, s);
          },
          error: () => {
            this._messageService.add({
              severity: 'warn',
              summary: this._translate.instant('general.warning'),
              detail: this._translate.instant(
                'registerSalePage.noSkusForProduct',
              ),
              life: 4000,
            });
          },
        }),
      );
      return;
    }
    this.pushCartEntry(product, skus);
  }

  removeCartEntry(productId: number): void {
    this.cart = this.cart.filter((e) => e.productId !== productId);
  }

  addSkuLine(entry: SaleCartEntry): void {
    const skus =
      entry.product.skus?.filter((s) => s.status !== StatusEnum.DELETED) ?? [];
    if (skus.length < 2) return;
    const idx = this.cart.findIndex((e) => e.productId === entry.productId);
    if (idx < 0) return;
    this.cart = this.cart.map((e, i) =>
      i === idx
        ? { ...e, lines: [...e.lines, { idProductSku: null, quantity: 1 }] }
        : e,
    );
  }

  removeSkuLine(entry: SaleCartEntry, index: number): void {
    const idx = this.cart.findIndex((e) => e.productId === entry.productId);
    if (idx < 0 || this.cart[idx].lines.length <= 1) return;
    this.cart = this.cart.map((e, i) =>
      i === idx ? { ...e, lines: e.lines.filter((_, j) => j !== index) } : e,
    );
  }

  availableSkusForLine(
    entry: SaleCartEntry,
    lineIndex: number,
  ): ProductSkuSchema[] {
    const skus =
      entry.product.skus?.filter((s) => s.status !== StatusEnum.DELETED) ?? [];
    const taken = new Set<number>();
    entry.lines.forEach((line, i) => {
      if (i !== lineIndex && line.idProductSku != null) {
        taken.add(line.idProductSku);
      }
    });
    return skus.filter(
      (s) => !taken.has(s.id) || s.id === entry.lines[lineIndex]?.idProductSku,
    );
  }

  registerSale(): void {
    const payload = this.buildRegisterPayload();
    if (!payload) return;

    this.submittingSale = true;
    this._subscriptions.add(
      this._productService.registerSale(payload).subscribe({
        next: () => {
          this.submittingSale = false;
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant('registerSalePage.saleRegistered'),
            life: 4000,
          });
          this.cart = [];
          // this.triggerProductLoad();
        },
        error: (error: unknown) => {
          console.error(error);
          this.submittingSale = false;
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant(
              'registerSalePage.saleRegisterError',
            ),
            life: 5000,
          });
        },
      }),
    );
  }

  stockWarning(sku: ProductSkuSchema | undefined, quantity: number): boolean {
    if (!sku || sku.quantity == null) return false;
    return quantity > sku.quantity;
  }

  findSku(
    product: ProductSchema,
    idProductSku: number | null,
  ): ProductSkuSchema | undefined {
    if (idProductSku == null) return undefined;
    return product.skus?.find((s) => s.id === idProductSku);
  }

  getProductDiscount(product: ProductSchema): DiscountSchema | undefined {
    return product.discountProduct?.discount as DiscountSchema | undefined;
  }

  private canComputeDiscountedPrice(
    sku: ProductSkuSchema,
    discount: DiscountSchema,
  ): boolean {
    if (discount.discountType !== DiscountTypeEnum.FIXED) return true;
    if (sku.idCurrency === discount.idCurrency) return true;
    return !!this.rates;
  }

  getSkuDiscountedUnitPrice(
    sku: ProductSkuSchema | undefined,
    discount: DiscountSchema | undefined,
  ): number | null {
    if (!sku || sku.price == null) return null;
    if (!discount) return sku.price;
    if (!this.canComputeDiscountedPrice(sku, discount)) return null;
    return this._utils.formatPriceWithDiscount(sku, discount, this.rates!);
  }

  skuShowsDiscountedPrice(
    sku: ProductSkuSchema | undefined,
    discount: DiscountSchema | undefined,
  ): boolean {
    const original = sku?.price;
    const discounted = this.getSkuDiscountedUnitPrice(sku, discount);
    if (original == null || discounted == null) return false;
    return Math.round(discounted * 100) < Math.round(original * 100);
  }

  lineTotals(
    entry: SaleCartEntry,
    line: SaleCartSkuLine,
  ): {
    currencyCode: string | null;
    unitOriginal: number | null;
    unitFinal: number | null;
    quantity: number;
    subtotalOriginal: number | null;
    subtotalFinal: number | null;
    discountAmount: number | null;
  } {
    const sku = this.findSku(entry.product, line.idProductSku);
    const discount = this.getProductDiscount(entry.product);
    const qty = Math.floor(Number(line.quantity));
    const quantity = Number.isFinite(qty) && qty > 0 ? qty : 0;

    const unitOriginal = sku?.price ?? null;
    const unitFinal = this.getSkuDiscountedUnitPrice(sku, discount);
    const currencyCode = sku?.currency?.code ?? null;

    const subtotalOriginal =
      unitOriginal != null ? unitOriginal * quantity : null;
    const subtotalFinal = unitFinal != null ? unitFinal * quantity : null;
    const discountAmount =
      subtotalOriginal != null && subtotalFinal != null
        ? subtotalOriginal - subtotalFinal
        : null;

    return {
      currencyCode,
      unitOriginal,
      unitFinal,
      quantity,
      subtotalOriginal,
      subtotalFinal,
      discountAmount,
    };
  }

  invoiceTotalsByCurrency(): Array<{
    currencyCode: string;
    subtotal: number;
    discount: number;
    total: number;
  }> {
    const totals = new Map<
      string,
      { subtotal: number; discount: number; total: number }
    >();

    for (const entry of this.cart) {
      for (const line of entry.lines) {
        const t = this.lineTotals(entry, line);
        if (!t.currencyCode) continue;
        if (t.subtotalFinal == null) continue;
        const prev = totals.get(t.currencyCode) ?? {
          subtotal: 0,
          discount: 0,
          total: 0,
        };
        totals.set(t.currencyCode, {
          subtotal: prev.subtotal + (t.subtotalOriginal ?? t.subtotalFinal),
          discount: prev.discount + (t.discountAmount ?? 0),
          total: prev.total + t.subtotalFinal,
        });
      }
    }

    return [...totals.entries()]
      .map(([currencyCode, t]) => ({ currencyCode, ...t }))
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode));
  }

  private pushCartEntry(
    product: ProductSchema,
    skus: ProductSkuSchema[],
  ): void {
    if (this.isInCart(product.id)) return;
    if (skus.length === 1) {
      this.cart = [
        ...this.cart,
        {
          productId: product.id,
          product,
          lines: [{ idProductSku: skus[0].id, quantity: 1 }],
        },
      ];
      return;
    }
    this.cart = [
      ...this.cart,
      {
        productId: product.id,
        product,
        lines: [{ idProductSku: null, quantity: 1 }],
      },
    ];
  }

  private buildRegisterPayload(): SalesInput | null {
    if (this.cart.length === 0) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('registerSalePage.cartEmpty'),
        life: 4000,
      });
      return null;
    }

    const sales: SalesInput['sales'] = [];
    const seenSku = new Set<number>();

    for (const entry of this.cart) {
      for (const line of entry.lines) {
        if (line.idProductSku == null) {
          this._messageService.add({
            severity: 'warn',
            summary: this._translate.instant('general.warning'),
            detail: this._translate.instant(
              'registerSalePage.selectSkuForAllLines',
              {
                product: entry.product.title,
              },
            ),
            life: 5000,
          });
          return null;
        }
        const qty = Math.floor(Number(line.quantity));
        if (!Number.isFinite(qty) || qty < 1) {
          this._messageService.add({
            severity: 'warn',
            summary: this._translate.instant('general.warning'),
            detail: this._translate.instant('registerSalePage.invalidQuantity'),
            life: 4000,
          });
          return null;
        }
        if (seenSku.has(line.idProductSku)) {
          this._messageService.add({
            severity: 'warn',
            summary: this._translate.instant('general.warning'),
            detail: this._translate.instant(
              'registerSalePage.duplicateSkuInCart',
            ),
            life: 5000,
          });
          return null;
        }
        const totals = this.lineTotals(entry, line);
        const lineTotal = totals.subtotalFinal ?? totals.subtotalOriginal;
        if (lineTotal == null) {
          this._messageService.add({
            severity: 'warn',
            summary: this._translate.instant('general.warning'),
            detail: this._translate.instant(
              'registerSalePage.missingPriceForSku',
            ),
            life: 5000,
          });
          return null;
        }
        seenSku.add(line.idProductSku);
        sales.push({
          idProductSku: line.idProductSku,
          quantity: qty,
          price: lineTotal,
        });
      }
    }

    return { sales };
  }

  private triggerProductLoad(): void {
    const catalogId = this.selectedCatalogId;
    if (!catalogId) return;
    this.loadingProducts = true;
    this._productLoad$.next({ catalogId, term: this.searchText });
  }

  private mergeByNumericProductId(
    catalogId: number,
    term: string,
    list: ProductSchema[],
  ) {
    const n = parseInt(term, 10);
    if (!Number.isFinite(n) || n <= 0 || String(n) !== term) {
      return of(list);
    }
    return this._productService.findOneProduct(n).pipe(
      map((found) => {
        if (found.idCatalog !== catalogId) return list;
        if (list.some((p) => p.id === found.id)) return list;
        return [found, ...list];
      }),
      catchError(() => of(list)),
    );
  }

  private prioritizeTagMatches(
    products: ProductSchema[],
    term: string,
  ): ProductSchema[] {
    const t = term.toLowerCase();
    const tagMatch = (p: ProductSchema) =>
      p.productTags?.some(
        (pt) =>
          pt.tag?.name?.toLowerCase().includes(t) ||
          pt.tag?.slug?.toLowerCase().includes(t),
      ) ?? false;
    return [...products].sort(
      (a, b) => Number(tagMatch(b)) - Number(tagMatch(a)),
    );
  }

  private loadCatalogs(): void {
    if (this.loadingCatalogs) return;
    this.loadingCatalogs = true;
    this._subscriptions.add(
      this._catalogService
        .findAllMyCatalogs({ page: 1, limit: 200 })
        .subscribe({
          next: (response) => {
            this.catalogs = response.items;
            this.selectedCatalogId = response.items[0]?.id ?? null;
            this.loadingCatalogs = false;
            if (this.selectedCatalogId) {
              this.triggerProductLoad();
            }
          },
          error: (error: unknown) => {
            console.error(error);
            this.loadingCatalogs = false;
            this.showLoadError();
          },
        }),
    );
  }

  private showLoadError(): void {
    this._messageService.add({
      severity: 'error',
      summary: this._translate.instant('general.error'),
      detail: this._translate.instant('general.errorLoadingData'),
      life: 4000,
    });
  }

  private getRates(): void {
    this._subscriptions.add(
      this._ratesService.findBcvOfficialRates().subscribe({
        next: (rates) => {
          this.rates = rates;
        },
        error: () => {
          // Si falla, igual podemos registrar ventas; solo afecta descuentos FIXED cross-currency.
          this.rates = undefined;
        },
      }),
    );
  }
}
