import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  DiscountScopeEnum,
  DiscountTypeEnum,
  StatusEnum,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BusinessCard } from './business-card';

describe('BusinessCard', () => {
  let component: BusinessCard;
  let fixture: ComponentFixture<BusinessCard>;

  const business = {
    id: 1,
    name: 'Tienda',
    followers: 2500,
    discounts: [
      {
        scope: DiscountScopeEnum.BUSINESS,
        status: StatusEnum.ACTIVE,
        discountType: DiscountTypeEnum.PERCENTAGE,
      },
      {
        scope: DiscountScopeEnum.PRODUCT,
        status: StatusEnum.ACTIVE,
        discountType: DiscountTypeEnum.FIXED,
      },
    ],
  } as unknown as import('@lineup/core').BusinessSchema;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessCard, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(BusinessCard, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessCard);
    component = fixture.componentInstance;
    component.business = business;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe asignar imagen placeholder en ngOnInit', () => {
    expect(component.image).toBeTruthy();
    expect(component.images).toContain(component.image);
  });

  it('debe detectar descuento activo de negocio', () => {
    expect(component.discount).toBeTruthy();
    expect(component.discount.scope).toBe(DiscountScopeEnum.BUSINESS);
  });

  it('debe manejar negocio sin descuentos', () => {
    component.business = { ...business, discounts: [] } as typeof business;
    component.ngOnInit();
    expect(component.discount).toBeUndefined();
  });

  describe('formatFollowers', () => {
    it('debe devolver 0 para valores inválidos', () => {
      expect(component.formatFollowers(null as unknown as number)).toBe('0');
      expect(component.formatFollowers(-5)).toBe('0');
    });

    it('debe formatear miles', () => {
      expect(component.formatFollowers(2500)).toBe('2.5 m');
      expect(component.formatFollowers(3000)).toBe('3 m');
    });

    it('debe formatear millones', () => {
      expect(component.formatFollowers(1_200_000)).toBe('1.2 M');
    });

    it('debe devolver número sin formatear bajo 1000', () => {
      expect(component.formatFollowers(999)).toBe('999');
    });
  });
});
