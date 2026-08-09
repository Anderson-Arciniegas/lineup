import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import type { BusinessSchema, CatalogSchema, ProductSchema } from '../schemas';
import { SEO_SITE_ORIGIN, SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        Title,
        Meta,
        { provide: DOCUMENT, useValue: document },
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: SEO_SITE_ORIGIN, useValue: 'https://lineup.test' },
      ],
    });
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setMetaTags updates title and meta tags', () => {
    service.setMetaTags({
      title: 'Page title',
      description: '<p>Hello world</p>',
      imageUrl: '/img.png',
      keywords: ['a', 'b'],
      canonicalPathOrUrl: '/page',
      ogType: 'website',
    });
    expect(title.getTitle()).toBe('Page title');
    expect(meta.getTag('name="description"')?.content).toContain('Hello world');
    expect(meta.getTag('property="og:title"')?.content).toBe('Page title');
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://lineup.test/img.png',
    );
  });

  it('setProductPage builds product meta', () => {
    const product = {
      id: 1,
      title: 'Product',
      description: 'Desc',
      business: { name: 'Biz', path: 'biz' },
      catalog: { path: 'cat', title: 'Cat' },
      productTags: [{ tag: { name: 'tag1' } }],
      productFiles: [{ order: 0, file: { url: 'https://cdn/img.jpg' } }],
    } as ProductSchema;

    service.setProductPage(product, 'biz');
    expect(title.getTitle()).toContain('Product');
    expect(meta.getTag('property="og:type"')?.content).toBe('product');
  });

  it('setBusinessPage builds business meta', () => {
    const business = {
      name: 'Biz',
      path: 'biz',
      description: 'About',
      image: { url: 'https://cdn/biz.jpg' },
      tags: ['food'],
    } as BusinessSchema;

    service.setBusinessPage(business);
    expect(title.getTitle()).toBe('Biz');
    expect(meta.getTag('property="og:url"')?.content).toBe(
      'https://lineup.test/biz',
    );
  });

  it('setCatalogPage builds catalog meta', () => {
    const business = {
      name: 'Biz',
      path: 'biz',
      image: { url: 'https://cdn/biz.jpg' },
    } as BusinessSchema;
    const catalog = {
      title: 'Catalog',
      path: 'cat',
      tags: ['x'],
    } as CatalogSchema;

    service.setCatalogPage(business, catalog);
    expect(title.getTitle()).toContain('Catalog');
    expect(meta.getTag('property="og:url"')?.content).toBe(
      'https://lineup.test/biz/cat',
    );
  });

  it('setMetaTags uses browser origin and handles optional fields', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        Title,
        Meta,
        { provide: DOCUMENT, useValue: document },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const browserService = TestBed.inject(SeoService);
    const browserTitle = TestBed.inject(Title);
    const browserMeta = TestBed.inject(Meta);

    browserService.setMetaTags({
      title: 'Browser page',
      description: 'x'.repeat(400),
      imageUrl: 'https://cdn/img.jpg',
      keywords: 'a,b',
      canonicalPathOrUrl: 'page',
      ogType: 'product',
    });
    expect(browserTitle.getTitle()).toBe('Browser page');
    expect(browserMeta.getTag('property="og:image"')?.content).toBe(
      'https://cdn/img.jpg',
    );
    expect(browserMeta.getTag('name="twitter:card"')?.content).toBe(
      'summary_large_image',
    );
  });

  it('setMetaTags without site origin keeps relative urls', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        Title,
        Meta,
        { provide: DOCUMENT, useValue: document },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const noOriginService = TestBed.inject(SeoService);
    noOriginService.setMetaTags({
      title: 'Relative',
      imageUrl: '/img.png',
      canonicalPathOrUrl: '/page',
    });
    expect(TestBed.inject(Meta).getTag('property="og:image"')?.content).toBe(
      '/img.png',
    );
  });

  it('setProductPage without catalog path or business name', () => {
    const product = {
      id: 9,
      title: 'Solo',
      subtitle: 'Sub',
      productFiles: [],
    } as ProductSchema;
    service.setProductPage(product, 'shop');
    expect(title.getTitle()).toBe('Solo');
    expect(meta.getTag('property="og:url"')?.content).toBe(
      'https://lineup.test/shop/9',
    );
  });

  it('setBusinessPage uses business name when description is empty', () => {
    const business = {
      name: 'OnlyName',
      path: 'only',
      tags: [],
    } as BusinessSchema;
    service.setBusinessPage(business);
    expect(meta.getTag('name="description"')?.content).toBe('OnlyName');
  });

  it('setCatalogPage falls back to business image', () => {
    const business = {
      name: 'Biz',
      path: 'biz',
      image: { url: 'https://cdn/biz.jpg' },
    } as BusinessSchema;
    const catalog = {
      title: 'Catalog',
      path: 'cat',
      tags: [],
    } as CatalogSchema;
    service.setCatalogPage(business, catalog);
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://cdn/biz.jpg',
    );
  });
});
