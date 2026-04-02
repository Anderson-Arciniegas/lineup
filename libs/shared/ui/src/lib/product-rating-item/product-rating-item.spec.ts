import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProvidersEnum, StatusEnum } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProductRatingItem } from './product-rating-item';

describe('ProductRatingItem', () => {
  let component: ProductRatingItem;
  let fixture: ComponentFixture<ProductRatingItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRatingItem, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductRatingItem);
    component = fixture.componentInstance;
    component.rating = {
      id: 1,
      idCreationUser: 1,
      idProduct: 10,
      stars: 4,
      status: StatusEnum.ACTIVE,
      creationUser: {
        id: 1,
        email: 'a@b.c',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        provider: ProvidersEnum.LINEUP,
        status: StatusEnum.ACTIVE,
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
