import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { Button } from '../button/button';
import { ProductVariations } from '../product-variations/product-variations';

@Component({
  selector: 'lib-product-details',
  imports: [CommonModule, Button, PanelModule, MenuModule, ProductVariations],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  colors = [
    { name: 'Red', primary: false },
    { name: 'Blue', primary: false },
    { name: 'Green', primary: true },
    { name: 'Yellow', primary: false },
  ];

  sizes = [
    { name: 'S', primary: false },
    { name: 'M', primary: false },
    { name: 'L', primary: true },
    { name: 'XL', primary: false },
  ];

  shipping = [
    { name: 'Delivery', primary: false },
    { name: 'MRW', primary: false },
    { name: 'Zoom', primary: true },
  ];

  variations = [
    { title: 'Color', variations: this.colors },
    { title: 'Size', variations: this.sizes },
    { title: 'Shipping', variations: this.shipping },
  ];

  tags = ['New', 'NFL', 'Shirt', 'Futbol Americano', 'Ravens', 'Nike'];

  href =
    'https://wa.me/584121574223?text=Hola%20quiero%20informacion%20del%20producto%20Laptop%20Gamer%20ASUS';
}
