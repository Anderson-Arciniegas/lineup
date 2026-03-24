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
                newFollowers: { total: 0, data: [] },
                visits: {
                  visits: { total: 0, data: [] },
                  visitsByAuthType: {
                    anonymous: 0,
                    identified: 0,
                    data: [],
                  },
                },
              }),
            catalogStats: () =>
              of({
                catalogVisitsOverTime: { total: 0, data: [] },
                topByVisits: [],
                productsPerCatalog: [],
              }),
            discountStats: () =>
              of({
                byStatus: [],
                byType: [],
                expiringSoonCount: 0,
              }),
            inventoryStats: () =>
              of({
                productsWithoutStockCount: 0,
                skusLowOrOutOfStockCount: 0,
                salesCount: { total: 0, data: [] },
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
