import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

export interface ProductTag {
  value: string;
  severity?: 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast';
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
  @Input() tags: ProductTag[] = [];
}
  