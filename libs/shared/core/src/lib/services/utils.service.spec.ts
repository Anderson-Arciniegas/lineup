import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DOC_ORIENTATION, NgxImageCompressService } from 'ngx-image-compress';
import { firstValueFrom, of } from 'rxjs';
import { DiscountTypeEnum } from '../enums';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;
  let router: jest.Mocked<Pick<Router, 'navigate'>>;
  let imageCompress: jest.Mocked<Pick<NgxImageCompressService, 'compressFile'>>;
  let documentMock: { location: { href: string } };

  beforeEach(() => {
    router = { navigate: jest.fn().mockResolvedValue(true) };
    imageCompress = {
      compressFile: jest.fn().mockResolvedValue('compressed-base64'),
    };
    documentMock = { location: { href: '' } };

    TestBed.configureTestingModule({
      providers: [
        UtilsService,
        { provide: Router, useValue: router },
        { provide: NgxImageCompressService, useValue: imageCompress },
        { provide: DOCUMENT, useValue: documentMock },
      ],
    });
    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exposes document', () => {
    expect(service.document).toBe(documentMock);
  });

  it('navigate filters empty segments and delegates to router', async () => {
    await service.navigate(['a', '', 'b']);
    expect(router.navigate).toHaveBeenCalledWith(['a', 'b'], undefined);
  });

  it('redirect sets location href', () => {
    service.redirect('https://example.com');
    expect(documentMock.location.href).toBe('https://example.com');
  });

  it('blobToFile adds file metadata', () => {
    const blob = new Blob(['x'], { type: 'text/plain' });
    const file = service.blobToFile(blob, 'test.txt');
    expect(file.name).toBe('test.txt');
    expect((file as File & { lastModifiedDate?: Date }).lastModifiedDate).toBeInstanceOf(Date);
  });

  it('getExtensionFile extracts mime extension', () => {
    const ext = service.getExtensionFile('data:image/png;base64,abc');
    expect(ext).toBe('png');
  });

  it('passwordsMatchValidator returns null when passwords match', () => {
    const form = new FormGroup({
      password: new FormControl('a'),
      confirmPassword: new FormControl('a'),
    });
    expect(service.passwordsMatchValidator(form)).toBeNull();
  });

  it('passwordsMatchValidator returns error when passwords differ', () => {
    const form = new FormGroup({
      password: new FormControl('a'),
      confirmPassword: new FormControl('b'),
    });
    expect(service.passwordsMatchValidator(form)).toEqual({
      passwordsMismatch: true,
    });
  });

  it('handleError does not throw', () => {
    expect(() => service.handleError({ error: { code: 500 } })).not.toThrow();
  });

  it('windowInnerWidth returns a number', () => {
    expect(typeof service.windowInnerWidth()).toBe('number');
  });

  it('normalizeSpaces trims and collapses spaces', () => {
    expect(service.normalizeSpaces('  hello   world  ')).toBe('hello world');
  });

  it('trimForm trims string controls except telephone', () => {
    const form = new FormGroup({
      name: new FormControl('  foo  '),
      telephone: new FormControl(' 123 '),
    });
    service.trimForm(form);
    expect(form.get('name')?.value).toBe('foo');
    expect(form.get('telephone')?.value).toBe(' 123 ');
  });

  it('compressImage delegates to NgxImageCompressService', async () => {
    const result = await firstValueFrom(service.compressImage('img'));
    expect(result).toBe('compressed-base64');
    expect(imageCompress.compressFile).toHaveBeenCalledWith(
      'img',
      DOC_ORIENTATION.NotDefined,
      75,
      80,
    );
  });

  it('formatWhatsappPhone builds whatsapp url', () => {
    const href = service.formatWhatsappPhone('+58 412-000', 'hi');
    expect(href).toContain('https://api.whatsapp.com/send');
    expect(href).toContain('phone=58412000');
    expect(href).toContain('text=hi');
  });

  it('formatPriceWithDiscount applies percentage discount', () => {
    const price = service.formatPriceWithDiscount(
      { price: 100, idCurrency: 1 } as never,
      { discountType: DiscountTypeEnum.PERCENTAGE, value: 10 } as never,
      { dollar: 1, euro: 1 } as never,
    );
    expect(price).toBe(90);
  });

  it('formatPriceWithDiscount returns null without sku price', () => {
    expect(
      service.formatPriceWithDiscount(
        { price: null } as never,
        { value: 10 } as never,
        { dollar: 1, euro: 1 } as never,
      ),
    ).toBeNull();
  });

  it('formatPriceWithDiscount returns sku price without discount', () => {
    expect(
      service.formatPriceWithDiscount(
        { price: 50, idCurrency: 1 } as never,
        null as never,
        { dollar: 1, euro: 1 } as never,
      ),
    ).toBe(50);
  });

  it('formatPriceWithDiscount applies fixed discount with same currency', () => {
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 1 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 20, idCurrency: 1 } as never,
        { dollar: 36, euro: 40 } as never,
      ),
    ).toBe(80);
  });

  it('formatPriceWithDiscount converts discount currencies', () => {
    const rates = { dollar: 36, euro: 40 } as never;
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 1 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 36, idCurrency: 2 } as never,
        rates,
      ),
    ).toBe(99);
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 1 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 40, idCurrency: 3 } as never,
        rates,
      ),
    ).toBeCloseTo(55.56, 1);
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 2 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 2, idCurrency: 3 } as never,
        rates,
      ),
    ).toBe(20);
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 2 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 1, idCurrency: 1 } as never,
        rates,
      ),
    ).toBe(64);
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 3 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 36, idCurrency: 1 } as never,
        rates,
      ),
    ).toBeCloseTo(67.6, 1);
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 3 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 40, idCurrency: 2 } as never,
        rates,
      ),
    ).toBe(99);
  });

  it('formatPriceWithDiscount returns original price for unknown currency pair', () => {
    expect(
      service.formatPriceWithDiscount(
        { price: 100, idCurrency: 99 } as never,
        { discountType: DiscountTypeEnum.FIXED, value: 10, idCurrency: 1 } as never,
        { dollar: 36, euro: 40 } as never,
      ),
    ).toBe(100);
  });

  it('windowInnerWidth returns 0 on server platform', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UtilsService,
        { provide: Router, useValue: router },
        { provide: NgxImageCompressService, useValue: imageCompress },
        { provide: DOCUMENT, useValue: documentMock },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const serverService = TestBed.inject(UtilsService);
    expect(serverService.windowInnerWidth()).toBe(0);
  });

  it('normalizeSpaces returns non-string values unchanged', () => {
    expect(service.normalizeSpaces(null as never)).toBeNull();
    expect(service.normalizeSpaces(42 as never)).toBe(42);
  });

  it('trimForm keeps non-string control values', () => {
    const form = new FormGroup({
      count: new FormControl(5),
    });
    service.trimForm(form);
    expect(form.get('count')?.value).toBe(5);
  });

  it('navigate passes navigation extras to router', async () => {
    const extras = { queryParams: { q: '1' } };
    await service.navigate(['path'], extras);
    expect(router.navigate).toHaveBeenCalledWith(['path'], extras);
  });
});
