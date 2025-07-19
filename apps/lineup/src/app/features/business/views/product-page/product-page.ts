import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProductBreadcrumb, ProductInfo } from '@lineup/ui';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-product-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    ProductInfo
  ],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  business = { name: 'Tu Punto vShop', image: 'assets/images/vShop.jpg' };
}
