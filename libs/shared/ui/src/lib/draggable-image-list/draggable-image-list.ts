import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

/**
 * Lista de imágenes con drag-and-drop (CDK) para reordenar y botón de eliminar;
 * emite `urls` y `imageCodes` sincronizados.
 */
@Component({
  selector: 'lib-draggable-image-list',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, ProgressSpinner],
  templateUrl: './draggable-image-list.html',
  styleUrl: './draggable-image-list.scss',
})
export class DraggableImageList {
  /** URLs o rutas de vista previa mostradas en la lista. */
  images = input.required<string[]>();
  imageCodes = input.required<string[]>();
  loadingFile = input.required<boolean>();
  /** Emite el nuevo orden o lista tras reordenar o borrar. */
  imagesChange = output<{ urls: string[]; imageCodes: string[] }>();

  /** Reordena `images` e `imageCodes` en paralelo tras soltar un ítem. */
  drop(event: CdkDragDrop<string[]>): void {
    const currentImages = [...this.images()];
    const currentImageCodes = [...this.imageCodes()];
    moveItemInArray(currentImages, event.previousIndex, event.currentIndex);
    moveItemInArray(currentImageCodes, event.previousIndex, event.currentIndex);
    this.imagesChange.emit({
      urls: currentImages,
      imageCodes: currentImageCodes,
    });
  }

  /** Quita la imagen en el índice indicado y emite el estado actualizado. */
  removeImage(index: number): void {
    const currentImages = [...this.images()];
    const currentImageCodes = [...this.imageCodes()];
    currentImages.splice(index, 1);
    currentImageCodes.splice(index, 1);
    this.imagesChange.emit({
      urls: currentImages,
      imageCodes: currentImageCodes,
    });
  }
}
