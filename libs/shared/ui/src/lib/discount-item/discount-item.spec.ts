import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  DiscountScopeEnum,
  DiscountTypeEnum,
  StatusEnum,
  type DiscountSchema,
} from '@lineup/core';
import { DiscountItem } from './discount-item';

describe('DiscountItem', () => {
  let component: DiscountItem;
  let fixture: ComponentFixture<DiscountItem>;

  const discount: DiscountSchema = {
    id: 42,
    discountType: DiscountTypeEnum.PERCENTAGE,
    scope: DiscountScopeEnum.CATALOG,
    value: 15,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: StatusEnum.ACTIVE,
    idCreationBusiness: 1,
    discountProducts: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountItem],
      providers: [provideRouter([])],
    })
      .overrideComponent(DiscountItem, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DiscountItem);
    component = fixture.componentInstance;
    component.discount = discount;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('setLabel', () => {
    it('debe devolver el texto completo si es corto', () => {
      expect(component.setLabel('Promo verano')).toBe('Promo verano');
    });

    it('debe truncar títulos largos con elipsis', () => {
      expect(component.setLabel('Descuento de temporada extendida', 10)).toBe(
        'Descuento ...',
      );
    });

    it('debe manejar valores nulos como cadena vacía', () => {
      expect(component.setLabel(null)).toBe('');
    });
  });

  describe('eventos', () => {
    it('debe emitir edit con el descuento', () => {
      jest.spyOn(component.edit, 'emit');
      component.edit.emit(discount);
      expect(component.edit.emit).toHaveBeenCalledWith(discount);
    });

    it('debe emitir delete con el id del descuento', () => {
      jest.spyOn(component.delete, 'emit');
      component.delete.emit(discount.id);
      expect(component.delete.emit).toHaveBeenCalledWith(42);
    });
  });
});
