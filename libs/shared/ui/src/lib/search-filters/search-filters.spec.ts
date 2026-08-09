import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { SearchTargetEnum } from '@lineup/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
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
      component.onNodeExpand({ node: { data: component.filtersLocation[0].data } });
      expect(component.filtersType[0].expanded).toBe(false);
      expect(component.filtersDelivery[0].expanded).toBe(false);
    });

    it('debe colapsar type y location al expandir delivery', () => {
      component.filtersType[0].expanded = true;
      component.filtersLocation[0].expanded = true;
      component.onNodeExpand({ node: { data: component.filtersDelivery[0].data } });
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
});

describe('SearchFilters sin modal', () => {
  let component: SearchFilters;
  let fixture: ComponentFixture<SearchFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilters, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: null },
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

  it('debe emitir setFilters fuera de modal', () => {
    jest.spyOn(component.setFilters, 'emit');
    component.saveFilters();
    expect(component.modalMode()).toBe(false);
    expect(component.setFilters.emit).toHaveBeenCalled();
  });
});
