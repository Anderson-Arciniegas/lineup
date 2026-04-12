import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilsService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageTransform,
  LoadedImage,
} from 'ngx-image-cropper';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';

/**
 * Recorte de imagen con `ngx-image-cropper`: al guardar comprime con `UtilsService` y cierra el diálogo con base64.
 */
@Component({
  selector: 'lib-image-cropper',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, Button, TranslateModule],
  templateUrl: './image-cropper.html',
  styleUrls: ['./image-cropper.scss'],
})
export class ImageCropper {
  imageChangedEvent: Event | null = null;
  croppedImage: string;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  format: string;
  step = 1;
  sanitizer = inject(DomSanitizer);
  ref = inject(DynamicDialogRef);

  private _utilsService = inject(UtilsService);
  private _subscription: Subscription = new Subscription();

  /** Propaga el evento nativo del `<input type="file">` al cropper. */
  fileChangeEvent(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) {
      this.imageChangedEvent = null;
      return;
    }
    // ngx-image-cropper accepts the native change event
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
    // this.imageCroppedEvent.emit(this.croppedImage);
  }

  imageLoaded(image: LoadedImage) {
    void image;
    // show cropper
  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    // show message
  }

  /** Comprime y devuelve la imagen recortada al padre vía `DynamicDialogRef.close`. */
  saveCrop() {
    if (this.croppedImage) {
      this._subscription.add(
        this._utilsService
          .compressImage(this.croppedImage)
          .subscribe((compressImage) => {
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
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
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
