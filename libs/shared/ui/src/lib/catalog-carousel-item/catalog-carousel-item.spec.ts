import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CatalogCarouselItem } from './catalog-carousel-item';

describe('CatalogCarouselItem', () => {
  let component: CatalogCarouselItem;
  let fixture: ComponentFixture<CatalogCarouselItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCarouselItem, TranslateModule.forRoot(),],
            providers: [{
                    provide: ActivatedRoute,
                    useValue: {}
                },
                TranslateService,
                TranslateStore,
            ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCarouselItem);
    component = fixture.componentInstance;
     component.product = {
            name: 'product',
            id: '1',
            price: 100,
            description: 'Product description',
            image: 'https://via.placeholder.com/150'
        };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
