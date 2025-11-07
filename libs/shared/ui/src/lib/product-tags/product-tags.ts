import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

export interface ProductTag {
  label: string;
  color?: string; // Color de fondo del tag
  textColor?: string; // Color del texto
}

@Component({
  selector: 'lib-product-tags',
  imports: [
    CommonModule,
    TagModule,
  ],
  templateUrl: './product-tags.html',
  styleUrl: './product-tags.scss',
})
export class ProductTags {
  @Input() tags: (string | ProductTag)[] = [];

  // Método helper para convertir strings a ProductTag
  asProductTag(tag: string | ProductTag): ProductTag {
    if (typeof tag === 'string') {
      return { label: tag };
    }
    return tag;
  }
}
  