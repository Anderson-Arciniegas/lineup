import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { ProductVariations } from '../product-variations/product-variations';

@Component({
  selector: 'lib-product-details',
  imports: [
    CommonModule,
    Button,
    PanelModule,
    MenuModule,
    ProductVariations,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  colors = [
      { name: 'Red', primary: false},
      { name: 'Blue', primary: false},
      { name: 'Green', primary: true },
      { name: 'Yellow', primary: false}
  ];

  sizes = [
    { name: 'S', primary: false },
    { name: 'M', primary: false },
    { name: 'L', primary: true },
    { name: 'XL', primary: false }
  ];

  shipping = [
    { name: 'Delivery', primary: false },
    { name: 'MRW', primary: false },
    { name: 'Zoom', primary: true },
  ];

  variations = [
    { title: 'Color', variations: this.colors }, 
    { title: 'Size', variations: this.sizes },
    { title: 'Shipping', variations: this.shipping }
  ];

  tags = ['New', 'NFL', 'Shirt', 'Futbol Americano', 'Ravens', 'Nike'];
}
