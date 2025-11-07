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
  tags: (string | ProductTag)[] = [
    { label: 'New', color: '#22c55e', textColor: '#ffffff' },        // Verde
    { label: 'NFL', color: '#3b82f6', textColor: '#ffffff' },        // Azul
    { label: 'Shirt', color: '#a855f7', textColor: '#ffffff' },      // Morado
    { label: 'Futbol Americano', color: '#f97316', textColor: '#ffffff' }, // Naranja
    { label: 'Ravens', color: '#8b5cf6', textColor: '#ffffff' },     // Morado oscuro
    { label: 'Nike', color: '#ef4444', textColor: '#ffffff' }        // Rojo
  ];
  
}
