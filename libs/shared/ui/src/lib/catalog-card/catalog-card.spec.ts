import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  DiscountScopeEnum,
  DiscountTypeEnum,
  StatusEnum,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CatalogCard } from './catalog-card';

describe('CatalogCard', () => {
  let component: CatalogCard;
  let fixture: ComponentFixture<CatalogCard>;

  const catalogWithImage = {
    id: 1,
    title: 'Catálogo',
    path: 'cat-1',
    image: { url: 'https://example.com/catalog.jpg' },
    discounts: [
      {
        scope: DiscountScopeEnum.CATALOG,
        status: StatusEnum.ACTIVE,
        discountType: DiscountTypeEnum.PERCENTAGE,
      },
    ],
  } as import('@lineup/core').CatalogSchema;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCard, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCard);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe asignar imagen aleatoria si el catálogo no tiene portada', () => {
    component.catalog = { id: 2, title: 'Sin imagen' } as typeof catalogWithImage;
    component.ngOnInit();
    expect(component.image).toBeTruthy();
    expect(component.images).toContain(component.image);
  });

  it('debe resolver descuento activo de alcance catálogo', () => {
    component.catalog = catalogWithImage;
    component.ngOnInit();
    expect(component.discount).toBeTruthy();
    expect(component.discount.scope).toBe(DiscountScopeEnum.CATALOG);
  });

  it('debe ignorar descuentos inactivos o de otro alcance', () => {
    component.catalog = {
      ...catalogWithImage,
      discounts: [
        {
          scope: DiscountScopeEnum.CATALOG,
          status: StatusEnum.INACTIVE,
          discountType: DiscountTypeEnum.PERCENTAGE,
        },
        {
          scope: DiscountScopeEnum.PRODUCT,
          status: StatusEnum.ACTIVE,
          discountType: DiscountTypeEnum.PERCENTAGE,
        },
      ],
    } as typeof catalogWithImage;
    component.ngOnInit();
    expect(component.discount).toBeUndefined();
  });

  it('debe aceptar inputs de layout', () => {
    component.width = 'w-full';
    component.height = 'h-64';
    component.editMode = true;
    component.dashboardMode = true;
    fixture.detectChanges();
    expect(component.width).toBe('w-full');
    expect(component.editMode).toBe(true);
  });
});
