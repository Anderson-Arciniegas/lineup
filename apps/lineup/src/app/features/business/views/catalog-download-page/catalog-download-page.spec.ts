import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  BusinessPublicService,
  CatalogPublicService,
  ProductPublicService,
} from '@lineup/core';
import { of } from 'rxjs';
import { CatalogDownloadPage } from './catalog-download-page';

describe('CatalogDownloadPage', () => {
  let component: CatalogDownloadPage;
  let fixture: ComponentFixture<CatalogDownloadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogDownloadPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                business: 'test-business',
                catalogPath: 'test-catalog',
              },
              queryParams: {},
            },
          },
        },
        {
          provide: BusinessPublicService,
          useValue: { findBusinessByPath: () => of({ id: 1, name: 'Test' }) },
        },
        {
          provide: CatalogPublicService,
          useValue: {
            findOneCatalogByPath: () => of({ id: 1, title: 'Cat' }),
          },
        },
        {
          provide: ProductPublicService,
          useValue: { getAllByCatalog: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogDownloadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * En SSR no se ejecuta la generación PDF (`loadAndDownload` sale temprano).
   */
  describe('entorno servidor', () => {
    it('no debe marcar generación completada en servidor', () => {
      expect(component.isDone).toBe(false);
    });
  });

  /**
   * Particionado de productos para maquetación PDF (grid/list).
   */
  describe('pdfProductPageChunks', () => {
    beforeEach(() => {
      Object.defineProperty(document.documentElement, 'clientWidth', {
        configurable: true,
        value: 1400,
      });
    });

    it('debe devolver un chunk vacío si no hay productos', () => {
      component.products = [];
      expect(component.pdfProductPageChunks).toEqual([[]]);
    });

    it('debe agrupar productos según el modo de layout', () => {
      component.layoutMode = 'Grid';
      component.products = [{ id: 1 }, { id: 2 }, { id: 3 }] as any[];
      const chunks = component.pdfProductPageChunks;
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      expect(chunks.flat().length).toBe(3);
    });
  });
});

describe('CatalogDownloadPage query layout', () => {
  it('debe activar layout List desde queryParams', async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogDownloadPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { business: 'b', catalogPath: 'c' },
              queryParams: { layout: 'List' },
            },
          },
        },
        {
          provide: BusinessPublicService,
          useValue: { findBusinessByPath: () => of({ id: 1 }) },
        },
        {
          provide: CatalogPublicService,
          useValue: { findOneCatalogByPath: () => of({ id: 1 }) },
        },
        {
          provide: ProductPublicService,
          useValue: { getAllByCatalog: () => of([]) },
        },
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(CatalogDownloadPage);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.layoutMode).toBe('List');
  });
});

describe('CatalogDownloadPage browser', () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1400,
    });
  });

  async function setupBrowser(
    catalog: Record<string, unknown> = { id: 1, title: 'Cat' },
    business: Record<string, unknown> = { id: 1, name: 'Biz' },
  ) {
    await TestBed.configureTestingModule({
      imports: [CatalogDownloadPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { business: 'b', catalogPath: 'c' },
              queryParams: {},
            },
          },
        },
        {
          provide: BusinessPublicService,
          useValue: { findBusinessByPath: () => of(business) },
        },
        {
          provide: CatalogPublicService,
          useValue: { findOneCatalogByPath: () => of(catalog) },
        },
        {
          provide: ProductPublicService,
          useValue: {
            getAllByCatalog: () =>
              of([{ id: 1, title: 'P1' }, { id: 2, title: 'P2' }]),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(CatalogDownloadPage);
    return fix;
  }

  it('pdfCardHeight debe ser constante', async () => {
    const fix = await setupBrowser();
    expect(fix.componentInstance.pdfCardHeight).toBe('h-100');
  });

  it('pdfPageMinHeight calcula altura según viewport', async () => {
    const fix = await setupBrowser();
    const h = fix.componentInstance.pdfPageMinHeight;
    expect(h.endsWith('px')).toBe(true);
    expect(parseInt(h, 10)).toBeGreaterThan(0);
  });

  it('layout List cambia chunks por página', async () => {
    const fix = await setupBrowser();
    const cmp = fix.componentInstance;
    cmp.layoutMode = 'List';
    cmp.products = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })) as any[];
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1400,
    });
    expect(cmp.pdfProductPageChunks.flat().length).toBe(5);
  });

  it('brandToneLight depende del fondo oscuro', async () => {
    const fix = await setupBrowser();
    const cmp = fix.componentInstance;
    cmp.pageBackgroundGradient = 'linear-gradient(black, black)';
    cmp.isDarkBackground = true;
    expect(cmp.brandToneLight).toBe(true);
  });
});
