import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'lib-product-tags',
  imports: [CommonModule, TagModule],
  templateUrl: './product-tags.html',
  styleUrl: './product-tags.scss',
})
export class ProductTags {
  @Input() tags: string[] = [];
}
