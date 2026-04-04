import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsPrivateService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { StatisticsPage } from './statistics-page';

describe('StatisticsPage', () => {
  let component: StatisticsPage;
  let fixture: ComponentFixture<StatisticsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsPage, TranslateModule.forRoot()],
      providers: [
        MessageService,
        {
          provide: StatsPrivateService,
          useValue: {
            businessEngagementStats: () =>
              of({
                newFollowers: { total: 0 },
                visits: {
                  visits: { total: 0 },
                  visitsByAuthType: {
                    anonymous: 0,
                    identified: 0,
                    data: [],
                  },
                },
              }),
            catalogStats: () =>
              of({
                catalogVisitsOverTime: { total: 0 },
                topByVisits: [],
                productsPerCatalog: [],
              }),
            discountStats: () =>
              of({
                byStatus: [],
                byType: [],
                expiringSoon: { total: 0 },
              }),
            inventoryStats: () =>
              of({
                productsWithoutStockCount: 0,
                skusLowOrOutOfStockCount: 0,
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
            businessSalesInTimePeriod: () =>
              of({ sales: [], salesCount: { total: 0 } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('distingue stock no registrado (null) de agotado (0) para quantity de SKU', () => {
    expect(component.isSkuStockNotRegistered(null)).toBe(true);
    expect(component.isSkuStockNotRegistered(undefined)).toBe(true);
    expect(component.isSkuStockNotRegistered(0)).toBe(false);
    expect(component.isSkuOutOfStock(0)).toBe(true);
    expect(component.isSkuOutOfStock(null)).toBe(false);
    expect(component.isSkuOutOfStock(5)).toBe(false);
  });
});
