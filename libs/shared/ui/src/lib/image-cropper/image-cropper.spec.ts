import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilsService } from '@lineup/core';
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

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    utilsService = {
      compressImage: jest.fn(() => of('data:image/png;base64,abc')),
    };

    await TestBed.configureTestingModule({
      imports: [ImageCropper, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: UtilsService, useValue: utilsService },
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

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('fileChangeEvent', () => {
    it('debe ignorar input sin archivos', () => {
      const event = { target: { files: [] } } as unknown as Event;
      component.fileChangeEvent(event);
      expect(component.imageChangedEvent).toBeNull();
    });

    it('debe propagar evento con archivo válido', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const input = { files: [file] };
      const event = { target: input } as unknown as Event;
      component.fileChangeEvent(event);
      expect(component.imageChangedEvent).toBe(event);
    });

    it('debe manejar target null', () => {
      component.fileChangeEvent({ target: null } as unknown as Event);
      expect(component.imageChangedEvent).toBeNull();
    });
  });

  it('debe guardar imagen recortada en imageCropped', () => {
    component.imageCropped({ objectUrl: 'blob:test' } as import('ngx-image-cropper').ImageCroppedEvent);
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
    expect(() => component.imageLoaded({} as import('ngx-image-cropper').LoadedImage)).not.toThrow();
    expect(() => component.cropperReady()).not.toThrow();
    expect(() => component.loadImageFailed()).not.toThrow();
  });
});
