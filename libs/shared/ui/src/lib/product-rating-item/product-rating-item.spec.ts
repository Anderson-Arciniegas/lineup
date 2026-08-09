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

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe usar username como nombre visible', () => {
    expect(component.creatorDisplayName).toBe('testuser');
  });

  it('debe concatenar nombre y apellido sin username', () => {
    component.rating = {
      ...component.rating,
      creationUser: {
        ...component.rating.creationUser!,
        username: '',
      },
    };
    expect(component.creatorDisplayName).toBe('Test User');
  });

  it('debe devolver undefined sin imagen de perfil', () => {
    expect(component.creatorProfileImageUrl).toBeUndefined();
  });

  it('debe devolver URL de avatar recortada', () => {
    component.rating = {
      ...component.rating,
      creationUser: {
        ...component.rating.creationUser!,
        profileImage: { url: '  https://cdn.test/avatar.png  ' } as never,
      },
    };
    expect(component.creatorProfileImageUrl).toBe('https://cdn.test/avatar.png');
  });

  it('debe ignorar URL de avatar vacía', () => {
    component.rating = {
      ...component.rating,
      creationUser: {
        ...component.rating.creationUser!,
        profileImage: { url: '   ' } as never,
      },
    };
    expect(component.creatorProfileImageUrl).toBeUndefined();
  });
});
