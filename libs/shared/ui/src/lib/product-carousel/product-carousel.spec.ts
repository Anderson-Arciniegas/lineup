import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ProductCarousel } from './product-carousel';

jest.mock('gsap', () => ({
  gsap: { to: jest.fn() },
}));

describe('ProductCarousel', () => {
  let component: ProductCarousel;
  let fixture: ComponentFixture<ProductCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCarousel],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    })
      .overrideComponent(ProductCarousel, {
        set: { template: '<div class="carousel-item"></div><div class="carousel-item"></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProductCarousel);
    component = fixture.componentInstance;
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 80,
    });
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe posicionar ítems en ngAfterViewInit', async () => {
    const { gsap } = await import('gsap');
    await component.positionItems();
    expect(gsap.to).toHaveBeenCalled();
  });

  it('debe rotar a la izquierda', async () => {
    const offsetBefore = component.offset;
    component.rotateLeft();
    expect(component.offset).toBeLessThan(offsetBefore);
  });

  it('debe rotar a la derecha', async () => {
    const offsetBefore = component.offset;
    component.rotateRight();
    expect(component.offset).toBeGreaterThan(offsetBefore);
  });
});

describe('ProductCarousel SSR', () => {
  it('no debe posicionar ítems fuera del navegador', async () => {
    const { gsap } = await import('gsap');
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ProductCarousel],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    })
      .overrideComponent(ProductCarousel, { set: { template: '' } })
      .compileComponents();

    const fixture = TestBed.createComponent(ProductCarousel);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    await cmp.positionItems();
    expect(gsap.to).not.toHaveBeenCalled();
  });
});
