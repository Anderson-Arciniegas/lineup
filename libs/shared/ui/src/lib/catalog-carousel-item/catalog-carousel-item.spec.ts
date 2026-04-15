import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ProductPublicService,
  RatesPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { CatalogCarouselItem } from './catalog-carousel-item';

describe('CatalogCarouselItem', () => {
  let component: CatalogCarouselItem;
  let fixture: ComponentFixture<CatalogCarouselItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCarouselItem, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        DialogService,
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
            findBcvOfficialRates: () => of({}),
          },
        },
        {
          provide: UtilsService,
          useValue: {
            formatPriceWithDiscount: () => 0,
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isBusinessLoggedIn: () => false,
            isUserLoggedIn: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCarouselItem);
    component = fixture.componentInstance;
    component.product = {
      name: 'product',
      title: 'Product',
      id: 1,
      price: undefined,
      description: 'Product description',
      image: 'https://via.placeholder.com/150',
      productFiles: [{ file: { url: 'https://via.placeholder.com/150' } }],
      currency: undefined,
      business: { path: 'b' },
      catalog: { path: 'c' },
      skus: [{ price: 10, quantity: 1, currency: { id: 1, code: 'USD' } }],
    } as any;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
