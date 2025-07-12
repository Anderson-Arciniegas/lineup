import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { I18nModule } from '@lineup/i18n';

@Component({
  selector: 'lib-category-item',
  imports: [CommonModule, I18nModule],
  templateUrl: './category-item.html',
  styleUrl: './category-item.scss',
})
export class CategoryItem {
  @Input() category?: { id: number; name: string };
  @Input() myBusiness?: boolean = false;
}
