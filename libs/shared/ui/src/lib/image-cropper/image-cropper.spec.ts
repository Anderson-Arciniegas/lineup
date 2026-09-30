import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService, UtilsService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ImageCropper } from './image-cropper';

describe('ImageCropper', () => {
  let component: ImageCropper;
  let fixture: ComponentFixture<ImageCropper>;
  let dialogRef: { close: jest.Mock };
  let utilsService: { compressImage: jest.Mock };
  let toast: { error: jest.Mock };
  let probeWidth: number;
  let probeHeight: number;
  let OriginalImage: typeof Image;

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    utilsService = {
      compressImage: jest.fn(() => of('data:image/png;base64,abc')),
    };
    toast = { error: jest.fn() };
    probeWidth = 800;
    probeHeight = 600;
    OriginalImage = global.Image;
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    global.Image = class MockImage {
      onload: ((ev: Event) => unknown) | null = null;
      onerror: ((ev: Event) => unknown) | null = null;
      naturalWidth = 0;
      naturalHeight = 0;
      set src(_value: string) {
        this.naturalWidth = probeWidth;
        this.naturalHeight = probeHeight;
        this.onload?.(new Event('load'));
      }
    } as unknown as typeof Image;

    await TestBed.configureTestingModule({
      imports: [ImageCropper, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: UtilsService, useValue: utilsService },
        { provide: ToastService, useValue: toast },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(ImageCropper, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ImageCropper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    global.Image = OriginalImage;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('fileChangeEvent', () => {
    it('debe ignorar input sin archivos', () => {
      const event = { target: { files: [] } } as unknown as Event;
      component.fileChangeEvent(event);
      expect(component.selectedFile).toBeNull();
    });

    it('debe asignar archivo válido seleccionado', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const input = { files: [file], value: 'test.png' };
      const event = { target: input } as unknown as Event;
      component.fileChangeEvent(event);
      expect(component.selectedFile).toBe(file);
      expect(component.imageOrientation).toBe('landscape');
      expect(input.value).toBe('');
    });

    it('debe manejar target null', () => {
      component.fileChangeEvent({ target: null } as unknown as Event);
      expect(component.selectedFile).toBeNull();
    });

    it('debe mostrar toast y cerrar el modal con tipo inválido', () => {
      const file = new File([''], 'doc.pdf', { type: 'application/pdf' });
      const input = { files: [file], value: 'doc.pdf' };
      const event = { target: input } as unknown as Event;
      component.fileChangeEvent(event);
      expect(component.selectedFile).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('errors.file.invalidImageType');
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    it('debe marcar isDragging en dragenter y limpiarlo en dragleave', () => {
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;

      component.onDragEnter(event);
      expect(component.isDragging).toBe(true);

      component.onDragLeave(event);
      expect(component.isDragging).toBe(false);
    });

    it('onDragOver debe prevenir el default', () => {
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { dropEffect: '' },
      } as unknown as DragEvent;

      component.onDragOver(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.dataTransfer?.dropEffect).toBe('copy');
    });

    it('onDrop debe cargar la imagen arrastrada', () => {
      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent;

      component.isDragging = true;
      component.onDrop(event);
      expect(component.isDragging).toBe(false);
      expect(component.selectedFile).toBe(file);
    });

    it('onDrop con tipo inválido debe cerrar con toast', () => {
      const file = new File(['x'], 'file.txt', { type: 'text/plain' });
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent;

      component.onDrop(event);
      expect(toast.error).toHaveBeenCalledWith('errors.file.invalidImageType');
      expect(dialogRef.close).toHaveBeenCalled();
      expect(component.selectedFile).toBeNull();
    });
  });

  it('debe guardar imagen recortada en imageCropped', () => {
    component.imageCropped({
      objectUrl: 'blob:test',
    } as import('ngx-image-cropper').ImageCroppedEvent);
    expect(component.croppedImage).toBe('blob:test');
  });

  it('debe comprimir y cerrar al guardar recorte', () => {
    component.croppedImage = 'blob:test';
    component.saveCrop();
    expect(utilsService.compressImage).toHaveBeenCalledWith('blob:test');
    expect(dialogRef.close).toHaveBeenCalledWith('data:image/png;base64,abc');
  });

  it('no debe guardar sin imagen recortada', () => {
    component.croppedImage = undefined as unknown as string;
    component.saveCrop();
    expect(utilsService.compressImage).not.toHaveBeenCalled();
  });

  it('debe cerrar al cancelar', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  describe('pasos y zoom', () => {
    it('debe avanzar y retroceder pasos', () => {
      expect(component.step).toBe(1);
      component.nextStep();
      expect(component.step).toBe(2);
      component.previousStep();
      expect(component.step).toBe(1);
    });

    it('debe hacer zoom in y out', () => {
      component.zoomIn();
      expect(component.scale).toBeCloseTo(1.1);
      expect(component.transform.scale).toBeCloseTo(1.1);
      component.zoomOut();
      expect(component.scale).toBeCloseTo(1.0);
    });
  });

  describe('rotación y volteo', () => {
    it('debe rotar a la izquierda e intercambiar flip', () => {
      component.transform = { flipH: true, flipV: false };
      component.rotateLeft();
      expect(component.canvasRotation).toBe(-1);
      expect(component.transform.flipH).toBe(false);
      expect(component.transform.flipV).toBe(true);
    });

    it('debe rotar a la derecha', () => {
      component.rotateRight();
      expect(component.canvasRotation).toBe(1);
    });

    it('debe voltear horizontal y vertical', () => {
      component.flipHorizontal();
      expect(component.transform.flipH).toBe(true);
      component.flipVertical();
      expect(component.transform.flipV).toBe(true);
    });
  });

  it('debe invocar callbacks de carga sin error', () => {
    expect(() =>
      component.imageLoaded({} as import('ngx-image-cropper').LoadedImage),
    ).not.toThrow();
    expect(() => component.cropperReady()).not.toThrow();
  });

  it('applySelectedFile debe marcar portrait si la imagen es más alta', () => {
    probeWidth = 400;
    probeHeight = 800;
    const file = new File([''], 'tall.png', { type: 'image/png' });
    component.applySelectedFile(file);
    expect(component.imageOrientation).toBe('portrait');
    expect(component.selectedFile).toBe(file);
  });

  it('applySelectedFile debe marcar landscape si la imagen es más ancha', () => {
    probeWidth = 1200;
    probeHeight = 600;
    const file = new File([''], 'wide.png', { type: 'image/png' });
    component.applySelectedFile(file);
    expect(component.imageOrientation).toBe('landscape');
    expect(component.selectedFile).toBe(file);
    // Alto fijo 250 → ancho preview = 250 * (1200/600) = 500
    expect(component.landscapeDisplayWidth).toBe(500);
  });

  it('landscape muy ancha debe ampliar el preview hasta el tope del viewport', () => {
    probeWidth = 4000;
    probeHeight = 500;
    component.applySelectedFile(
      new File([''], 'panorama.png', { type: 'image/png' }),
    );
    expect(component.imageOrientation).toBe('landscape');
    expect(component.landscapeDisplayWidth).toBeGreaterThan(500);
    expect(component.landscapeDisplayWidth).toBeLessThanOrEqual(
      Math.floor(window.innerWidth * 0.92) - 64,
    );
  });

  it('portrait no debe fijar landscapeDisplayWidth', () => {
    probeWidth = 400;
    probeHeight = 800;
    component.applySelectedFile(
      new File([''], 'tall.png', { type: 'image/png' }),
    );
    expect(component.imageOrientation).toBe('portrait');
    expect(component.landscapeDisplayWidth).toBeNull();
  });

  it('al rotar 90° debe intercambiar portrait y landscape', () => {
    probeWidth = 1200;
    probeHeight = 600;
    component.applySelectedFile(
      new File([''], 'wide.png', { type: 'image/png' }),
    );
    expect(component.imageOrientation).toBe('landscape');
    component.rotateRight();
    expect(component.imageOrientation).toBe('portrait');
  });

  it('loadImageFailed debe mostrar toast y cerrar el modal', () => {
    component.selectedFile = new File([''], 'x.png', { type: 'image/png' });
    component.loadImageFailed();
    expect(toast.error).toHaveBeenCalledWith('errors.file.invalidImageType');
    expect(dialogRef.close).toHaveBeenCalled();
    expect(component.selectedFile).toBeNull();
  });
});
