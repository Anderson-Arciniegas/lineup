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
  ProductStatsSchema,
  StatsPrivateService,
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
    ProgressSpinner,
    SelectModule,
    DatePicker,
    TabsModule,
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

  private readonly _location = inject(Location);
  private readonly _statsService = inject(StatsPrivateService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _subscription = new Subscription();
  private readonly _reload$ = new Subject<void>();

  private static readonly TOP_LIMIT = 10;

  ngOnInit(): void {
    this.buildPeriodOptions();
    this._subscription.add(
      this._reload$
        .pipe(
          switchMap(() => {
            this.loading = true;
            this._cdr.markForCheck();
            const timePeriod = this.resolveTimePeriod();
            const discountDays = this.resolveDiscountDays();
            return forkJoin({
              engagement:
                this._statsService.businessEngagementStats(timePeriod),
              catalog: this._statsService.catalogStats(
                timePeriod,
                StatisticsPage.TOP_LIMIT,
              ),
              discount: this._statsService.discountStats(discountDays),
              inventory: this._statsService.inventoryStats(
                timePeriod,
                StatisticsPage.TOP_LIMIT,
              ),
              product: this._statsService.productStats(
                timePeriod,
                StatisticsPage.TOP_LIMIT,
              ),
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
   * Solo `granularity` para DAY / WEEK / MONTH (el backend calcula el rango).
   * Solo `startDate` y `endDate` para rango personalizado (sin granularity).
   * `null` para «Todo».
   */
  private resolveTimePeriod(): TimePeriodInput | null {
    switch (this.periodMode) {
      case StatisticsPeriodMode.ALL:
        return null;
      case StatisticsPeriodMode.DAY:
        return { granularity: TimePeriodGranularityEnum.DAY };
      case StatisticsPeriodMode.WEEK:
        return { granularity: TimePeriodGranularityEnum.WEEK };
      case StatisticsPeriodMode.MONTH:
        return { granularity: TimePeriodGranularityEnum.MONTH };
      case StatisticsPeriodMode.CUSTOM: {
        if (!this.customStartDate || !this.customEndDate) {
          return null;
        }
        const start = this.startOfDay(new Date(this.customStartDate));
        const end = this.endOfDay(new Date(this.customEndDate));
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      }
      default:
        return null;
    }
  }

  private resolveDiscountDays(): number | undefined | null {
    if (this.periodMode === StatisticsPeriodMode.ALL) {
      return null;
    }
    if (this.periodMode === StatisticsPeriodMode.CUSTOM) {
      if (!this.customStartDate || !this.customEndDate) {
        return null;
      }
      const start = this.startOfDay(new Date(this.customStartDate));
      const end = this.startOfDay(new Date(this.customEndDate));
      const diffDays =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      return Math.max(1, diffDays);
    }
    if (this.periodMode === StatisticsPeriodMode.DAY) {
      return 1;
    }
    if (this.periodMode === StatisticsPeriodMode.WEEK) {
      return 7;
    }
    if (this.periodMode === StatisticsPeriodMode.MONTH) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }
    return null;
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
}
