import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { ProductVariations } from '../product-variations/product-variations';
import { ProductTags } from '../product-tags/product-tags';

@Component({
  selector: 'lib-product-details',
  imports: [
    CommonModule,
    Button,
    PanelModule,
    MenuModule,
    ProductVariations,
    ProductTags
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
  ]
  variations = [
    { title: 'Color', variations: this.colors }, 
    { title: 'Size', variations: this.sizes }
  ];
  tags = ['New', 'NFL', 'Shirt', 'Futbol Americano', 'Ravens', 'Nike'];
}
