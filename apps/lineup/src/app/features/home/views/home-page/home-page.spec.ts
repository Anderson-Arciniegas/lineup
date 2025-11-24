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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  HomePage
} from './home-page';

describe('HomePage', () => {
    let component: HomePage;
    let fixture: ComponentFixture < HomePage > ;

    beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage, TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [{
                    provide: ActivatedRoute,
                    useValue: {}
                },
                TranslateService,
                TranslateStore,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HomePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});