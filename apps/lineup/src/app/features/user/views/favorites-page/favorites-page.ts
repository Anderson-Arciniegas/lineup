import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BusinessCard, ProductCard } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-favorites-page',
  imports: [CommonModule, ProductCard, BusinessCard, TranslateModule],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
})
export class FavoritesPage {
  products: any[] | undefined = [
    {
      id: 1,
      name: 'Product 1',
      image: 'product1.jpg',
      price: 100,
      inventoryStatus: 'in-stock',
    },
    {
      id: 2,
      name: 'Product 2',
      image: 'product2.jpg',
      price: 200,
      inventoryStatus: 'out-of-stock',
    },
    {
      id: 3,
      name: 'Product 3',
      image: 'product3.jpg',
      price: 300,
      inventoryStatus: 'low-stock',
    },
    {
      id: 4,
      name: 'Product 1',
      image: 'product1.jpg',
      price: 100,
      inventoryStatus: 'in-stock',
    },
    {
      id: 5,
      name: 'Product 2',
      image: 'product2.jpg',
      price: 200,
      inventoryStatus: 'out-of-stock',
    },
    {
      id: 6,
      name: 'Product 3',
      image: 'product3.jpg',
      price: 300,
      inventoryStatus: 'low-stock',
    },
    {
      id: 7,
      name: 'Product 1',
      image: 'product1.jpg',
      price: 100,
      inventoryStatus: 'in-stock',
    },
    {
      id: 8,
      name: 'Product 2',
      image: 'product2.jpg',
      price: 200,
      inventoryStatus: 'out-of-stock',
    },
    {
      id: 9,
      name: 'Product 3',
      image: 'product3.jpg',
      price: 300,
      inventoryStatus: 'low-stock',
    },
  ];
}
