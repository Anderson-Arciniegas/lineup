import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService, UtilsService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageTransform,
  LoadedImage,
} from 'ngx-image-cropper';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';

/** Tipos MIME aceptados por `ngx-image-cropper` (alineado con su validación interna). */
const ACCEPTED_IMAGE_TYPE =
  /^image\/(png|jpg|jpeg|heic|bmp|gif|tiff|svg|webp|x-icon|vnd\.microsoft\.icon)/i;

/** Eje fijo del preview (portrait→ancho, landscape→alto). */
const CROPPER_FIXED_AXIS_PX = 250;
/** Ancho por defecto del DynamicDialog al abrir el cropper. */
const DIALOG_WIDTH_DEFAULT_PX = 640;
/** Padding horizontal aproximado del diálogo (contenido + márgenes). */
const DIALOG_HORIZONTAL_PADDING_PX = 64;
/** Tope del ancho del diálogo respecto al viewport. */
const DIALOG_MAX_VIEWPORT_RATIO = 0.92;

/**
 * Recorte de imagen con `ngx-image-cropper`: al guardar comprime con `UtilsService` y cierra el diálogo con base64.
 * Soporta selección por clic y arrastrar-soltar desde el explorador de archivos.
 */
@Component({
  selector: 'lib-image-cropper',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, Button, TranslateModule],
  templateUrl: './image-cropper.html',
  styleUrls: ['./image-cropper.scss'],
})
export class ImageCropper {
  /** Archivo listo para el cropper (clic o drop). */
  selectedFile: File | null = null;
  /** Feedback visual mientras se arrastra un archivo sobre la zona. */
  isDragging = false;
  croppedImage: string;
  canvasRotation = 0;
  rotation = 0;
  /** Escala normal: la imagen se ve a tamaño cómodo; el usuario puede hacer zoom. */
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = { scale: 1 };
  format: string;
  step = 1;
  /**
   * Orientación de la imagen fuente:
   * - portrait (alto ≥ ancho): ancho fijo 250px
   * - landscape (ancho > alto): alto fijo 250px
   */
  imageOrientation: 'portrait' | 'landscape' | null = null;
  /** Ancho de preview landscape (alto fijo 250px × aspect ratio), o null. */
  landscapeDisplayWidth: number | null = null;
  /** Remonta el cropper cuando cambia el eje fijo (p. ej. al rotar). */
  cropperKey = 0;
  sanitizer = inject(DomSanitizer);
  ref = inject(DynamicDialogRef);

  private readonly _utilsService = inject(UtilsService);
  private readonly _toast = inject(ToastService);
  private readonly _ngZone = inject(NgZone);
  private readonly _host = inject(ElementRef<HTMLElement>);
  private readonly _dialogConfig = inject(DynamicDialogConfig, {
    optional: true,
  });
  private _subscription: Subscription = new Subscription();
  /** Contador para no parpadear `isDragging` al cruzar hijos del dropzone. */
  private _dragDepth = 0;
  private sourceWidth = 0;
  private sourceHeight = 0;

  /**
   * Propaga el evento del `<input type="file">` al cropper.
   * Si el tipo no es válido, muestra toast, cierra el modal y no deja la UI vacía.
   */
  fileChangeEvent(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) {
      return;
    }

    this.applySelectedFile(input.files[0]);
    input.value = '';
  }

  /** Necesario para permitir el drop (el navegador cancela el default). */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._dragDepth++;
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._dragDepth = Math.max(0, this._dragDepth - 1);
    if (this._dragDepth === 0) {
      this.isDragging = false;
    }
  }

  /** Toma la primera imagen soltada y la carga en el cropper. */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._dragDepth = 0;
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    this.applySelectedFile(file);
  }

  /**
   * Valida el archivo, resuelve orientación antes de montar el cropper
   * (evita overlay a 0px por cambio de CSS tras el init) y lo muestra.
   */
  applySelectedFile(file: File): void {
    if (!this.isAcceptedImageType(file.type)) {
      this.handleInvalidImage();
      return;
    }
    this.scale = 1;
    this.transform = { ...this.transform, scale: this.scale };
    this.canvasRotation = 0;
    this.imageOrientation = null;
    this.landscapeDisplayWidth = null;
    this.selectedFile = null;
    this.step = 1;
    this.applyDialogWidth(DIALOG_WIDTH_DEFAULT_PX);

    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      this._ngZone.run(() => {
        this.sourceWidth = probe.naturalWidth;
        this.sourceHeight = probe.naturalHeight;
        URL.revokeObjectURL(objectUrl);
        this.refreshOrientation();
        this.cropperKey++;
        this.selectedFile = file;
      });
    };
    probe.onerror = () => {
      this._ngZone.run(() => {
        URL.revokeObjectURL(objectUrl);
        this.handleInvalidImage();
      });
    };
    probe.src = objectUrl;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
  }

  imageLoaded(_image: LoadedImage) {
    // Orientación ya fijada en applySelectedFile; el cropper monta con CSS correcto.
  }

  cropperReady() {
    // cropper ready
  }

  /** ngx-image-cropper emite esto si el archivo no se pudo cargar (p. ej. tipo inválido). */
  loadImageFailed() {
    this.handleInvalidImage();
  }

  /** Toast en español y cierre del diálogo de recorte. */
  private handleInvalidImage(): void {
    this.selectedFile = null;
    this.croppedImage = undefined as unknown as string;
    this.imageOrientation = null;
    this.landscapeDisplayWidth = null;
    this.step = 1;
    this.isDragging = false;
    this._dragDepth = 0;
    this._toast.error('errors.file.invalidImageType');
    this.ref.close();
  }

  private isAcceptedImageType(type: string): boolean {
    return ACCEPTED_IMAGE_TYPE.test(type ?? '');
  }

  /**
   * Portrait → ancho 250px; landscape → alto 250px.
   * Tiene en cuenta rotaciones de 90°/270° del canvas.
   * Remonta el cropper si cambia el eje fijo para recalcular el overlay.
   * En landscape ensancha el modal según la proporción de la imagen.
   */
  private refreshOrientation(): void {
    if (!this.sourceWidth || !this.sourceHeight) {
      return;
    }
    const { width, height } = this.effectiveSourceSize();
    const next: 'portrait' | 'landscape' =
      height >= width ? 'portrait' : 'landscape';
    if (this.imageOrientation && this.imageOrientation !== next) {
      this.cropperKey++;
    }
    this.imageOrientation = next;
    this.syncDialogWidth(width, height, next);
  }

  /** Tamaño lógico tras rotaciones de 90°/270°. */
  private effectiveSourceSize(): { width: number; height: number } {
    const swapped = Math.abs(this.canvasRotation % 2) === 1;
    return {
      width: swapped ? this.sourceHeight : this.sourceWidth,
      height: swapped ? this.sourceWidth : this.sourceHeight,
    };
  }

  /**
   * Landscape muy ancho → el diálogo crece (tope 92vw) para que quepa
   * el preview a 250px de alto sin comprimir el ancho.
   */
  private syncDialogWidth(
    width: number,
    height: number,
    orientation: 'portrait' | 'landscape',
  ): void {
    const maxDialogPx = Math.floor(
      window.innerWidth * DIALOG_MAX_VIEWPORT_RATIO,
    );
    let dialogPx = DIALOG_WIDTH_DEFAULT_PX;
    this.landscapeDisplayWidth = null;

    if (orientation === 'landscape' && height > 0) {
      const naturalDisplayW = Math.round(
        CROPPER_FIXED_AXIS_PX * (width / height),
      );
      const maxContentPx = Math.max(
        CROPPER_FIXED_AXIS_PX,
        maxDialogPx - DIALOG_HORIZONTAL_PADDING_PX,
      );
      this.landscapeDisplayWidth = Math.min(naturalDisplayW, maxContentPx);
      dialogPx = Math.max(
        DIALOG_WIDTH_DEFAULT_PX,
        this.landscapeDisplayWidth + DIALOG_HORIZONTAL_PADDING_PX,
      );
    }

    this.applyDialogWidth(Math.min(dialogPx, maxDialogPx));
  }

  private applyDialogWidth(widthPx: number): void {
    const width = `${widthPx}px`;
    if (this._dialogConfig) {
      this._dialogConfig.width = width;
    }
    const dialog = this._host.nativeElement.closest(
      '.p-dialog',
    ) as HTMLElement | null;
    if (dialog) {
      dialog.style.width = width;
      dialog.style.maxWidth = `${DIALOG_MAX_VIEWPORT_RATIO * 100}vw`;
    }
  }

  /** Comprime y devuelve la imagen recortada al padre vía `DynamicDialogRef.close`. */
  saveCrop() {
    if (this.croppedImage) {
      this._subscription.add(
        this._utilsService
          .compressImage(this.croppedImage)
          .subscribe((compressImage: string) => {
            this.ref.close(compressImage);
          }),
      );
    }
  }

  onCancel() {
    this.ref.close();
  }

  nextStep() {
    this.step++;
  }

  previousStep() {
    this.step--;
  }

  zoomOut() {
    this.scale -= 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  zoomIn() {
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  /**
   * handle rotate left
   *
   * @memberof DialogImageCropperComponent
   */
  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
    this.refreshOrientation();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
    this.refreshOrientation();
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }
}
