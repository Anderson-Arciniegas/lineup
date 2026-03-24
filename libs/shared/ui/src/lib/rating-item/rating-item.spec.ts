import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StatusEnum } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { RatingItem } from './rating-item';

describe('RatingItem', () => {
  let component: RatingItem;
  let fixture: ComponentFixture<RatingItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingItem, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingItem);
    component = fixture.componentInstance;
    component.rating = {
      id: 1,
      idCreationUser: 1,
      idProduct: 10,
      stars: 4,
      status: StatusEnum.ACTIVE,
      product: {
        id: 10,
        title: 'Test product',
      } as never,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
