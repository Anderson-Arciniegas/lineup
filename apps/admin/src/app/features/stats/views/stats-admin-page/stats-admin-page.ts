import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  TimePeriodGranularityEnum,
  type TimePeriodInput,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { forkJoin, Subject, switchMap } from 'rxjs';
import type {
  AdminBusinessStatsSchema,
  AdminCatalogGlobalStatsSchema,
  AdminDiscountGlobalQueryInput,
  AdminDiscountGlobalStatsSchema,
  AdminPlatformEngagementStatsSchema,
  AdminUserStatsSchema,
} from '../../../../core/schemas';
import { StatsAdminService } from '../../../../core/services/stats-admin.service';

export enum AdminStatsPeriodMode {
  ALL = 'ALL',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  CUSTOM = 'CUSTOM',
}

@Component({
  selector: 'app-stats-admin-page',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SelectModule,
    DatePickerModule,
    Button,
  ],
  templateUrl: './stats-admin-page.html',
  styleUrl: './stats-admin-page.scss',
})
export class StatsAdminPage implements OnInit {
  readonly AdminStatsPeriodMode = AdminStatsPeriodMode;

  private readonly statsAdmin = inject(StatsAdminService);
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private static readonly DEFAULT_TIME_PERIOD: TimePeriodInput = {
    granularity: TimePeriodGranularityEnum.ALL,
  };

  private readonly reload$ = new Subject<void>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly bundle = signal<{
    catalog: AdminCatalogGlobalStatsSchema;
    users: AdminUserStatsSchema;
    businesses: AdminBusinessStatsSchema;
    discounts: AdminDiscountGlobalStatsSchema;
    engagement: AdminPlatformEngagementStatsSchema;
  } | null>(null);

  periodMode: AdminStatsPeriodMode = AdminStatsPeriodMode.MONTH;
  periodOptions: { label: string; value: AdminStatsPeriodMode }[] = [];

  customStartDate: Date | null = null;
  customEndDate: Date | null = null;

  get statsDatePickerFormat(): string {
    return (this.translate.currentLang ?? 'es') === 'en'
      ? 'mm/dd/yy'
      : 'dd/mm/yy';
  }

  ngOnInit(): void {
    this.buildPeriodOptions();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buildPeriodOptions());

    this.reload$
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          this.error.set(null);
          const timePeriod =
            this.resolveTimePeriod() ?? StatsAdminPage.DEFAULT_TIME_PERIOD;
          const discountQuery = this.resolveDiscountQuery();
          return forkJoin({
            catalog: this.statsAdmin.adminCatalogGlobalStats(),
            users: this.statsAdmin.adminUserStats(timePeriod),
            businesses: this.statsAdmin.adminBusinessStats(timePeriod),
            discounts: this.statsAdmin.adminDiscountGlobalStats(discountQuery),
            engagement: this.statsAdmin.adminPlatformEngagementStats(timePeriod),
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (b) => {
          this.bundle.set(b);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('admin.feature.loadError');
          this.loading.set(false);
        },
      });

    this.reload$.next();
  }

  onPeriodModeChange(): void {
    if (this.periodMode === AdminStatsPeriodMode.CUSTOM) {
      return;
    }
    this.reload$.next();
  }

  applyCustomPeriod(): void {
    if (!this.customStartDate || !this.customEndDate) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('general.warning'),
        detail: this.translate.instant('statisticsPage.selectBothDates'),
      });
      return;
    }
    const start = this.startOfDay(new Date(this.customStartDate));
    const end = this.startOfDay(new Date(this.customEndDate));
    if (start.getTime() > end.getTime()) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('general.warning'),
        detail: this.translate.instant('statisticsPage.invalidDateRange'),
      });
      return;
    }
    this.reload$.next();
  }

  private buildPeriodOptions(): void {
    this.periodOptions = [
      {
        label: this.translate.instant('statisticsPage.periodAll'),
        value: AdminStatsPeriodMode.ALL,
      },
      {
        label: this.translate.instant('statisticsPage.periodDay'),
        value: AdminStatsPeriodMode.DAY,
      },
      {
        label: this.translate.instant('statisticsPage.periodWeek'),
        value: AdminStatsPeriodMode.WEEK,
      },
      {
        label: this.translate.instant('statisticsPage.periodMonth'),
        value: AdminStatsPeriodMode.MONTH,
      },
      {
        label: this.translate.instant('statisticsPage.periodCustom'),
        value: AdminStatsPeriodMode.CUSTOM,
      },
    ];
  }

  private resolveTimePeriod(): TimePeriodInput | null {
    switch (this.periodMode) {
      case AdminStatsPeriodMode.ALL:
        return null;
      case AdminStatsPeriodMode.DAY:
        return { granularity: TimePeriodGranularityEnum.TODAY };
      case AdminStatsPeriodMode.WEEK:
        return { granularity: TimePeriodGranularityEnum.THIS_WEEK };
      case AdminStatsPeriodMode.MONTH:
        return { granularity: TimePeriodGranularityEnum.THIS_MONTH };
      case AdminStatsPeriodMode.CUSTOM: {
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

  /**
   * `adminDiscountGlobalStats` solo admite `days`; se aproxima al periodo elegido.
   */
  private resolveDiscountQuery(): AdminDiscountGlobalQueryInput | null {
    switch (this.periodMode) {
      case AdminStatsPeriodMode.ALL:
        return null;
      case AdminStatsPeriodMode.DAY:
        return { days: 1 };
      case AdminStatsPeriodMode.WEEK:
        return { days: 7 };
      case AdminStatsPeriodMode.MONTH:
        return { days: 31 };
      case AdminStatsPeriodMode.CUSTOM: {
        if (!this.customStartDate || !this.customEndDate) {
          return null;
        }
        const start = this.startOfDay(new Date(this.customStartDate));
        const end = this.endOfDay(new Date(this.customEndDate));
        const diffMs = end.getTime() - start.getTime();
        const days = Math.max(1, Math.ceil(diffMs / 86_400_000));
        return { days };
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
}
