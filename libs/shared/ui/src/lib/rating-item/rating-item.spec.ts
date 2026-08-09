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

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe devolver null sin datos de ruta del producto', () => {
    expect(component.productUrl).toBeNull();
    expect(component.productImageUrl).toBeUndefined();
  });

  it('debe construir URL pública del producto', () => {
    component.rating = {
      ...component.rating,
      product: {
        id: 10,
        title: 'Test',
        business: { path: 'tienda' },
        catalog: { path: 'cat-1' },
        productFiles: [{ file: { url: 'https://img.test/p.jpg' } }],
      } as never,
    };
    expect(component.productUrl).toBe('/tienda/cat-1/10');
    expect(component.productImageUrl).toBe('https://img.test/p.jpg');
  });
});
