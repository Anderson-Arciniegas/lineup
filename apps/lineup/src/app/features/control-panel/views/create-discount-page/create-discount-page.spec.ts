import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  AuthStore,
  CatalogPrivateService,
  CurrencyPrivateService,
  DiscountPrivateService,
  ProductPrivateService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CreateDiscountPage } from './create-discount-page';

describe('CreateDiscountPage', () => {
  let component: CreateDiscountPage;
  let fixture: ComponentFixture<CreateDiscountPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDiscountPage, TranslateModule.forRoot(), RouterTestingModule.withRoutes([])],
      providers: [
        TranslateService,
        TranslateStore,
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {} } },
        },
        {
          provide: AuthStore,
          useValue: {
            business: () => ({ id: 1, path: 'test' }),
          },
        },
        {
          provide: CatalogPrivateService,
          useValue: {
            findAllMyCatalogs: () => of({ items: [] }),
          },
        },
        {
          provide: CurrencyPrivateService,
          useValue: { findAllCurrencies: () => of([]) },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalog: () => of({ items: [] }),
          },
        },
        {
          provide: DiscountPrivateService,
          useValue: {
            createDiscount: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateDiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
