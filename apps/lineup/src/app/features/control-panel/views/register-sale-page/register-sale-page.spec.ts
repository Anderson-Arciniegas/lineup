import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AuthStore,
  CatalogPrivateService,
  ProductPrivateService,
  RatesPrivateService,
  StatusEnum,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { RegisterSalePage } from './register-sale-page';

describe('RegisterSalePage', () => {
  let component: RegisterSalePage;
  let fixture: ComponentFixture<RegisterSalePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterSalePage, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthStore,
          useValue: {
            business: () => ({ id: 1, name: 'Test Business' }),
          },
        },
        {
          provide: CatalogPrivateService,
          useValue: {
            findAllMyCatalogs: () =>
              of({
                items: [
                  {
                    id: 10,
                    title: 'Cat A',
                    path: 'cat-a',
                  },
                ],
                page: 1,
                limit: 200,
                total: 1,
              }),
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalogPaginated: () =>
              of({
                items: [
                  {
                    id: 1,
                    idCatalog: 10,
                    title: 'Product 1',
                    skus: [
                      {
                        id: 100,
                        skuCode: 'SKU-1',
                        quantity: 5,
                        status: StatusEnum.ACTIVE,
                        variationOptions: {},
                      },
                    ],
                  },
                ],
                page: 1,
                limit: 100,
                total: 1,
              }),
            getAllByCatalog: () =>
              of([
                {
                  id: 1,
                  idCatalog: 10,
                  title: 'Product 1',
                  skus: [
                    {
                      id: 100,
                      skuCode: 'SKU-1',
                      quantity: 5,
                      status: StatusEnum.ACTIVE,
                      variationOptions: {},
                    },
                  ],
                },
              ]),
            findOneProduct: () =>
              of({
                id: 1,
                idCatalog: 10,
                title: 'Product 1',
                skus: [
                  {
                    id: 100,
                    skuCode: 'SKU-1',
                    quantity: 5,
                    status: StatusEnum.ACTIVE,
                    variationOptions: {},
                  },
                ],
              }),
            registerSale: () =>
              of([
                {
                  id: 100,
                  skuCode: 'SKU-1',
                  quantity: 4,
                },
              ]),
          },
        },
        {
          provide: MessageService,
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () =>
              of({ dollar: 1, euro: 1, sourceDate: '2024-01-01' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterSalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function debounceWait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 350));
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load catalogs and default products', async () => {
    await debounceWait();
    fixture.detectChanges();
    expect(component.catalogs.length).toBe(1);
    expect(component.selectedCatalogId).toBe(10);
    expect(component.products.length).toBe(1);
  });

  it('should add single-sku product to cart', async () => {
    await debounceWait();
    fixture.detectChanges();
    const product = component.products[0];
    component.addToCart(product);
    expect(component.cart.length).toBe(1);
    expect(component.cart[0].lines[0].idProductSku).toBe(100);
    expect(component.cart[0].lines[0].quantity).toBe(1);
  });
});
