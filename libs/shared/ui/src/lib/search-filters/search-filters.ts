import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { SearchTargetEnum } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TreeModule } from 'primeng/tree';
import { Button } from '../button/button';

/** Valores del filtro "tipo": solo uno puede estar seleccionado a la vez. */

@Component({
  selector: 'lib-search-filters',
  imports: [
    CommonModule,
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
  selectedFilterLocation!: TreeNode;
  selectedFilterDelivery!: TreeNode;
  modalMode = signal<boolean>(false);
  private readonly ref = inject(DynamicDialogRef);

  @Output() setFilters = new EventEmitter<TreeNode[]>();

  private readonly _translate = inject(TranslateService);

  ngOnInit() {
    this.modalMode.set(!!this.ref);
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
    console.log(this.selectedFilterType);
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
  }

  select(event: any) {
    console.log('Selected File: ', event);
  }

  onNodeExpand(event: any) {
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

  saveFilters() {
    if (this.modalMode()) {
      this.ref.close({
        filters: [
          this.selectedFilterType,
          this.selectedFilterLocation,
          this.selectedFilterDelivery,
        ],
      });
    } else {
      this.setFilters.emit([
        this.selectedFilterType,
        this.selectedFilterLocation,
        this.selectedFilterDelivery,
      ]);
    }
  }
}
