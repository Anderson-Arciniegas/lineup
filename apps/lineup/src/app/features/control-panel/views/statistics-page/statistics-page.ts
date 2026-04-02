import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CatalogStatsSchema,
  DiscountStatsSchema,
  EngagementStatsSchema,
  InventoryStatsSchema,
  LocaleDatePipe,
  ProductStatsSchema,
  StatsPrivateService,
  StockMovementTypeTranslatePipe,
  TimePeriodGranularityEnum,
  TimePeriodInput,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
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
    ProgressSpinner,
    SelectModule,
    DatePicker,
    TabsModule,
    StockMovementTypeTranslatePipe,
  ],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.scss',
})
export class StatisticsPage implements OnInit, OnDestroy {
  readonly StatisticsPeriodMode = StatisticsPeriodMode;

  /** Pestaña visible: inventario, productos, catálogos, descuentos, engagement */
  activeStatisticsTab = 'inventory';

  loading = true;
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
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _subscription = new Subscription();
  private readonly _reload$ = new Subject<void>();

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
        return { granularity: TimePeriodGranularityEnum.LAST_WEEK };
      case StatisticsPeriodMode.MONTH:
        return { granularity: TimePeriodGranularityEnum.LAST_MONTH };
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
}
