import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ProductInfo } from './product-info';

describe('ProductInfo', () => {
  let component: ProductInfo;
  let fixture: ComponentFixture<ProductInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInfo, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        provideAnimationsAsync(),
        {
          provide: Apollo,
          useValue: {
            use: () => ({
              query: () => of({ data: { findByBusiness: [] } }),
            }),
          },
        },
        DialogService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductInfo);
    component = fixture.componentInstance;
    component.product = {
      productTags: [],
      description: '',
      business: { id: 1 },
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
