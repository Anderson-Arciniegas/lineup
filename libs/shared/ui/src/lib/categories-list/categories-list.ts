import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CategoryItem } from '../category-item/category-item';

/** Contenedor que repite `CategoryItem` para una colección de categorías. */
@Component({
  selector: 'lib-categories-list',
  imports: [CommonModule, CategoryItem],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.scss',
})
export class CategoriesList {
  @Input() categories: { id: number; name: string }[];
  @Input() myBusiness = false;
}
