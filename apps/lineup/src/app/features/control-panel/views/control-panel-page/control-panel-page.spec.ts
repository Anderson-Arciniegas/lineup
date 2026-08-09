import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessPrivateService,
  StatsPrivateService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { ControlPanelPage } from './control-panel-page';

describe('ControlPanelPage', () => {
  let component: ControlPanelPage;
  let fixture: ComponentFixture<ControlPanelPage>;
  let getBusinessByPath: jest.Mock;
  let businessEngagementStats: jest.Mock;

  const mockBusiness = {
    id: 1,
    path: 'test-business',
    name: 'Test Business',
  };

  beforeEach(async () => {
    getBusinessByPath = jest.fn(() => of(mockBusiness));
    businessEngagementStats = jest.fn(() =>
      of({
        newFollowers: { total: 3 },
        visits: {
          visits: { total: 10 },
          visitsByAuthType: { anonymous: 5, identified: 5, data: [] },
        },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ControlPanelPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        {
          provide: AuthStore,
          useValue: { business: () => ({ path: 'test-business' }) },
        },
        {
          provide: BusinessPrivateService,
          useValue: { getBusinessByPath },
        },
        {
          provide: StatsPrivateService,
          useValue: {
            businessEngagementStats,
            inventoryStats: () =>
              of({
                productsWithoutStockCount: 1,
                skusLowOrOutOfStockCount: 2,
                recentStockMovements: [],
              }),
            productStats: () =>
              of({
                topByLikes: [],
                topByRating: [],
                topByVisits: [],
                visitToLikeRatio: {
                  ratio: 0,
                  totalLikes: 0,
                  totalVisits: 0,
                },
                withoutRatingsCount: 0,
                withoutVisitsCount: 0,
              }),
          },
        },
        { provide: Apollo, useValue: createApolloMock().mock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('getBusiness', () => {
    it('debe cargar negocio y estadísticas al iniciar', () => {
      expect(getBusinessByPath).toHaveBeenCalledWith('test-business');
      expect(businessEngagementStats).toHaveBeenCalled();
      expect(component.business?.path).toBe('test-business');
      expect(component.engagement?.newFollowers?.total).toBe(3);
      expect(component.attempt).toBe(false);
    });

    it('no debe relanzar carga si attempt ya está activo', () => {
      component.attempt = true;
      getBusinessByPath.mockClear();
      component.getBusiness();
      expect(getBusinessByPath).not.toHaveBeenCalled();
    });
  });
});
