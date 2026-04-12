import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductCard } from "../product-card/product-card";

/**
 * Sandbox / demo de UI compartida (categorías de ejemplo y campo de búsqueda) para Storybook o pruebas locales.
 */
@Component({
  selector: 'lib-ui',
  imports: [
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    ProductCard
],
  templateUrl: './ui.html',
  styleUrl: './ui.css',
})
export class Ui {
  public readonly categories = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Camisas' },
    { id: 3, name: 'Pantalones' },
    { id: 4, name: 'Chaquetas' },
    { id: 5, name: 'Zapatos' },
    { id: 6, name: 'Accesorios' },
    { id: 7, name: 'Ropa Interior' },
  ];
  value: '';
}
