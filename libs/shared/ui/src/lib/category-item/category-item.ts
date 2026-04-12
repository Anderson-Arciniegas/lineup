import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/** Ítem de categoría en grillas o filtros; `myBusiness` altera estilos de interacción. */
@Component({
  selector: 'lib-category-item',
  imports: [CommonModule, TranslateModule],
  templateUrl: './category-item.html',
  styleUrl: './category-item.scss',
})
export class CategoryItem {
  @Input() category?: { id: number; name: string };
  @Input() myBusiness?: boolean = false;
}
