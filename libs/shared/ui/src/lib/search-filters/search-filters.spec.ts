import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { SearchTargetEnum } from '@lineup/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SearchFilters } from './search-filters';

describe('SearchFilters', () => {
  let component: SearchFilters;
  let fixture: ComponentFixture<SearchFilters>;
  let dialogRef: { close: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [SearchFilters, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRef },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(SearchFilters, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SearchFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe activar modalMode cuando hay DynamicDialogRef', () => {
    expect(component.modalMode()).toBe(true);
  });

  it('debe inicializar árbol de tipos con opción ALL seleccionada', () => {
    expect(component.filtersType).toHaveLength(1);
    expect(component.selectedFilterType.data).toBe(SearchTargetEnum.ALL);
  });

  describe('onNodeExpand', () => {
    it('debe colapsar location y delivery al expandir type', () => {
      component.filtersLocation[0].expanded = true;
      component.filtersDelivery[0].expanded = true;
      component.onNodeExpand({ node: { data: component.filtersType[0].data } });
      expect(component.filtersLocation[0].expanded).toBe(false);
      expect(component.filtersDelivery[0].expanded).toBe(false);
    });

    it('debe colapsar type y delivery al expandir location', () => {
      component.filtersType[0].expanded = true;
      component.filtersDelivery[0].expanded = true;
      component.onNodeExpand({
        node: { data: component.filtersLocation[0].data },
      });
      expect(component.filtersType[0].expanded).toBe(false);
      expect(component.filtersDelivery[0].expanded).toBe(false);
    });

    it('debe colapsar type y location al expandir delivery', () => {
      component.filtersType[0].expanded = true;
      component.filtersLocation[0].expanded = true;
      component.onNodeExpand({
        node: { data: component.filtersDelivery[0].data },
      });
      expect(component.filtersType[0].expanded).toBe(false);
      expect(component.filtersLocation[0].expanded).toBe(false);
    });
  });

  describe('saveFilters', () => {
    it('debe cerrar el diálogo en modalMode', () => {
      component.selectedFilterType = component.filtersType[0].children![1];
      component.selectedFilterLocation = component.filtersLocation[0].children![0];
      component.minPrice = 10;
      component.maxPrice = 100;
      component.saveFilters();
      expect(dialogRef.close).toHaveBeenCalledWith(
        expect.objectContaining({
          target: SearchTargetEnum.BUSINESSES,
          productFilters: expect.objectContaining({
            location: 'Amazonas',
            minPrice: 10,
            maxPrice: 100,
          }),
        }),
      );
    });
  });

  describe('onSelectionChange en modal', () => {
    it('no debe cerrar el diálogo al cambiar selección', () => {
      component.selectedFilterType = component.filtersType[0].children![1];
      component.onSelectionChange();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('onPriceChange en modal', () => {
    it('no debe cerrar el diálogo al cambiar precio', fakeAsync(() => {
      component.minPrice = 50;
      component.onPriceChange();
      tick(300);
      expect(dialogRef.close).not.toHaveBeenCalled();
    }));
  });

  describe('clearFilters en modal', () => {
    it('debe cerrar el diálogo con payload vacío', () => {
      component.selectedFilterType = component.filtersType[0].children![1];
      component.selectedFilterLocation =
        component.filtersLocation[0].children![0];
      component.minPrice = 10;
      component.maxPrice = 99;

      component.clearFilters();

      expect(component.selectedFilterType.data).toBe(SearchTargetEnum.ALL);
      expect(component.selectedFilterLocation).toBeUndefined();
      expect(component.minPrice).toBeNull();
      expect(component.maxPrice).toBeNull();
      expect(dialogRef.close).toHaveBeenCalledWith({
        target: SearchTargetEnum.ALL,
        productFilters: {},
      });
    });
  });

  describe('hasActiveFilters en modal', () => {
    it('debe ser true cuando hay filtros seleccionados', () => {
      component.selectedFilterType = component.filtersType[0].children![1];
      expect(component.hasActiveFilters).toBe(true);
    });
  });
});

describe('SearchFilters modal con filtros iniciales', () => {
  let component: SearchFilters;
  let fixture: ComponentFixture<SearchFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilters, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              target: SearchTargetEnum.PRODUCTS,
              productFilters: {
                location: 'Miranda',
                minPrice: 5,
                maxPrice: 50,
              },
            },
          },
        },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(SearchFilters, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SearchFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe hidratar selección desde DynamicDialogConfig', () => {
    expect(component.selectedFilterType.data).toBe(SearchTargetEnum.PRODUCTS);
    expect(component.selectedFilterLocation?.data).toBe('Miranda');
    expect(component.minPrice).toBe(5);
    expect(component.maxPrice).toBe(50);
    expect(component.hasActiveFilters).toBe(true);
  });
});

describe('SearchFilters sin modal', () => {
  let component: SearchFilters;
  let fixture: ComponentFixture<SearchFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilters, TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore],
    })
      .overrideComponent(SearchFilters, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SearchFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe emitir setFilters fuera de modal', () => {
    jest.spyOn(component.setFilters, 'emit');
    component.saveFilters();
    expect(component.modalMode()).toBe(false);
    expect(component.setFilters.emit).toHaveBeenCalled();
  });

  it('debe emitir setFilters al cambiar selección', () => {
    jest.spyOn(component.setFilters, 'emit');
    component.selectedFilterType = component.filtersType[0].children![1];
    component.onSelectionChange();
    expect(component.setFilters.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        target: SearchTargetEnum.BUSINESSES,
      }),
    );
  });

  it('debe emitir setFilters al cambiar precio tras debounce', fakeAsync(() => {
    jest.spyOn(component.setFilters, 'emit');
    component.minPrice = 25;
    component.onPriceChange();
    expect(component.setFilters.emit).not.toHaveBeenCalled();
    tick(300);
    expect(component.setFilters.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        productFilters: expect.objectContaining({ minPrice: 25 }),
      }),
    );
  }));

  describe('hasActiveFilters', () => {
    it('debe ser false en estado por defecto', () => {
      expect(component.hasActiveFilters).toBe(false);
    });

    it('debe ser true con tipo distinto de ALL', () => {
      component.selectedFilterType = component.filtersType[0].children![1];
      expect(component.hasActiveFilters).toBe(true);
    });

    it('debe ser true con ubicación', () => {
      component.selectedFilterLocation =
        component.filtersLocation[0].children![0];
      expect(component.hasActiveFilters).toBe(true);
    });

    it('debe ser true con precio', () => {
      component.maxPrice = 100;
      expect(component.hasActiveFilters).toBe(true);
    });
  });

  describe('clearFilters', () => {
    it('debe resetear estado y emitir payload vacío', () => {
      jest.spyOn(component.setFilters, 'emit');
      component.selectedFilterType = component.filtersType[0].children![1];
      component.selectedFilterLocation =
        component.filtersLocation[0].children![0];
      component.minPrice = 10;
      component.maxPrice = 99;

      component.clearFilters();

      expect(component.selectedFilterType.data).toBe(SearchTargetEnum.ALL);
      expect(component.selectedFilterLocation).toBeUndefined();
      expect(component.minPrice).toBeNull();
      expect(component.maxPrice).toBeNull();
      expect(component.hasActiveFilters).toBe(false);
      expect(component.setFilters.emit).toHaveBeenCalledWith({
        target: SearchTargetEnum.ALL,
        productFilters: {},
      });
    });
  });
});
