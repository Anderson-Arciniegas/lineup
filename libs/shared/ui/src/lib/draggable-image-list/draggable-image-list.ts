import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-draggable-image-list',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag],
  templateUrl: './draggable-image-list.html',
  styleUrl: './draggable-image-list.scss',
})
export class DraggableImageList {
  /** Array de URLs o rutas de imágenes a mostrar */
  images = input.required<string[]>();
  imageCodes = input.required<string[]>();
  /** Emite el nuevo array cuando se reordena o se elimina una imagen */
  imagesChange = output<{ urls: string[]; imageCodes: string[] }>();

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
