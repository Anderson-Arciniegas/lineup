import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductTags } from './product-tags';

describe('ProductTags', () => {
  let component: ProductTags;
  let fixture: ComponentFixture<ProductTags>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTags],
      providers: [provideRouter([])],
    })
      .overrideComponent(ProductTags, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductTags);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe iniciar con arreglo de tags vacío', () => {
    expect(component.tags).toEqual([]);
  });

  it('debe aceptar una lista de tags por input', () => {
    component.tags = ['Nuevo', 'Oferta', 'Destacado'];
    fixture.detectChanges();
    expect(component.tags).toEqual(['Nuevo', 'Oferta', 'Destacado']);
    expect(component.tags).toHaveLength(3);
  });

  it('debe permitir reemplazar tags en actualizaciones posteriores', () => {
    component.tags = ['A'];
    fixture.detectChanges();
    component.tags = ['B', 'C'];
    fixture.detectChanges();
    expect(component.tags).toEqual(['B', 'C']);
  });
});
