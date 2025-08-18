import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  ActivatedRoute
} from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import {
  ProductCard
} from './product-card';

describe('ProductCard', () => {
    let component: ProductCard;
    let fixture: ComponentFixture < ProductCard > ;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductCard, TranslateModule.forRoot(), ],
            providers: [{
                    provide: ActivatedRoute,
                    useValue: {}
                },
                TranslateService,
                TranslateStore,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductCard);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});