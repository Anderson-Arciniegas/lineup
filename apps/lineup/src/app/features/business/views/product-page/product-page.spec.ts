import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingTasks } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { DialogService } from 'primeng/dynamicdialog';
import {
  AuthStore,
  BusinessPublicService,
  CatalogPrivateService,
  ProductPrivateService,
  ProductPublicService,
  RatesPrivateService,
  SeoService,
  SocialNetworkPrivateService,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { ProductPage } from './product-page';

describe('ProductPage', () => {
  let fixture: ComponentFixture<ProductPage>;
  let component: ProductPage;

  const product = {
    id: 100,
    title: 'Producto',
    catalog: { id: 1, path: 'c', hexColor: '#ffffff' },
    productFiles: [],
    productTags: [],
    business: { id: 50 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Apollo, useValue: createApolloMock().mock },
        DialogService,
        { provide: MessageService, useValue: { add: jest.fn() } },
        {
          provide: SocialNetworkPrivateService,
          useValue: { findByBusiness: () => of([]) },
        },
        {
          provide: RatesPrivateService,
          useValue: { findBcvOfficialRates: () => of(null) },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { business: 'biz', idProduct: '100' } },
          },
        },
        provideNoopAnimations(),
        TranslateService,
        TranslateStore,
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: false, breakpoints: {} } as any),
            isMatched: jest.fn().mockReturnValue(false),
          },
        },
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
            findBusinessByPath: () =>
              of({ id: 50, path: 'biz', hexColor: '#ccc' } as any),
          },
        },
        {
          provide: ProductPublicService,
          useValue: {
            findOneProduct: () => of(product as any),
            hasLikedProduct: () => of(false),
            likeProduct: jest.fn(() => of({})),
            unlikeProduct: jest.fn(() => of({})),
            getAllByTags: () => of({ items: [], page: 1, limit: 4, total: 0 }),
          },
        },
        { provide: ProductPrivateService, useValue: {} },
        { provide: CatalogPrivateService, useValue: {} },
        { provide: SeoService, useValue: { setProductPage: jest.fn() } },
        {
          provide: UserPublicService,
          useValue: { recordVisit: () => of({}) },
        },
        {
          provide: UtilsService,
          useValue: {
            navigate: jest.fn(),
            formatPriceWithDiscount: jest.fn(() => 10),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Carga del detalle público y metadatos SEO.
   */
  describe('carga del producto', () => {
    it('debe asignar producto y negocio', () => {
      expect(component.product?.id).toBe(100);
      expect(component.business?.path).toBe('biz');
    });
  });

  /**
   * Carrusel: sin autoplay si no hay slides o caben todos en viewport.
   */
  describe('carouselAutoplayInterval', () => {
    it('debe ser 0 sin archivos de imagen', () => {
      expect(component.carouselAutoplayInterval).toBe(0);
    });
  });
});
