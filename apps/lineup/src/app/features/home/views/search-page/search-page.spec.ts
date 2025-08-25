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
  SearchPage
} from './search-page';

describe('SearchPage', () => {
    let component: SearchPage;
    let fixture: ComponentFixture < SearchPage > ;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchPage, TranslateModule.forRoot(), ],
            providers: [{
                    provide: ActivatedRoute,
                    useValue: {}
                },
                TranslateService,
                TranslateStore,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});