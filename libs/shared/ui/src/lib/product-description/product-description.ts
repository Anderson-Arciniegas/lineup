import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProductTags, ProductTag } from "../product-tags/product-tags";

@Component({
  selector: 'lib-product-description',
  imports: [CommonModule, ProductTags],
  templateUrl: './product-description.html',
  styleUrl: './product-description.scss',
})
export class ProductDescription {
  tags: ProductTag[] = [
    { value: 'New', severity: 'success' },
    { value: 'NFL', severity: 'info' },
    { value: 'Shirt', severity: 'secondary' },
    { value: 'Futbol Americano', severity: 'warning' },
    { value: 'Ravens', severity: 'danger' },
    { value: 'Nike', severity: 'contrast' }
  ];
  
}
