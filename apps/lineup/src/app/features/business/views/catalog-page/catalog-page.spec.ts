import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID, PendingTasks } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import {
  AuthStore,
  BusinessPublicService,
  CatalogPrivateService,
  CatalogPublicService,
  ProductPublicService,
  SeoService,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { CatalogPage } from './catalog-page';

describe('CatalogPage', () => {
  let fixture: ComponentFixture<CatalogPage>;
  let component: CatalogPage;
  let getAllByCatalogPaginated: jest.Mock;

  const business = { id: 1, path: 'biz', name: 'B', hexColor: '#eeeeee' };
  const catalog = {
    id: 2,
    path: 'cat',
    title: 'Cat',
    hexColor: '#ff0000',
  };

  beforeEach(async () => {
    getAllByCatalogPaginated = jest.fn(() => of({ items: [] }));

    await TestBed.configureTestingModule({
      imports: [CatalogPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Apollo, useValue: createApolloMock().mock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { business: 'biz', catalogPath: 'cat' } },
          },
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: PendingTasks,
          useValue: { add: () => () => void 0 },
        },
        {
          provide: AuthStore,
          useValue: {
            business: () => null,
            isUserLoggedIn: () => false,
            isBusinessLoggedIn: () => false,
          },
        },
        {
          provide: BusinessPublicService,
          useValue: {
            findBusinessByPath: () => of(business as any),
          },
        },
        {
          provide: CatalogPublicService,
          useValue: {
            findOneCatalogByPath: () => of(catalog as any),
          },
        },
        {
          provide: ProductPublicService,
          useValue: {
            getAllByCatalogPaginated: getAllByCatalogPaginated,
            getAllPrimaryProductsByBusiness: () => of([]),
          },
        },
        { provide: CatalogPrivateService, useValue: { updateCatalog: jest.fn() } },
        { provide: SeoService, useValue: { setCatalogPage: jest.fn() } },
        {
          provide: UserPublicService,
          useValue: { recordVisit: () => of({}) },
        },
        { provide: UtilsService, useValue: { navigate: jest.fn() } },
        DialogService,
        { provide: MessageService, useValue: { add: jest.fn() } },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Negocio + catálogo por path y primera página de productos en navegador.
   */
  describe('carga y listado', () => {
    it('debe asignar business y catalog', () => {
      expect(component.business?.path).toBe('biz');
      expect(component.catalog?.path).toBe('cat');
    });

    it('debe solicitar productos paginados del catálogo', () => {
      expect(getAllByCatalogPaginated).toHaveBeenCalled();
    });
  });

  /**
   * Búsqueda reinicia paginación y vuelve a pedir productos.
   */
  describe('onSearchSubmit', () => {
    it('debe resetear página y ejecutar búsqueda', () => {
      component.page = 5;
      component.noMoreResults = true;
      component.onSearchSubmit('zapatos');
      expect(component.searchQuery).toBe('zapatos');
      // `getProducts` incrementa `page` al completar la petición.
      expect(component.page).toBeGreaterThanOrEqual(2);
    });
  });

  describe('layout', () => {
    it('debe normalizar modo de vista desconocido a Grid', () => {
      component.onLayoutModeChange('Invalid');
      expect(component.layoutMode).toBe('Grid');
    });
  });
});
