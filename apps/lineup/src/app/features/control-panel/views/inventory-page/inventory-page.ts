import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AppConfigService,
  AuthStore,
  BusinessSchema,
  CatalogPrivateService,
  CatalogSchema,
  ProductPrivateService,
  ProductSchema,
  ProductSkuSchema,
  UtilsService,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import {
  forkJoin,
  from,
  of,
  Subscription,
  timer,
} from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';

/**
 * Consulta de existencias por catálogo: SKUs, umbrales de stock bajo, expansión de filas
 * y exportación CSV; enlaza con el flujo de registro de ventas.
 */
@Component({
  selector: 'app-inventory-page',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PanelModule,
    ProgressSpinner,
    SelectModule,
    Button,
  ],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.scss',
})
export class InventoryPage implements OnInit, OnDestroy {
  readonly registerSalePath = `/${AppConfigService.config.routes!.dashboard}/${AppConfigService.config.routes!.registerSale}`;

  business: BusinessSchema;
  catalogs: CatalogSchema[] = [];
  products: ProductSchema[] = [];
  selectedCatalogId: number | null = null;
  loadingCatalogs = false;
  loadingProducts = false;
  loadingStock = false;
  expandedProductIds = new Set<number>();
  downloadingCsv = false;

  readonly lowStockThreshold = 5;

  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _utils = inject(UtilsService);
  private readonly _subscriptions = new Subscription();
  private readonly _stockByProductId = new Map<number, ProductSkuSchema[]>();

  ngOnInit(): void {
    this.business = this._authStore.business();
    this.loadCatalogs();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  get selectedCatalog(): CatalogSchema | undefined {
    return this.catalogs.find(
      (catalog) => catalog.id === this.selectedCatalogId,
    );
  }

  get totalSkus(): number {
    return this.allSkus.length;
  }

  get totalUnits(): number {
    return this.allSkus.reduce(
      (sum, sku) =>
        typeof sku.quantity === 'number' ? sum + sku.quantity : sum,
      0,
    );
  }

  get stockNotRegisteredSkusCount(): number {
    return this.allSkus.filter((sku) => sku.quantity == null).length;
  }

  get lowStockSkusCount(): number {
    return this.allSkus.filter(
      (sku) =>
        typeof sku.quantity === 'number' &&
        sku.quantity > 0 &&
        sku.quantity <= this.lowStockThreshold,
    ).length;
  }

  get outOfStockSkusCount(): number {
    return this.allSkus.filter((sku) => sku.quantity === 0).length;
  }

  get healthyStockSkusCount(): number {
    return this.allSkus.filter(
      (sku) =>
        typeof sku.quantity === 'number' &&
        sku.quantity > this.lowStockThreshold,
    ).length;
  }

  navigateToInventory(productId: number): string {
    return `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${this.selectedCatalog?.path ?? ''}/${productId.toString()}/${AppConfigService.config.routes.inventory}`;
  }

  /**
   * Cantidad no informada por el API (`null` / `undefined`): no es agotado.
   */
  isSkuStockNotRegistered(quantity: number | null | undefined): boolean {
    return quantity == null;
  }

  /** Solo `0` es agotado; `null` no cuenta como agotado. */
  isSkuOutOfStock(quantity: number | null | undefined): boolean {
    return quantity === 0;
  }

  onCatalogChange(): void {
    if (!this.selectedCatalogId) {
      this.products = [];
      this._stockByProductId.clear();
      return;
    }
    this.loadProductsByCatalog(this.selectedCatalogId);
  }

  getProductSkus(productId: number): ProductSkuSchema[] {
    return this._stockByProductId.get(productId) ?? [];
  }

  isProductExpanded(productId: number): boolean {
    return this.expandedProductIds.has(productId);
  }

  toggleProductExpansion(productId: number): void {
    if (this.expandedProductIds.has(productId)) {
      this.expandedProductIds.delete(productId);
      return;
    }
    this.expandedProductIds.add(productId);
  }

  getProductTotalUnits(productId: number): number {
    return this.getProductSkus(productId).reduce(
      (sum, sku) =>
        typeof sku.quantity === 'number' ? sum + sku.quantity : sum,
      0,
    );
  }

  getProductStockNotRegisteredSkus(productId: number): number {
    return this.getProductSkus(productId).filter((sku) => sku.quantity == null)
      .length;
  }

  getProductOutOfStockSkus(productId: number): number {
    return this.getProductSkus(productId).filter((sku) => sku.quantity === 0)
      .length;
  }

  getProductLowStockSkus(productId: number): number {
    return this.getProductSkus(productId).filter(
      (sku) =>
        typeof sku.quantity === 'number' &&
        sku.quantity > 0 &&
        sku.quantity <= this.lowStockThreshold,
    ).length;
  }

  trackByCatalog(_: number, catalog: CatalogSchema): number {
    return catalog.id;
  }

  trackByProduct(_: number, product: ProductSchema): number {
    return product.id;
  }

  trackBySku(_: number, sku: ProductSkuSchema): number {
    return sku.id;
  }

  downloadCurrentCatalogCsv(): void {
    const catalog = this.selectedCatalog;
    if (!catalog || this.loadingProducts || this.loadingStock) return;

    const csv = this.buildCatalogInventoryCsv(
      catalog,
      this.products,
      this._stockByProductId,
    );
    this.triggerCsvDownload(csv, this.csvFilenameForCatalog(catalog));
    this._messageService.add({
      severity: 'success',
      summary: this._translate.instant('general.download'),
      detail: this._translate.instant('inventoryPage.csvExportDone'),
      life: 3500,
    });
  }

  downloadAllCatalogsAsCsv(): void {
    if (
      this.downloadingCsv ||
      this.catalogs.length === 0 ||
      !isPlatformBrowser(this._platformId)
    ) {
      return;
    }

    this.downloadingCsv = true;
    this._messageService.add({
      severity: 'info',
      summary: this._translate.instant('general.download'),
      detail: this._translate.instant('inventoryPage.csvExportStarted'),
      life: 2500,
    });

    const requests = this.catalogs.map((catalog) =>
      this._productService.getAllByCatalog(catalog.id).pipe(
        catchError((error: unknown) => {
          console.error(error);
          return of<ProductSchema[]>([]);
        }),
        map((products) => ({ catalog, products })),
      ),
    );

    this._subscriptions.add(
      forkJoin(requests)
        .pipe(
          concatMap((results) =>
            from(results).pipe(
              concatMap(({ catalog, products }, index) =>
                timer(index * 450).pipe(
                  tap(() => {
                    const csv = this.buildCatalogInventoryCsv(
                      catalog,
                      products,
                    );
                    this.triggerCsvDownload(csv, this.csvFilenameForCatalog(catalog));
                  }),
                ),
              ),
            ),
          ),
        )
        .subscribe({
          complete: () => {
            this.downloadingCsv = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.download'),
              detail: this._translate.instant('inventoryPage.csvExportDone'),
              life: 4000,
            });
          },
          error: (error: unknown) => {
            console.error(error);
            this.downloadingCsv = false;
            this._messageService.add({
              severity: 'error',
              summary: this._translate.instant('general.error'),
              detail: this._translate.instant('inventoryPage.csvExportError'),
              life: 5000,
            });
          },
        }),
    );
  }

  private get allSkus(): ProductSkuSchema[] {
    return this.products.flatMap(
      (product) => this._stockByProductId.get(product.id) ?? [],
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
              this.loadProductsByCatalog(this.selectedCatalogId);
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

  private loadProductsByCatalog(catalogId: number): void {
    if (this.loadingProducts) return;

    this.loadingProducts = true;
    this.loadingStock = false;
    this.products = [];
    this.expandedProductIds.clear();
    this._stockByProductId.clear();

    this._subscriptions.add(
      this._productService.getAllByCatalog(catalogId).subscribe({
        next: (response) => {
          this.products = response;
          this.loadingProducts = false;
          this.loadStockForProducts(response);
        },
        error: (error: unknown) => {
          console.error(error);
          this.loadingProducts = false;
          this.showLoadError();
        },
      }),
    );
  }

  private loadStockForProducts(products: ProductSchema[]): void {
    if (products.length === 0) {
      this.loadingStock = false;
      return;
    }

    this.loadingStock = true;
    for (const product of products) {
      this._subscriptions.add(
        this._productService.getStockByProduct(product.id).subscribe({
          next: (skus) => {
            this._stockByProductId.set(product.id, skus);
          },
          error: (error: unknown) => {
            console.error(error);
            this._stockByProductId.set(product.id, []);
          },
          complete: () => {
            const allLoaded = this.products.every((p) =>
              this._stockByProductId.has(p.id),
            );
            if (allLoaded) {
              this.loadingStock = false;
            }
          },
        }),
      );
    }
  }

  private showLoadError(): void {
    this._messageService.add({
      severity: 'error',
      summary: this._translate.instant('general.error'),
      detail: this._translate.instant('general.errorLoadingData'),
      life: 4000,
    });
  }

  private buildCatalogInventoryCsv(
    catalog: CatalogSchema,
    products: ProductSchema[],
    stockByProductId?: Map<number, ProductSkuSchema[]>,
  ): string {
    const headers = [
      'catalog_id',
      'catalog_title',
      'catalog_path',
      'product_id',
      'product_title',
      'product_price',
      'product_currency_code',
      'product_status',
      'sku_id',
      'sku_code',
      'sku_price',
      'sku_quantity',
      'sku_currency_code',
      'sku_status',
      'sku_variation_options',
    ];

    const lines: string[] = [headers.map((h) => this.csvCell(h)).join(',')];

    for (const product of products) {
      const skus = this.resolveSkus(product, stockByProductId);
      const rows = skus.length > 0 ? skus : [null];

      for (const sku of rows) {
        const base = [
          catalog.id,
          catalog.title,
          catalog.path,
          product.id,
          product.title,
          product.price ?? '',
          product.currency?.code ?? '',
          product.status,
          sku?.id ?? '',
          sku?.skuCode ?? '',
          sku?.price ?? '',
          sku?.quantity ?? '',
          sku?.currency?.code ?? '',
          sku?.status ?? '',
          sku ? this.formatSkuVariationOptions(sku.variationOptions) : '',
        ];
        lines.push(base.map((v) => this.csvCell(v)).join(','));
      }
    }

    return `\uFEFF${lines.join('\r\n')}`;
  }

  private resolveSkus(
    product: ProductSchema,
    stockByProductId?: Map<number, ProductSkuSchema[]>,
  ): ProductSkuSchema[] {
    if (stockByProductId?.has(product.id)) {
      return stockByProductId.get(product.id)!;
    }
    return product.skus ?? [];
  }

  private formatSkuVariationOptions(
    options: Record<string, unknown> | null | undefined,
  ): string {
    if (!options || typeof options !== 'object') return '';
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' | ');
  }

  private csvCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    const s = String(value);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  private csvFilenameForCatalog(catalog: CatalogSchema): string {
    const date = new Date().toISOString().slice(0, 10);
    const slug = this.safeFilenameSegment(catalog.path || catalog.title);
    return `inventario_${slug}_${date}.csv`;
  }

  private safeFilenameSegment(raw: string): string {
    const cleaned = raw
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_')
      .slice(0, 80);
    return cleaned || 'catalogo';
  }

  private triggerCsvDownload(content: string, filename: string): void {
    if (!isPlatformBrowser(this._platformId)) return;

    const doc = this._utils.document;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = doc.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
