import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { ProductVariations } from './product-variations';

describe('ProductVariations', () => {
  let component: ProductVariations;
  let fixture: ComponentFixture<ProductVariations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariations, TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore],
    })
      .overrideComponent(ProductVariations, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductVariations);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', ['black', 'white', 'black']);
    component.title = 'variations.color';
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe deduplicar opciones en optionLabels', () => {
    const labels = component.optionLabels();
    expect(labels).toHaveLength(2);
    expect(labels.map((l) => l.option)).toEqual(['black', 'white']);
  });

  it('debe resolver etiqueta i18n para colores', () => {
    expect(component.getOptionLabel('black')).toBe('colors.black');
  });

  it('debe devolver hex para color conocido', () => {
    const black = component.getColor('black');
    expect(black).toBeTruthy();
  });

  it('debe devolver null para color desconocido', () => {
    expect(component.getColor('unknown')).toBeNull();
  });

  it('debe normalizar opciones', () => {
    expect(component.normalizeOption('  M  ')).toBe('M');
    expect(component.normalizeOption(null)).toBe('');
  });

  describe('ensureSelection', () => {
    it('debe limpiar selección si no hay opciones', () => {
      fixture.componentRef.setInput('options', []);
      component.selectedOption = 'black';
      component.ngOnChanges();
      expect(component.selectedOption).toBeNull();
    });

    it('debe mantener selección válida', () => {
      component.selectedOption = 'black';
      component.ngOnChanges();
      expect(component.selectedOption).toBe('black');
    });

    it('debe invalidar selección fuera de opciones', () => {
      component.selectedOption = 'XL';
      component.ngOnChanges();
      expect(component.selectedOption).toBeNull();
    });

    it('no debe imponer default si selectedOption es null', () => {
      component.selectedOption = null;
      component.ngOnChanges();
      expect(component.selectedOption).toBeNull();
    });
  });

  describe('selectOption', () => {
    it('debe emitir al seleccionar opción distinta', () => {
      const emitted: string[] = [];
      component.selectedOptionChange.subscribe((v) => emitted.push(v));
      component.selectOption('white');
      expect(component.selectedOption).toBe('white');
      expect(emitted).toEqual(['white']);
    });

    it('no debe emitir si la opción ya está seleccionada', () => {
      component.selectedOption = 'black';
      const emitted: string[] = [];
      component.selectedOptionChange.subscribe((v) => emitted.push(v));
      component.selectOption('black');
      expect(emitted).toHaveLength(0);
    });
  });

  it('debe resolver etiqueta de talla', () => {
    expect(component.getOptionLabel('M')).toBe('M');
  });

  it('debe devolver la opción cruda si no es color ni talla', () => {
    expect(component.getOptionLabel('custom-value')).toBe('custom-value');
  });
});
