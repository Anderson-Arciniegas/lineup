import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProductTags } from "../product-tags/product-tags";

@Component({
  selector: 'lib-product-description',
  imports: [CommonModule, ProductTags],
  templateUrl: './product-description.html',
  styleUrl: './product-description.scss',
})
export class ProductDescription {
  tags = ['New', 'NFL', 'Shirt', 'Futbol Americano', 'Ravens', 'Nike'];
  
}
