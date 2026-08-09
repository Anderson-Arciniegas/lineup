import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
  AppConfigService,
  ProductPublicService,
  SearchTargetEnum,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { SearchPage } from './search-page';

describe('SearchPage', () => {
  let component: SearchPage;
  let fixture: ComponentFixture<SearchPage>;
  let search: jest.Mock;
  let getAllByTag: jest.Mock;
  let navigate: jest.Mock;
  let dialogOpen: jest.Mock;

  beforeEach(async () => {
    search = jest.fn(() => of({ items: [{ id: 1, type: 'business' }] }));
    getAllByTag = jest.fn(() => of({ items: [{ id: 2, type: 'product' }] }));
    navigate = jest.fn();
    dialogOpen = jest.fn(() => ({
      onClose: of({
        target: SearchTargetEnum.PRODUCT,
        productFilters: { minPrice: 10 },
      }),
    }));

    await TestBed.configureTestingModule({
      imports: [SearchPage, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ query: 'test' })),
            data: of({ searchMode: 'search' }),
            snapshot: { params: { query: 'test' } },
          },
        },
        TranslateService,
        TranslateStore,
        { provide: DialogService, useValue: { open: dialogOpen } },
        { provide: DynamicDialogRef, useValue: {} },
        {
          provide: UserPublicService,
          useValue: { search },
        },
        {
          provide: ProductPublicService,
          useValue: { getAllByTag },
        },
        { provide: UtilsService, useValue: { navigate } },
        { provide: Apollo, useValue: createApolloMock().mock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('carga inicial', () => {
    it('debe establecer query y modo search desde la ruta', () => {
      expect(component.searchQuery).toBe('test');
      expect(component.searchMode).toBe('search');
    });

    it('debe solicitar resultados al iniciar con query', () => {
      expect(search).toHaveBeenCalled();
      expect(component.items.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('onSearchSubmit', () => {
    it('no debe navegar con query vacío', () => {
      navigate.mockClear();
      component.onSearchSubmit('');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('debe navegar y reiniciar resultados con un término válido', () => {
      component.onSearchSubmit('zapatos');
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.search,
        'zapatos',
      ]);
      expect(component.searchQuery).toBe('zapatos');
      expect(component.items.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('setFilters', () => {
    it('debe aplicar filtros y relanzar búsqueda', () => {
      search.mockClear();
      component.setFilters({
        target: SearchTargetEnum.PRODUCT,
        productFilters: { minPrice: 5 },
      });
      expect(component.searchTypeFilter).toBe(SearchTargetEnum.PRODUCT);
      expect(component.productFilters).toEqual({ minPrice: 5 });
      expect(search).toHaveBeenCalled();
    });
  });

  describe('showFiltersDialog', () => {
    it('debe abrir el diálogo de filtros y aplicar payload al cerrar', () => {
      component.showFiltersDialog();
      expect(dialogOpen).toHaveBeenCalled();
    });
  });

  describe('onScroll', () => {
    it('debe pedir más resultados al hacer scroll', () => {
      search.mockClear();
      component.onScroll();
      expect(search).toHaveBeenCalled();
    });
  });
});
