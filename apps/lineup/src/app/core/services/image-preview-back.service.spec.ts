import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ImagePreviewBackService } from './image-preview-back.service';

describe('ImagePreviewBackService', () => {
  let service: ImagePreviewBackService;
  let pushState: jest.SpyInstance;
  let back: jest.SpyInstance;

  beforeEach(() => {
    pushState = jest.spyOn(history, 'pushState').mockImplementation(() => undefined);
    back = jest.spyOn(history, 'back').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(ImagePreviewBackService);
  });

  afterEach(() => {
    document.querySelectorAll('.p-image-mask').forEach((mask) => mask.remove());
    pushState.mockRestore();
    back.mockRestore();
  });

  it('pushState al abrir preview', () => {
    const closer = jest.fn();
    service.onPreviewShow(closer);
    expect(service.isOpen).toBe(true);
    expect(pushState).toHaveBeenCalled();
  });

  it('history.back al ocultar desde la UI', () => {
    service.onPreviewShow(jest.fn());
    service.onPreviewHide();
    expect(service.isOpen).toBe(false);
    expect(back).toHaveBeenCalled();
  });

  it('closeIfOpen invoca el closer', () => {
    const closer = jest.fn();
    service.onPreviewShow(closer);
    expect(service.closeIfOpen()).toBe(true);
    expect(closer).toHaveBeenCalled();
  });

  it('closeIfOpen false si no hay preview', () => {
    expect(service.closeIfOpen()).toBe(false);
  });

  it('limpia el overlay sin navegar al abandonar la vista', () => {
    const mask = document.createElement('div');
    mask.className = 'p-image-mask';
    document.body.appendChild(mask);
    const closer = jest.fn();
    service.onPreviewShow(closer);

    service.closeForNavigation();

    expect(closer).toHaveBeenCalled();
    expect(service.isOpen).toBe(false);
    expect(document.querySelector('.p-image-mask')).toBeNull();
    expect(back).not.toHaveBeenCalled();
  });
});
