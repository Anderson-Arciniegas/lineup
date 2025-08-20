import {
  CommonModule
} from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { FormsModule } from '@angular/forms';
import { Button } from "../button/button";

@Component({
  selector: 'lib-create-catalog-card',
  imports: [
    CommonModule,
    CardModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    IftaLabelModule,
    FormsModule,
    Button
],
  templateUrl: './create-catalog-card.html',
  styleUrl: './create-catalog-card.scss',
})
export class CreateCatalogCard {
    @Input() width = 'w-72';
    @Input() height = 'h-96';
    visible = false;
    catalogName = '';
    isDragging = false;
    previewUrl: string | null = null;

    createCatalog() {
      this.visible = true;
    }

    enterCreateCatalog() {
      return;
    }

    onFileSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        this.handleFile(input.files[0]);
      }
    }

    onDragOver(event: DragEvent) {
      event.preventDefault();
      this.isDragging = true;
    }

    onDragLeave(event: DragEvent) {
      event.preventDefault();
      this.isDragging = false;
    }

    onDrop(event: DragEvent) {
      event.preventDefault();
      this.isDragging = false;
      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        this.handleFile(event.dataTransfer.files[0]);
      }
    }

    handleFile(file: File) {
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten imágenes');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
}
