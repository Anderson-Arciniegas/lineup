import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  AuthStore,
  CatalogPrivateService,
  ProductPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { InventoryPage } from './inventory-page';

describe('InventoryPage', () => {
  let component: InventoryPage;
  let fixture: ComponentFixture<InventoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
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
                items: [],
                page: 1,
                limit: 20,
                total: 0,
              }),
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalogPaginated: () =>
              of({
                items: [],
                page: 1,
                limit: 20,
                total: 0,
              }),
            getStockByProduct: () => of([]),
          },
        },
        {
          provide: MessageService,
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: UtilsService,
          useValue: { navigate: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
