import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BusinessPublicService, ProductPublicService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UserDashboardPage } from './user-dashboard-page';

describe('UserDashboardPage', () => {
  let component: UserDashboardPage;
  let fixture: ComponentFixture<UserDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        {
          provide: BusinessPublicService,
          useValue: {
            findFollowedBusinesses: () =>
              of({ items: [], page: 1, limit: 20, total: 0 }),
          },
        },
        {
          provide: ProductPublicService,
          useValue: {
            getAllPrimaryProductsByBusiness: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
