import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  BusinessPublicService,
  ProductPublicService,
  StatusEnum,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { UserDashboardPage } from './user-dashboard-page';

describe('UserDashboardPage', () => {
  let component: UserDashboardPage;
  let fixture: ComponentFixture<UserDashboardPage>;
  let findFollowedBusinesses: jest.Mock;
  let getAllPrimaryProductsByBusiness: jest.Mock;

  const activeDiscount = {
    status: StatusEnum.ACTIVE,
    startDate: new Date(Date.now() - 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
  };
  const businessWithPromo = {
    id: 1,
    name: 'Biz Promo',
    path: 'biz-promo',
    discounts: [activeDiscount],
  };
  const businessPlain = {
    id: 2,
    name: 'Biz Plain',
    path: 'biz-plain',
    discounts: [],
  };

  beforeEach(async () => {
    findFollowedBusinesses = jest.fn(() =>
      of({
        items: [businessWithPromo, businessPlain],
        page: 1,
        limit: 20,
        total: 2,
      }),
    );
    getAllPrimaryProductsByBusiness = jest.fn(({ idBusiness }: { idBusiness: number }) =>
      of([
        {
          id: idBusiness * 10,
          title: `Product ${idBusiness}`,
          creationDate: new Date(2025, 0, idBusiness).toISOString(),
          productFiles: [{ file: { url: 'https://x.com/p.png', thumbnails: {} } }],
          business: {
            id: idBusiness,
            path: `biz-${idBusiness}`,
            image: { url: 'https://x.com/b.png', thumbnails: {} },
          },
          catalog: { path: 'cat' },
        },
      ]),
    );
    const { mock: apolloMock } = createApolloMock();

    await TestBed.configureTestingModule({
      imports: [UserDashboardPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: Apollo, useValue: apolloMock },
        {
          provide: BusinessPublicService,
          useValue: { findFollowedBusinesses },
        },
        {
          provide: ProductPublicService,
          useValue: { getAllPrimaryProductsByBusiness },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardPage);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('debe crear y cargar negocios seguidos', () => {
    expect(component).toBeTruthy();
    expect(findFollowedBusinesses).toHaveBeenCalled();
    expect(component.followedBusinesses.length).toBe(2);
    expect(component.followedLoading).toBe(false);
  });

  it('debe filtrar negocios con promociones activas', () => {
    expect(component.businessesWithPromotions.length).toBe(1);
    expect(component.businessesWithPromotions[0].id).toBe(1);
  });

  it('debe cargar productos recientes deduplicados', () => {
    expect(getAllPrimaryProductsByBusiness).toHaveBeenCalled();
    expect(component.recentProductsFromFollowed.length).toBe(2);
    expect(component.productsLoading).toBe(false);
  });

  it('favoritesLink debe apuntar a la ruta de favoritos', () => {
    expect(component.favoritesLink).toContain('favorites');
  });
});

describe('UserDashboardPage sin negocios', () => {
  it('debe manejar lista vacía de seguidos', async () => {
    const { mock: apolloMock } = createApolloMock();
    await TestBed.configureTestingModule({
      imports: [UserDashboardPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: Apollo, useValue: apolloMock },
        {
          provide: BusinessPublicService,
          useValue: {
            findFollowedBusinesses: () =>
              of({ items: [], page: 1, limit: 20, total: 0 }),
          },
        },
        {
          provide: ProductPublicService,
          useValue: { getAllPrimaryProductsByBusiness: jest.fn() },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(UserDashboardPage);
    fix.componentInstance.ngOnInit();
    expect(fix.componentInstance.recentProductsFromFollowed).toEqual([]);
  });

  it('debe vaciar datos en error de carga', async () => {
    const { mock: apolloMock } = createApolloMock();
    await TestBed.configureTestingModule({
      imports: [UserDashboardPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: Apollo, useValue: apolloMock },
        {
          provide: BusinessPublicService,
          useValue: {
            findFollowedBusinesses: () =>
              throwError(() => new Error('fail')),
          },
        },
        {
          provide: ProductPublicService,
          useValue: { getAllPrimaryProductsByBusiness: jest.fn() },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(UserDashboardPage);
    fix.componentInstance.ngOnInit();
    expect(fix.componentInstance.followedBusinesses).toEqual([]);
  });
});
