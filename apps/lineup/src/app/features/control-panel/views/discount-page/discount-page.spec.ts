import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthStore, DiscountPrivateService, UtilsService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { DiscountPage } from './discount-page';

describe('DiscountPage', () => {
  let component: DiscountPage;
  let fixture: ComponentFixture<DiscountPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountPage, TranslateModule.forRoot(), RouterTestingModule.withRoutes([])],
      providers: [
        TranslateService,
        TranslateStore,
        MessageService,
        DialogService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
        {
          provide: AuthStore,
          useValue: { business: () => ({ id: 1, path: 'test' }) },
        },
        {
          provide: DiscountPrivateService,
          useValue: {
            findOneDiscount: () =>
              of({
                id: 1,
                discountType: 'PERCENTAGE',
                scope: 'CATALOG',
                value: 10,
                startDate: '',
                endDate: '',
                status: 'ACTIVE',
                discountProducts: [],
              }),
            removeDiscount: () => of(true),
          },
        },
        {
          provide: UtilsService,
          useValue: { navigate: () => undefined },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
