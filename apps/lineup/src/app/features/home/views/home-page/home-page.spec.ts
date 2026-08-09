import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  ProductPublicService,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let navigate: jest.Mock;

  beforeEach(async () => {
    navigate = jest.fn();
    const { mock: apolloMock } = createApolloMock();

    await TestBed.configureTestingModule({
      imports: [HomePage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'browser' },
        TranslateService,
        TranslateStore,
        { provide: Apollo, useValue: apolloMock },
        {
          provide: UserPublicService,
          useValue: {
            featured: () =>
              of({
                featuredBusinesses: [],
                featuredCatalogs: [],
                featuredProducts: [],
              }),
          },
        },
        {
          provide: ProductPublicService,
          useValue: {
            featuredProducts: () => of({ items: [] }),
            productCollections: () => of([]),
            getMainTags: () => of([]),
          },
        },
        { provide: UtilsService, useValue: { navigate } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Listados destacados en el home: negocios, catálogos, productos y colecciones.
   */
  describe('datos destacados', () => {
    it('debe completar la carga sin items cuando el API devuelve vacío', () => {
      expect(component.businessesAttempt).toBe(false);
      expect(component.catalogsAttempt).toBe(false);
      expect(component.productsAttempt).toBe(false);
      expect(component.collectionsAttempt()).toBe(false);
      expect(component.featuredAttempt()).toBe(false);
      expect(component.tagsAttempt()).toBe(false);
    });
  });

  /**
   * La búsqueda navega a la ruta configurada en `AppConfigService`.
   */
  describe('onSearchSubmit', () => {
    it('no debe navegar con query vacío', () => {
      component.onSearchSubmit('');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('debe navegar al buscador con el término', () => {
      component.onSearchSubmit('camisas');
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.search,
        'camisas',
      ]);
    });
  });

  /**
   * Helper de layout del carousel según número de ítems vs viewport.
   */
  describe('fewerItemsThanCarouselViewport', () => {
    it('debe devolver false sin ítems', () => {
      expect(component.fewerItemsThanCarouselViewport(0, 'standard')).toBe(
        false,
      );
    });

    it('debe devolver true si hay menos ítems que numVisible', () => {
      component.products.set([{ id: 1 } as never]);
      expect(component.fewerItemsThanCarouselViewport(1, 'standard')).toBe(true);
    });
  });

  describe('isLeadFeaturedProduct', () => {
    it('debe identificar el primer producto destacado', () => {
      component.products.set([{ id: 10 }, { id: 11 }] as never[]);
      expect(component.isLeadFeaturedProduct({ id: 10 } as never)).toBe(true);
      expect(component.isLeadFeaturedProduct({ id: 11 } as never)).toBe(false);
    });
  });

  describe('isLeadCollectionProduct', () => {
    it('debe identificar el primer producto de la primera colección', () => {
      component.productCollections.set([
        {
          id: 1,
          products: [{ id: 100 }],
        },
      ] as never[]);
      expect(
        component.isLeadCollectionProduct(
          { id: 1, products: [{ id: 100 }] } as never,
          { id: 100 } as never,
        ),
      ).toBe(true);
    });
  });
});
