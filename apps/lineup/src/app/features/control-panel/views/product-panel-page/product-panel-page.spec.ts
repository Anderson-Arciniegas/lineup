import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductPrivateService, RatingPublicService, UtilsService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ProductPanelPage } from './product-panel-page';

describe('ProductPanelPage', () => {
  let component: ProductPanelPage;
  let fixture: ComponentFixture<ProductPanelPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPanelPage, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        TranslateStore,
        MessageService,
        DialogService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { catalogPath: 'cat', idProduct: '1' } },
          },
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
          provide: RatingPublicService,
          useValue: {
            productRatings: () => of({ items: [] }),
          },
        },
        {
          provide: UtilsService,
          useValue: { navigate: () => {} },
        },
        {
          provide: Location,
          useValue: { back: () => {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
