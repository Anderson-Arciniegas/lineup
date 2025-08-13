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
  BusinessCard
} from './business-card';

describe('BusinessCard', () => {
    let component: BusinessCard;
    let fixture: ComponentFixture < BusinessCard > ;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BusinessCard, TranslateModule.forRoot(), ],
            providers: [{
                    provide: ActivatedRoute,
                    useValue: {}
                },
                TranslateService,
                TranslateStore,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(BusinessCard);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});