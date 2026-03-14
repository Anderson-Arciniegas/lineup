import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
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
          provide: Apollo,
          useValue: {
            use: () => ({
              query: () => of({ data: { hasLikedProduct: false } }),
            }),
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
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
