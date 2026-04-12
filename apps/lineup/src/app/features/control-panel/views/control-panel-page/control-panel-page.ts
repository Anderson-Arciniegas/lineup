import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import {
  AuthStore,
  BusinessPrivateService,
  BusinessSchema,
  EngagementStatsSchema,
  InventoryStatsSchema,
  ProductStatsSchema,
  StatsPrivateService,
  StockMovementTypeTranslatePipe,
  TimePeriodGranularityEnum,
  TimePeriodInput,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { forkJoin } from 'rxjs';

/**
 * Dashboard del negocio autenticado: resume KPIs de engagement, inventario y productos
 * para el periodo por defecto y reacciona a cambios del `path` en `AuthStore`.
 */
@Component({
  selector: 'app-control-panel-page',
  imports: [
    CommonModule,
    TranslateModule,
    ProgressSpinner,
    StockMovementTypeTranslatePipe,
  ],
  templateUrl: './control-panel-page.html',
  styleUrl: './control-panel-page.scss',
})
export class ControlPanelPage implements OnInit {
  business?: BusinessSchema;
  engagement?: EngagementStatsSchema;
  inventory?: InventoryStatsSchema;
  product?: ProductStatsSchema;

  attempt = false;
  path = '';

  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _statsService = inject(StatsPrivateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _defaultTimePeriod: TimePeriodInput = {
    granularity: TimePeriodGranularityEnum.THIS_MONTH,
  };

  /**
   * Registra un `effect` que, al cambiar el `path` del negocio en `AuthStore`,
   * vuelve a pedir negocio y estadísticas consolidadas.
   */
  constructor() {
    effect(() => {
      const business = this._authStore.business();
      const path = business?.path;

      if (!path || path === this.path) return;

      this.path = path;
      this.getBusiness();
    });
  }

  /** Carga inicial si ya existe negocio con `path` antes de que dispare el effect. */
  ngOnInit(): void {
    const business = this._authStore.business();
    if (!business?.path) return;
    this.path = business.path;
    this.getBusiness();
  }

  /** `forkJoin` de negocio + tres bloques de estadísticas para el mes en curso. */
  getBusiness(): void {
    if (this.attempt) return;
    this.attempt = true;
    forkJoin({
      business: this._businessService.getBusinessByPath(this.path),
      engagement: this._statsService.businessEngagementStats(
        this._defaultTimePeriod,
      ),
      inventory: this._statsService.inventoryStats(this._defaultTimePeriod),
      product: this._statsService.productStats(this._defaultTimePeriod),
    }).subscribe({
      next: (business) => {
        this.business = business.business;
        this.engagement = business.engagement;
        this.inventory = business.inventory;
        this.product = business.product;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.attempt = false;
      },
    });
  }
}
