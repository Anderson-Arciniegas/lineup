import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingPublicService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { MyRatingsPage } from './my-ratings-page';

describe('MyRatingsPage', () => {
  let component: MyRatingsPage;
  let fixture: ComponentFixture<MyRatingsPage>;
  let myProductRatings: jest.Mock;

  beforeEach(async () => {
    myProductRatings = jest.fn(() =>
      of({
        items: [{ id: 1, rating: 5, comment: 'Great' }],
        page: 1,
        limit: 20,
        total: 100,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [MyRatingsPage, TranslateModule.forRoot()],
      providers: [
        {
          provide: RatingPublicService,
          useValue: { myProductRatings },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRatingsPage);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('debe crear y cargar valoraciones', () => {
    expect(component).toBeTruthy();
    expect(myProductRatings).toHaveBeenCalled();
    expect(component.ratings.length).toBe(1);
    expect(component.loadedOnce).toBe(true);
  });

  it('onScroll carga más páginas', () => {
    component.onScroll();
    expect(myProductRatings).toHaveBeenCalledTimes(2);
  });

  it('debe marcar noMoreResults al alcanzar total', () => {
    myProductRatings.mockReturnValueOnce(
      of({ items: [], page: 2, limit: 20, total: 1 }),
    );
    component.loadRatings();
    expect(component.noMoreResults).toBe(true);
  });
});

describe('MyRatingsPage errores', () => {
  it('debe marcar loadedOnce en error', async () => {
    await TestBed.configureTestingModule({
      imports: [MyRatingsPage, TranslateModule.forRoot()],
      providers: [
        {
          provide: RatingPublicService,
          useValue: {
            myProductRatings: () => throwError(() => new Error('fail')),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(MyRatingsPage);
    fix.componentInstance.loadRatings();
    expect(fix.componentInstance.loadedOnce).toBe(true);
    expect(fix.componentInstance.attempt).toBe(false);
  });
});
