import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterModule } from '@angular/router';
import {
  AuthStore,
  ProductPublicService,
  ProductSchema,
  RatesPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ProductExpandedItem } from './product-expanded-item';

describe('ProductExpandedItem', () => {
  let component: ProductExpandedItem;
  let fixture: ComponentFixture<ProductExpandedItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductExpandedItem,
        TranslateModule.forRoot(),
        RouterModule.forRoot([]),
      ],
      providers: [
        DialogService,
        TranslateService,
        TranslateStore,
        provideAnimationsAsync(),
        {
          provide: UtilsService,
          useValue: {
            formatPriceWithDiscount: jest.fn().mockReturnValue(100),
            navigate: jest.fn(),
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isBusinessLoggedIn: () => true,
          },
        },
        {
          provide: ProductPublicService,
          useValue: {
            hasLikedProduct: () => of(false),
            likeProduct: () => of({}),
            unlikeProduct: () => of({}),
          },
        },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () =>
              of({ dollar: 36, euro: 40, sourceDate: '2024-01-01' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductExpandedItem);
    component = fixture.componentInstance;
    component.product = {
      id: 1,
      title: 'Test',
      business: { path: 'biz' },
      catalog: { path: 'cat' },
      skus: [{ price: 100, currency: { code: 'USD' } }],
      productFiles: [{ file: { url: 'https://example.com/p.jpg' } }],
      discountProduct: null,
    } as unknown as ProductSchema;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
