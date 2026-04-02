import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { MyRatingsPage } from './my-ratings-page';

describe('MyRatingsPage', () => {
  let component: MyRatingsPage;
  let fixture: ComponentFixture<MyRatingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRatingsPage, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        TranslateStore,
        {
          provide: Apollo,
          useValue: {
            use: () => ({
              query: () =>
                of({
                  data: {
                    myProductRatings: {
                      items: [],
                      limit: 20,
                      page: 1,
                      total: 0,
                    },
                  },
                }),
              mutate: () => of({ data: {} }),
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRatingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
