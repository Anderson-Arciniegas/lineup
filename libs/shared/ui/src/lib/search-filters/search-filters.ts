import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  ProductSearchFiltersInput,
  SearchFiltersApplyPayload,
  SearchTargetEnum,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TreeModule } from 'primeng/tree';
import { debounceTime, Subject } from 'rxjs';
import { Button } from '../button/button';

/**
 * Árbol de filtros para búsqueda (tipo de entidad, ubicación, entrega, rango de precio).
 * En modal cierra con `DynamicDialogRef` y devuelve `SearchFiltersApplyPayload`.
 * En sidebar aplica al instante. «Limpiar filtros» aparece si hay filtros activos (modal o sidebar).
 */
@Component({
  selector: 'lib-search-filters',
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    InputNumberModule,
    Button,
    TranslateModule,
  ],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.scss',
})
export class SearchFilters implements OnInit {
  filtersType!: TreeNode[];
  filtersLocation!: TreeNode[];
  filtersDelivery!: TreeNode[];
  selectedFilterType!: TreeNode;
  selectedFilterLocation: TreeNode | undefined;
  selectedFilterDelivery!: TreeNode;
  /** Vacío = sin filtro de precio mínimo. */
  minPrice: number | null = null;
  /** Vacío = sin filtro de precio máximo. */
  maxPrice: number | null = null;
  modalMode = signal<boolean>(false);
  private readonly ref = inject(DynamicDialogRef, { optional: true });
  private readonly config = inject(DynamicDialogConfig, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly priceChange$ = new Subject<void>();

  @Output() setFilters = new EventEmitter<SearchFiltersApplyPayload>();

  private readonly _translate = inject(TranslateService);

  /** True si hay algún filtro distinto del estado por defecto. */
  get hasActiveFilters(): boolean {
    const typeActive =
      this.selectedFilterType?.data != null &&
      this.selectedFilterType.data !== SearchTargetEnum.ALL;
    const loc = this.selectedFilterLocation?.data;
    const locationActive = typeof loc === 'string' && loc.length > 0;
    const priceActive = this.minPrice != null || this.maxPrice != null;
    return typeActive || locationActive || priceActive;
  }

  ngOnInit() {
    this.modalMode.set(!!this.ref);
    this.priceChange$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.modalMode()) {
          this.saveFilters();
        }
      });

    this.filtersType = [
      {
        label: this._translate.instant('general.type'),
        icon: 'pi pi-fw pi-box',
        selectable: false,
        data: 0,
        expanded: true,
        styleClass: 'search-filter-head',
        children: [
          {
            label: this._translate.instant('general.all'),
            styleClass: 'search-filter',
            data: SearchTargetEnum.ALL,
            checked: true,
          },
          {
            label: this._translate.instant('general.business'),
            styleClass: 'search-filter',
            data: SearchTargetEnum.BUSINESSES,
          },
          {
            label: this._translate.instant('general.catalog'),
            styleClass: 'search-filter',
            data: SearchTargetEnum.CATALOGS,
          },
          {
            label: this._translate.instant('general.product'),
            styleClass: 'search-filter',
            data: SearchTargetEnum.PRODUCTS,
          },
        ],
      },
    ];

    this.selectedFilterType = this.filtersType[0].children?.find(
      (child) => child.checked,
    ) as TreeNode;
    this.filtersLocation = [
      {
        label: this._translate.instant('general.location'),
        icon: 'pi pi-fw pi-map-marker',
        styleClass: 'search-filter-head',
        selectable: false,
        data: 1,
        children: [
          { label: 'Amazonas', styleClass: 'search-filter', data: 'Amazonas' },
          {
            label: 'Anzoátegui',
            styleClass: 'search-filter',
            data: 'Anzoátegui',
          },
          { label: 'Apure', styleClass: 'search-filter', data: 'Apure' },
          { label: 'Aragua', styleClass: 'search-filter', data: 'Aragua' },
          { label: 'Barinas', styleClass: 'search-filter', data: 'Barinas' },
          { label: 'Bolívar', styleClass: 'search-filter', data: 'Bolívar' },
          { label: 'Carabobo', styleClass: 'search-filter', data: 'Carabobo' },
          { label: 'Cojedes', styleClass: 'search-filter', data: 'Cojedes' },
          {
            label: 'Delta Amacuro',
            styleClass: 'search-filter',
            data: 'Delta Amacuro',
          },
          {
            label: 'Distrito Capital',
            styleClass: 'search-filter',
            data: 'Distrito Capital',
          },
          { label: 'Falcón', styleClass: 'search-filter', data: 'Falcón' },
          { label: 'Guárico', styleClass: 'search-filter', data: 'Guárico' },
          { label: 'Lara', styleClass: 'search-filter', data: 'Lara' },
          { label: 'Mérida', styleClass: 'search-filter', data: 'Mérida' },
          { label: 'Miranda', styleClass: 'search-filter', data: 'Miranda' },
          { label: 'Monagas', styleClass: 'search-filter', data: 'Monagas' },
          {
            label: 'Nueva Esparta',
            styleClass: 'search-filter',
            data: 'Nueva Esparta',
          },
          {
            label: 'Portuguesa',
            styleClass: 'search-filter',
            data: 'Portuguesa',
          },
          { label: 'Sucre', styleClass: 'search-filter', data: 'Sucre' },
          { label: 'Táchira', styleClass: 'search-filter', data: 'Táchira' },
          { label: 'Trujillo', styleClass: 'search-filter', data: 'Trujillo' },
          { label: 'Vargas', styleClass: 'search-filter', data: 'Vargas' },
          { label: 'Yaracuy', styleClass: 'search-filter', data: 'Yaracuy' },
          { label: 'Zulia', styleClass: 'search-filter', data: 'Zulia' },
        ],
      },
    ];

    this.filtersDelivery = [
      {
        label: this._translate.instant('general.typeOfDelivery'),
        icon: 'pi pi-fw pi-truck',
        selectable: false,
        data: 2,

        styleClass: 'search-filter-head',
        children: [
          {
            label: this._translate.instant('general.physicalStore'),
            styleClass: 'search-filter',
            data: 'physicalStore',
          },
          {
            label: this._translate.instant('general.agreed'),
            styleClass: 'search-filter',
            data: 'agreed',
          },
          {
            label: this._translate.instant('general.delivery'),
            styleClass: 'search-filter',
            data: 'delivery',
          },
          {
            label: this._translate.instant('general.nationalDelivery'),
            styleClass: 'search-filter',
            data: 'nationalDelivery',
          },
        ],
      },
    ];

    this.applyInitialFilters(
      this.config?.data as SearchFiltersApplyPayload | undefined,
    );
  }

  onNodeExpand(event: { node: TreeNode }) {
    if (this.filtersType[0].data === event.node.data) {
      this.filtersLocation[0].expanded = false;
      this.filtersDelivery[0].expanded = false;
    } else if (this.filtersLocation[0].data === event.node.data) {
      this.filtersType[0].expanded = false;
      this.filtersDelivery[0].expanded = false;
    } else if (this.filtersDelivery[0].data === event.node.data) {
      this.filtersType[0].expanded = false;
      this.filtersLocation[0].expanded = false;
    }
  }

  /** En sidebar aplica al instante; en modal no hace nada hasta `saveFilters`. */
  onSelectionChange(): void {
    if (!this.modalMode()) {
      this.saveFilters();
    }
  }

  /** Debounce de precio en sidebar para no disparar una búsqueda por dígito. */
  onPriceChange(): void {
    if (!this.modalMode()) {
      this.priceChange$.next();
    }
  }

  saveFilters() {
    const productFilters = this.buildProductFilters();
    const payload: SearchFiltersApplyPayload = {
      target:
        (this.selectedFilterType?.data as SearchTargetEnum) ??
        SearchTargetEnum.ALL,
      productFilters,
    };
    if (this.modalMode()) {
      this.ref?.close(payload);
    } else {
      this.setFilters.emit(payload);
    }
  }

  /** Restaura estado por defecto y aplica payload vacío (emite o cierra el modal). */
  clearFilters(): void {
    this.selectedFilterType = this.filtersType[0].children?.find(
      (child) => child.data === SearchTargetEnum.ALL,
    ) as TreeNode;
    this.selectedFilterLocation = undefined;
    this.minPrice = null;
    this.maxPrice = null;
    const payload: SearchFiltersApplyPayload = {
      target: SearchTargetEnum.ALL,
      productFilters: {},
    };
    if (this.modalMode()) {
      this.ref?.close(payload);
    } else {
      this.setFilters.emit(payload);
    }
  }

  private applyInitialFilters(
    initial: SearchFiltersApplyPayload | undefined,
  ): void {
    if (!initial) {
      return;
    }
    const typeNode = this.filtersType[0].children?.find(
      (child) => child.data === initial.target,
    );
    if (typeNode) {
      this.selectedFilterType = typeNode;
    }
    const location = initial.productFilters?.location;
    if (typeof location === 'string' && location.length > 0) {
      this.selectedFilterLocation = this.filtersLocation[0].children?.find(
        (child) => child.data === location,
      );
      if (this.selectedFilterLocation) {
        this.filtersLocation[0].expanded = true;
      }
    }
    this.minPrice = initial.productFilters?.minPrice ?? null;
    this.maxPrice = initial.productFilters?.maxPrice ?? null;
  }

  private buildProductFilters(): ProductSearchFiltersInput {
    const productFilters: ProductSearchFiltersInput = {};
    const loc = this.selectedFilterLocation?.data;
    if (typeof loc === 'string' && loc.length > 0) {
      productFilters.location = loc;
    }
    if (this.minPrice != null) {
      productFilters.minPrice = this.minPrice;
    }
    if (this.maxPrice != null) {
      productFilters.maxPrice = this.maxPrice;
    }
    return productFilters;
  }
}
