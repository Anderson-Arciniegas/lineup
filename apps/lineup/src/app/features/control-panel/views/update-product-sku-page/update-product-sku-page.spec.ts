import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  BusinessPrivateService,
  CatalogPrivateService,
  CurrencyPrivateService,
  ProductPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { UpdateProductSkuPage } from './update-product-sku-page';

describe('UpdateProductSkuPage', () => {
  let component: UpdateProductSkuPage;
  let fixture: ComponentFixture<UpdateProductSkuPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateProductSkuPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        TranslateService,
        TranslateStore,
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { business: 'test', idProduct: '1', catalogPath: 'cat' },
            },
          },
        },
        {
          provide: Apollo,
          useValue: {
            use: () => ({
              query: () => of({ data: {} }),
              mutate: () => of({ data: {} }),
            }),
          },
        },
        {
          provide: BusinessPrivateService,
          useValue: { getBusinessByPath: () => of({ id: 1, path: 'test' }) },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            findOneProduct: () =>
              of({
                id: 1,
                title: 'P',
                skus: [],
                productFiles: [],
              }),
          },
        },
        {
          provide: CurrencyPrivateService,
          useValue: { findAllCurrencies: () => of([]) },
        },
        {
          provide: CatalogPrivateService,
          useValue: {},
        },
        {
          provide: UtilsService,
          useValue: { navigate: () => {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProductSkuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
