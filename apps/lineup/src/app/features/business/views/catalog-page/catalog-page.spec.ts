import { HttpErrorResponse } from '@angular/common/http';
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
  ToastService,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
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

describe('CatalogPage estados de error y vacío', () => {
  const business = { id: 1, path: 'biz', name: 'B', hexColor: '#eeeeee' };
  const catalog = {
    id: 2,
    path: 'cat',
    title: 'Cat',
    hexColor: '#ff0000',
  };

  async function setup(options: {
    catalog$?: ReturnType<typeof of> | ReturnType<typeof throwError>;
    products$?: ReturnType<typeof of> | ReturnType<typeof throwError>;
    findOneCatalogByPath?: jest.Mock;
    search?: string;
  } = {}): Promise<{
    fixture: ComponentFixture<CatalogPage>;
    component: CatalogPage;
    findOneCatalogByPath: jest.Mock;
    getAllByCatalogPaginated: jest.Mock;
  }> {
    const findOneCatalogByPath =
      options.findOneCatalogByPath ??
      jest.fn(() => options.catalog$ ?? of(catalog as never));
    const getAllByCatalogPaginated = jest.fn(
      () => options.products$ ?? of({ items: [] }),
    );

    await TestBed.configureTestingModule({
      imports: [CatalogPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Apollo, useValue: createApolloMock().mock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { business: 'biz', catalogPath: 'cat' },
              queryParams: options.search ? { search: options.search } : {},
            },
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
            isAuthenticated: () => false,
          },
        },
        {
          provide: BusinessPublicService,
          useValue: {
            findBusinessByPath: () => of(business as never),
          },
        },
        {
          provide: CatalogPublicService,
          useValue: { findOneCatalogByPath },
        },
        {
          provide: ProductPublicService,
          useValue: {
            getAllByCatalogPaginated,
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
        { provide: ToastService, useValue: { warn: jest.fn() } },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CatalogPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component, findOneCatalogByPath, getAllByCatalogPaginated };
  }

  it('debe marcar catalogLoadError cuando el catálogo no existe', async () => {
    const { component } = await setup({
      catalog$: throwError(
        () => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }),
      ),
    });
    expect(component.catalogLoadError).toBe('errors.notFound');
    expect(component.catalog).toBeUndefined();
  });

  it('debe reintentar la carga del catálogo', async () => {
    const findOneCatalogByPath = jest
      .fn()
      .mockReturnValueOnce(
        throwError(
          () => new HttpErrorResponse({ status: 500, statusText: 'Error' }),
        ),
      )
      .mockReturnValueOnce(of(catalog as never));

    const { component } = await setup({ findOneCatalogByPath });
    expect(component.catalogLoadError).toBe('errors.loadFailed');

    component.retryCatalog();
    expect(findOneCatalogByPath).toHaveBeenCalledTimes(2);
    expect(component.catalogLoadError).toBeNull();
    expect(component.catalog?.path).toBe('cat');
  });

  it('debe mostrar vacío de catálogo público sin productos', async () => {
    const { component } = await setup();
    expect(component.products).toEqual([]);
    expect(component.catalogEmptyMessageKey).toBe(
      'general.noPublicCatalogProducts',
    );
  });

  it('debe mostrar noResults cuando la búsqueda no tiene productos', async () => {
    const { component } = await setup();
    component.onSearchSubmit('zapatos');
    expect(component.searchQuery).toBe('zapatos');
    expect(component.catalogEmptyMessageKey).toBe('general.noResults');
  });

  it('debe hidratar searchQuery desde ?search= de la URL', async () => {
    const { component } = await setup({ search: 'zapatos' });
    expect(component.searchQuery).toBe('zapatos');
    expect(component.catalogEmptyMessageKey).toBe('general.noResults');
  });

  it('debe marcar productsLoadError si falla la primera página', async () => {
    const { component } = await setup({
      products$: throwError(
        () => new HttpErrorResponse({ status: 500, statusText: 'Error' }),
      ),
    });
    expect(component.productsLoadError).toBe('errors.loadFailed');
    expect(component.products).toEqual([]);
  });
});
