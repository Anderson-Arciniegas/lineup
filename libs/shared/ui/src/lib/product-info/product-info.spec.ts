import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // For asynchronous animations
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ProductInfo } from './product-info';

describe('ProductInfo', () => {
  let component: ProductInfo;
  let fixture: ComponentFixture<ProductInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInfo, TranslateModule.forRoot(),],
            providers: [{
                    provide: ActivatedRoute,
                    useValue: {}
                },
                TranslateService,
                TranslateStore,
                provideAnimationsAsync(),
            ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
