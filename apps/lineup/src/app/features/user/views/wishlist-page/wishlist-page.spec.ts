import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductPublicService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { WishlistPage } from './wishlist-page';

describe('WishlistPage', () => {
  let component: WishlistPage;
  let fixture: ComponentFixture<WishlistPage>;
  let findLikedProducts: jest.Mock;

  beforeEach(async () => {
    findLikedProducts = jest.fn(() =>
      of({
        items: [{ id: 1, title: 'P1', productFiles: [] }],
        page: 1,
        limit: 20,
        total: 1,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [WishlistPage, TranslateModule.forRoot()],
      providers: [
        {
          provide: ProductPublicService,
          useValue: { findLikedProducts },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistPage);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('debe crear y cargar productos', () => {
    expect(component).toBeTruthy();
    expect(findLikedProducts).toHaveBeenCalled();
    expect(component.products.length).toBe(1);
  });

  it('onScroll solicita más resultados', () => {
    component.onScroll();
    expect(findLikedProducts).toHaveBeenCalledTimes(2);
  });

  it('no debe cargar si attempt está activo', () => {
    component.attempt = true;
    component.getFavoritesProducts();
    expect(findLikedProducts).toHaveBeenCalledTimes(1);
  });
});

describe('WishlistPage errores', () => {
  it('debe resetear attempt en error', async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistPage, TranslateModule.forRoot()],
      providers: [
        {
          provide: ProductPublicService,
          useValue: {
            findLikedProducts: () => throwError(() => new Error('fail')),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(WishlistPage);
    fix.componentInstance.getFavoritesProducts();
    expect(fix.componentInstance.attempt).toBe(false);
  });
});
