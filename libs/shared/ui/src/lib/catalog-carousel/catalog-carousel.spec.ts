import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductSchema } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { CatalogCarousel } from './catalog-carousel';

jest.mock('fast-average-color', () => ({
  FastAverageColor: jest.fn().mockImplementation(() => ({
    getColorAsync: jest.fn().mockResolvedValue({ rgba: 'rgba(100, 100, 100, 1)' }),
  })),
}));

describe('CatalogCarousel', () => {
  let component: CatalogCarousel;
  let fixture: ComponentFixture<CatalogCarousel>;

  const products = [
    {
      productFiles: [{ file: { url: 'https://example.com/image.jpg' } }],
    },
    {
      productFiles: [{ file: { url: 'https://example.com/image2.jpg' } }],
    },
  ] as unknown as ProductSchema[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCarousel, TranslateModule.forRoot()],
      providers: [provideRouter([]), TranslateService, TranslateStore],
    })
      .overrideComponent(CatalogCarousel, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CatalogCarousel);
    component = fixture.componentInstance;
    component.products = products;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe invocar onPage en ngAfterViewInit', () => {
    jest.spyOn(component, 'onPage');
    component.ngAfterViewInit();
    expect(component.onPage).toHaveBeenCalledWith({ page: 0 });
  });

  it('no debe calcular color con predefinedColor activo', () => {
    jest.spyOn(component.setColor, 'emit');
    component.predefinedColor = true;
    component.onPage({ page: 0 });
    expect(component.setColor.emit).not.toHaveBeenCalled();
  });

  it('debe calcular color de fondo al cambiar página', async () => {
    jest.spyOn(component.setColor, 'emit');
    const originalImage = global.Image;
    global.Image = class {
      crossOrigin = '';
      onload: (() => void) | null = null;
      set src(_value: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    } as unknown as typeof Image;

    component.onPage({ page: 0 });
    await new Promise((r) => setTimeout(r, 10));

    expect(component.bgColor).toContain('rgba');
    expect(component.setColor.emit).toHaveBeenCalled();
    global.Image = originalImage;
  });

  it('debe tolerar producto sin URL de imagen', async () => {
    component.products = [{ productFiles: [{ file: {} }] }] as ProductSchema[];
    expect(() => component.onPage({ page: 0 })).not.toThrow();
  });

  it('debe aceptar useLightText como input', () => {
    component.useLightText = true;
    fixture.detectChanges();
    expect(component.useLightText).toBe(true);
  });
});
