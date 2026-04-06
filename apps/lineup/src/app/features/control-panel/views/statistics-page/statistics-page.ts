import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BusinessSalesInTimePeriodSchema,
  CatalogStatsSchema,
  CurrencyPrivateService,
  CurrencySymbolPipe,
  DiscountStatsSchema,
  EngagementStatsSchema,
  InventoryStatsSchema,
  LocaleDatePipe,
  ProductStatsSchema,
  StatsPrivateService,
  StockMovementSchema,
  StockMovementTypeEnum,
  StockMovementTypeTranslatePipe,
  UtilsService,
  TimePeriodGranularityEnum,
  TimePeriodInput,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { forkJoin, Subject, Subscription, switchMap } from 'rxjs';

export enum StatisticsPeriodMode {
  ALL = 'ALL',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  CUSTOM = 'CUSTOM',
}

@Component({
  selector: 'app-statistics-page',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    TranslateModule,
    LocaleDatePipe,
    CurrencySymbolPipe,
    ProgressSpinner,
    SelectModule,
    DatePickerModule,
    TabsModule,
    StockMovementTypeTranslatePipe,
  ],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.scss',
})
export class StatisticsPage implements OnInit, OnDestroy {
  readonly StatisticsPeriodMode = StatisticsPeriodMode;

  /** Pestaña visible: inventario, ventas, productos, catálogos, descuentos, engagement */
  activeStatisticsTab = 'inventory';

  loading = true;
  businessSales: BusinessSalesInTimePeriodSchema | undefined;
  engagement: EngagementStatsSchema | undefined;
  catalog: CatalogStatsSchema | undefined;
  discount: DiscountStatsSchema | undefined;
  inventory: InventoryStatsSchema | undefined;
  product: ProductStatsSchema | undefined;

  periodMode: StatisticsPeriodMode = StatisticsPeriodMode.MONTH;
  periodOptions: { label: string; value: StatisticsPeriodMode }[] = [];

  customStartDate: Date | null = null;
  customEndDate: Date | null = null;

  /** PrimeNG: `dd/mm/yy` (ES) vs `mm/dd/yy` (EN). */
  get statsDatePickerFormat(): string {
    return (this._translate.currentLang ?? 'es') === 'en'
      ? 'mm/dd/yy'
      : 'dd/mm/yy';
  }

  private readonly _location = inject(Location);
  private readonly _statsService = inject(StatsPrivateService);
  private readonly _currencyService = inject(CurrencyPrivateService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _utils = inject(UtilsService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _subscription = new Subscription();
  private readonly _reload$ = new Subject<void>();

  private readonly _currencyCodeById = new Map<number, string>();

  private readonly _stockMovementTypeKeys: Record<StockMovementTypeEnum, string> =
    {
      [StockMovementTypeEnum.PURCHASE]: 'stockMovement.purchase',
      [StockMovementTypeEnum.ADJUSTMENT_IN]: 'stockMovement.adjustmentIn',
      [StockMovementTypeEnum.ADJUSTMENT_OUT]: 'stockMovement.adjustmentOut',
      [StockMovementTypeEnum.SALE]: 'stockMovement.sale',
      [StockMovementTypeEnum.REMOVAL]: 'stockMovement.removal',
    };

  /** Si `resolveTimePeriod()` es `null` (p. ej. «Todo»), todas las queries usan este periodo. */
  private static readonly DEFAULT_REQUIRED_TIME_PERIOD: TimePeriodInput = {
    granularity: TimePeriodGranularityEnum.ALL,
  };

  ngOnInit(): void {
    this.buildPeriodOptions();
    this._subscription.add(
      this._translate.onLangChange.subscribe(() => {
        this.buildPeriodOptions();
        this._cdr.markForCheck();
      }),
    );
    this._subscription.add(
      this._currencyService.findAllCurrencies().subscribe({
        next: (currencies) => {
          this._currencyCodeById.clear();
          for (const c of currencies) {
            if (c.code) {
              this._currencyCodeById.set(Number(c.id), c.code);
            }
          }
          this._cdr.markForCheck();
        },
        error: (error: unknown) => {
          console.error(error);
        },
      }),
    );
    this._subscription.add(
      this._reload$
        .pipe(
          switchMap(() => {
            this.loading = true;
            this._cdr.markForCheck();
            const timePeriod =
              this.resolveTimePeriod() ??
              StatisticsPage.DEFAULT_REQUIRED_TIME_PERIOD;
            return forkJoin({
              engagement:
                this._statsService.businessEngagementStats(timePeriod),
              catalog: this._statsService.catalogStats(timePeriod),
              discount: this._statsService.discountStats(timePeriod),
              inventory: this._statsService.inventoryStats(timePeriod),
              product: this._statsService.productStats(timePeriod),
              businessSales:
                this._statsService.businessSalesInTimePeriod(timePeriod),
            });
          }),
        )
        .subscribe({
          next: (data) => {
            this.engagement = data.engagement;
            this.catalog = data.catalog;
            this.discount = data.discount;
            this.inventory = data.inventory;
            this.product = data.product;
            this.businessSales = data.businessSales;
            this.loading = false;
            this._cdr.markForCheck();
          },
          error: (error: unknown) => {
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
    this._reload$.next();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  goBack(): void {
    this._location.back();
  }

  onPeriodModeChange(): void {
    if (this.periodMode === StatisticsPeriodMode.CUSTOM) {
      return;
    }
    this._reload$.next();
  }

  applyCustomPeriod(): void {
    if (!this.customStartDate || !this.customEndDate) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('statisticsPage.selectBothDates'),
      });
      return;
    }
    const start = this.startOfDay(new Date(this.customStartDate));
    const end = this.startOfDay(new Date(this.customEndDate));
    if (start.getTime() > end.getTime()) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('statisticsPage.invalidDateRange'),
      });
      return;
    }
    this._reload$.next();
  }

  private buildPeriodOptions(): void {
    this.periodOptions = [
      {
        label: this._translate.instant('statisticsPage.periodAll'),
        value: StatisticsPeriodMode.ALL,
      },
      {
        label: this._translate.instant('statisticsPage.periodDay'),
        value: StatisticsPeriodMode.DAY,
      },
      {
        label: this._translate.instant('statisticsPage.periodWeek'),
        value: StatisticsPeriodMode.WEEK,
      },
      {
        label: this._translate.instant('statisticsPage.periodMonth'),
        value: StatisticsPeriodMode.MONTH,
      },
      {
        label: this._translate.instant('statisticsPage.periodCustom'),
        value: StatisticsPeriodMode.CUSTOM,
      },
    ];
  }

  /**
   * `null` en «Todo» (se sustituye por `DEFAULT_REQUIRED_TIME_PERIOD` al llamar al API).
   * Granularidades alineadas con `TimePeriodGranularityEnum` del API;
   * rango personalizado con `granularity: RANGE` y fechas ISO.
   */
  private resolveTimePeriod(): TimePeriodInput | null {
    switch (this.periodMode) {
      case StatisticsPeriodMode.ALL:
        return null;
      case StatisticsPeriodMode.DAY:
        return { granularity: TimePeriodGranularityEnum.TODAY };
      case StatisticsPeriodMode.WEEK:
        return { granularity: TimePeriodGranularityEnum.THIS_WEEK };
      case StatisticsPeriodMode.MONTH:
        return { granularity: TimePeriodGranularityEnum.THIS_MONTH };
      case StatisticsPeriodMode.CUSTOM: {
        if (!this.customStartDate || !this.customEndDate) {
          return null;
        }
        const start = this.startOfDay(new Date(this.customStartDate));
        const end = this.endOfDay(new Date(this.customEndDate));
        return {
          granularity: TimePeriodGranularityEnum.RANGE,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      }
      default:
        return null;
    }
  }

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private endOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  /**
   * Alineado con `InventoryPage`: `quantity` ausente o `null` → stock no registrado (no es agotado).
   */
  isSkuStockNotRegistered(quantity: number | null | undefined): boolean {
    return quantity == null;
  }

  /** Solo cantidad `0` es agotado; `null` no cuenta como agotado. */
  isSkuOutOfStock(quantity: number | null | undefined): boolean {
    return quantity === 0;
  }

  /**
   * Código ISO de moneda para el precio de la venta: por `idCurrency` del SKU y catálogo
   * `findAllCurrencies`; si aún no hay mapa o no coincide, se usa `productSku.currency.code`.
   */
  saleCurrencyCode(sale: StockMovementSchema): string | undefined {
    const id = sale.productSku?.idCurrency;
    if (id != null) {
      const fromCatalog = this._currencyCodeById.get(Number(id));
      if (fromCatalog) {
        return fromCatalog;
      }
    }
    return sale.productSku?.currency?.code;
  }

  downloadInventoryCsv(): void {
    const inv = this.inventory;
    if (!inv) {
      this.notifyCsvEmpty();
      return;
    }
    const t = (k: string) => this._translate.instant(k);
    const lines: string[] = [];
    lines.push(
      [
        this.csvCell(t('statisticsPage.lowStockSkus')),
        this.csvCell(inv.skusLowOrOutOfStockCount ?? 0),
      ].join(','),
    );
    lines.push(
      [
        this.csvCell(t('inventoryPage.stockNotRegistered')),
        this.csvCell(inv.productsWithoutStockCount ?? 0),
      ].join(','),
    );
    lines.push('');
    lines.push(
      [
        this.csvCell('ID'),
        this.csvCell(t('general.creationDate')),
        this.csvCell(t('statisticsPage.movementDelta')),
        this.csvCell(t('statisticsPage.movementType')),
      ].join(','),
    );
    for (const mv of inv.recentStockMovements ?? []) {
      lines.push(
        [
          this.csvCell(mv.id),
          this.csvCell(mv.creationDate),
          this.csvCell(mv.quantityDelta),
          this.csvCell(this.movementTypeLabel(mv.type)),
        ].join(','),
      );
    }
    this.triggerCsvDownload(
      this.withBom(lines.join('\r\n')),
      this.csvFilename('inventory'),
    );
  }

  downloadSalesCsv(): void {
    const data = this.businessSales;
    if (!data) {
      this.notifyCsvEmpty();
      return;
    }
    const t = (k: string) => this._translate.instant(k);
    const lines: string[] = [];
    lines.push(
      [
        this.csvCell(t('statisticsPage.salesCountTotal')),
        this.csvCell(data.salesCount?.total ?? 0),
      ].join(','),
    );
    lines.push(
      [
        this.csvCell(t('statisticsPage.salesListedMovements')),
        this.csvCell(data.sales?.length ?? 0),
      ].join(','),
    );
    lines.push('');
    lines.push(
      [
        this.csvCell('ID'),
        this.csvCell(t('general.creationDate')),
        this.csvCell(t('statisticsPage.salesIdProductSkuLabel')),
        this.csvCell(t('statisticsPage.salesProductLabel')),
        this.csvCell(t('general.sku')),
        this.csvCell(t('statisticsPage.movementDelta')),
        this.csvCell(t('statisticsPage.movementType')),
        this.csvCell(t('statisticsPage.salesUnitPriceLabel')),
        this.csvCell(t('statisticsPage.salesTotalPriceLabel')),
        this.csvCell(t('statisticsPage.salesRemainingQuantity')),
        this.csvCell(t('general.currency')),
        this.csvCell(t('statisticsPage.csvNotesColumn')),
      ].join(','),
    );
    for (const sale of data.sales ?? []) {
      const title =
        sale.productSku?.product?.title ??
        sale.productSku?.skuCode ??
        t('statisticsPage.salesProductLabel');
      const sc = this.saleCurrencyCode(sale);
      lines.push(
        [
          this.csvCell(sale.id),
          this.csvCell(sale.creationDate),
          this.csvCell(sale.idProductSku),
          this.csvCell(title),
          this.csvCell(sale.productSku?.skuCode ?? ''),
          this.csvCell(sale.quantityDelta),
          this.csvCell(this.movementTypeLabel(sale.type)),
          this.csvCell(
            sale.productSku?.price != null ? sale.productSku.price : '',
          ),
          this.csvCell(sale.price != null ? sale.price : ''),
          this.csvCell(sale.newQuantity),
          this.csvCell(sc ?? ''),
          this.csvCell(sale.notes ?? ''),
        ].join(','),
      );
    }
    this.triggerCsvDownload(
      this.withBom(lines.join('\r\n')),
      this.csvFilename('sales'),
    );
  }

  downloadProductsCsv(): void {
    const p = this.product;
    if (!p) {
      this.notifyCsvEmpty();
      return;
    }
    const t = (k: string) => this._translate.instant(k);
    const lines: string[] = [];
    lines.push(
      [
        this.csvCell(t('statisticsPage.ratio')),
        this.csvCell(p.visitToLikeRatio?.ratio ?? 0),
      ].join(','),
    );
    lines.push(
      [
        this.csvCell(t('general.likes')),
        this.csvCell(p.visitToLikeRatio?.totalLikes ?? 0),
      ].join(','),
    );
    lines.push(
      [
        this.csvCell(t('general.visits')),
        this.csvCell(p.visitToLikeRatio?.totalVisits ?? 0),
      ].join(','),
    );
    lines.push(
      [
        this.csvCell(t('statisticsPage.productsWithoutRatings')),
        this.csvCell(p.withoutRatingsCount ?? 0),
      ].join(','),
    );
    lines.push(
      [
        this.csvCell(t('statisticsPage.productsWithoutVisits')),
        this.csvCell(p.withoutVisitsCount ?? 0),
      ].join(','),
    );
    lines.push('');
    lines.push(this.csvCell(t('statisticsPage.topByVisits')));
    lines.push(
      [
        this.csvCell('ID'),
        this.csvCell(t('statisticsPage.salesProductLabel')),
        this.csvCell(t('general.visits')),
      ].join(','),
    );
    for (const row of p.topByVisits ?? []) {
      lines.push(
        [
          this.csvCell(row.id),
          this.csvCell(row.title),
          this.csvCell(row.visits),
        ].join(','),
      );
    }
    lines.push('');
    lines.push(this.csvCell(t('statisticsPage.topByLikes')));
    lines.push(
      [
        this.csvCell('ID'),
        this.csvCell(t('statisticsPage.salesProductLabel')),
        this.csvCell(t('general.likes')),
      ].join(','),
    );
    for (const row of p.topByLikes ?? []) {
      lines.push(
        [
          this.csvCell(row.id),
          this.csvCell(row.title),
          this.csvCell(row.likes),
        ].join(','),
      );
    }
    lines.push('');
    lines.push(this.csvCell(t('statisticsPage.topByRating')));
    lines.push(
      [
        this.csvCell('ID'),
        this.csvCell(t('statisticsPage.salesProductLabel')),
        this.csvCell(t('statisticsPage.ratingAverageColumn')),
      ].join(','),
    );
    for (const row of p.topByRating ?? []) {
      lines.push(
        [
          this.csvCell(row.id),
          this.csvCell(row.title),
          this.csvCell(row.ratingAverage),
        ].join(','),
      );
    }
    this.triggerCsvDownload(
      this.withBom(lines.join('\r\n')),
      this.csvFilename('products'),
    );
  }

  downloadCatalogsCsv(): void {
    const c = this.catalog;
    if (!c) {
      this.notifyCsvEmpty();
      return;
    }
    const t = (k: string) => this._translate.instant(k);
    const lines: string[] = [];
    lines.push(
      [
        this.csvCell(t('statisticsPage.catalogVisitsOverTime')),
        this.csvCell(c.catalogVisitsOverTime?.total ?? 0),
      ].join(','),
    );
    lines.push('');
    lines.push(this.csvCell(t('statisticsPage.topCatalogs')));
    lines.push(
      [
        this.csvCell('ID'),
        this.csvCell(t('general.name')),
        this.csvCell(t('general.visits')),
      ].join(','),
    );
    for (const row of c.topByVisits ?? []) {
      lines.push(
        [
          this.csvCell(row.id),
          this.csvCell(row.title),
          this.csvCell(row.visits),
        ].join(','),
      );
    }
    lines.push('');
    lines.push(this.csvCell(t('statisticsPage.productsPerCatalog')));
    lines.push(
      [
        this.csvCell(t('statisticsPage.csvLabelColumn')),
        this.csvCell(t('statisticsPage.csvCountColumn')),
      ].join(','),
    );
    for (const row of c.productsPerCatalog ?? []) {
      lines.push(
        [this.csvCell(row.label), this.csvCell(row.count)].join(','),
      );
    }
    this.triggerCsvDownload(
      this.withBom(lines.join('\r\n')),
      this.csvFilename('catalogs'),
    );
  }

  downloadDiscountsCsv(): void {
    const d = this.discount;
    if (!d) {
      this.notifyCsvEmpty();
      return;
    }
    const t = (k: string) => this._translate.instant(k);
    const lines: string[] = [];
    lines.push(
      [
        this.csvCell(t('statisticsPage.expiringSoonCount')),
        this.csvCell(d.expiringSoon?.total ?? 0),
      ].join(','),
    );
    lines.push('');
    lines.push(this.csvCell(t('statisticsPage.discountByStatus')));
    lines.push(
      [
        this.csvCell(t('statisticsPage.csvLabelColumn')),
        this.csvCell(t('statisticsPage.csvCountColumn')),
      ].join(','),
    );
    for (const row of d.byStatus ?? []) {
      lines.push(
        [this.csvCell(row.label), this.csvCell(row.count)].join(','),
      );
    }
    lines.push('');
    lines.push(this.csvCell(t('statisticsPage.discountByType')));
    lines.push(
      [
        this.csvCell(t('statisticsPage.csvLabelColumn')),
        this.csvCell(t('statisticsPage.csvCountColumn')),
      ].join(','),
    );
    for (const row of d.byType ?? []) {
      lines.push(
        [this.csvCell(row.label), this.csvCell(row.count)].join(','),
      );
    }
    this.triggerCsvDownload(
      this.withBom(lines.join('\r\n')),
      this.csvFilename('discounts'),
    );
  }

  downloadEngagementCsv(): void {
    const e = this.engagement;
    if (!e) {
      this.notifyCsvEmpty();
      return;
    }
    const t = (k: string) => this._translate.instant(k);
    const lines: string[] = [
      [
        this.csvCell(t('statisticsPage.newFollowers')),
        this.csvCell(e.newFollowers?.total ?? 0),
      ].join(','),
      [
        this.csvCell(t('statisticsPage.businessVisits')),
        this.csvCell(e.visits?.visits?.total ?? 0),
      ].join(','),
      [
        this.csvCell(t('statisticsPage.visitsIdentified')),
        this.csvCell(e.visits?.visitsByAuthType?.identified ?? 0),
      ].join(','),
      [
        this.csvCell(t('statisticsPage.visitsAnonymous')),
        this.csvCell(e.visits?.visitsByAuthType?.anonymous ?? 0),
      ].join(','),
    ];
    this.triggerCsvDownload(
      this.withBom(lines.join('\r\n')),
      this.csvFilename('engagement'),
    );
  }

  private movementTypeLabel(type: StockMovementTypeEnum): string {
    const key = this._stockMovementTypeKeys[type];
    return key ? this._translate.instant(key) : String(type);
  }

  private notifyCsvEmpty(): void {
    this._messageService.add({
      severity: 'warn',
      summary: this._translate.instant('general.warning'),
      detail: this._translate.instant('statisticsPage.csvExportEmpty'),
    });
  }

  private csvCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    const s = String(value);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  private withBom(content: string): string {
    return `\uFEFF${content}`;
  }

  private csvFilename(section: string): string {
    const date = new Date().toISOString().slice(0, 10);
    return `stats_${section}_${date}.csv`;
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
