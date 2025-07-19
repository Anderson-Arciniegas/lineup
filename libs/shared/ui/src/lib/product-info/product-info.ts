import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

import { ProductDescription } from '../product-description/product-description';
import { ProductDetails } from '../product-details/product-details';

@Component({
  selector: 'lib-product-info',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductDescription,
    ProductDetails
  ],
  templateUrl: './product-info.html',
  styleUrl: './product-info.scss',
})
export class ProductInfo {
}
