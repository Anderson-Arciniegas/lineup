import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { Subscription } from 'rxjs';

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

  readonly lowStockThreshold = 5;

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
      this._productService
        .getAllByCatalogPaginated(catalogId, { page: 1, limit: 200 })
        .subscribe({
          next: (response) => {
            this.products = response.items;
            this.loadingProducts = false;
            this.loadStockForProducts(response.items);
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
}
